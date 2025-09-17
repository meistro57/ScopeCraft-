const TelescopeDesigner = require('../app');

describe('TelescopeDesigner', () => {
  const originalURL = global.URL;
  const originalCreateObjectURL = originalURL && originalURL.createObjectURL;
  const originalRevokeObjectURL = originalURL && originalURL.revokeObjectURL;
  const originalBlob = global.Blob;

  let createObjectURLMock;
  let revokeObjectURLMock;

  beforeEach(() => {
    document.body.innerHTML = '';

    createObjectURLMock = jest.fn(() => 'blob:mock');
    revokeObjectURLMock = jest.fn();

    if (originalURL) {
      originalURL.createObjectURL = createObjectURLMock;
      originalURL.revokeObjectURL = revokeObjectURLMock;
      global.URL = originalURL;
    } else {
      global.URL = {
        createObjectURL: createObjectURLMock,
        revokeObjectURL: revokeObjectURLMock
      };
    }
    window.URL = global.URL;

    class MockBlob {
      constructor(parts, options = {}) {
        this.parts = parts;
        this.type = options.type;
      }
    }

    global.Blob = MockBlob;
    window.Blob = MockBlob;
    delete window.makerjs;
    delete window.MakerJs;
    delete window.require;
  });

  afterAll(() => {
    if (originalURL) {
      originalURL.createObjectURL = originalCreateObjectURL;
      originalURL.revokeObjectURL = originalRevokeObjectURL;
      global.URL = originalURL;
      window.URL = originalURL;
    } else {
      delete global.URL;
      delete window.URL;
    }
    global.Blob = originalBlob;
    window.Blob = originalBlob;
  });

  function setupDom() {
    document.body.innerHTML = `
      <input id="diameter" type="range" value="200" />
      <span id="diameterValue"></span>
      <input id="focalLength" type="range" value="1000" />
      <span id="focalValue"></span>
      <select id="opticalType">
        <option value="refractor">Refractor</option>
        <option value="newtonian">Newtonian</option>
      </select>
      <select id="mount">
        <option value="dobsonian">Dobsonian</option>
        <option value="altaz">Alt-Az</option>
      </select>
      <input id="orientation" type="range" value="0" />
      <span id="orientationValue"></span>
      <input id="color" type="color" value="#000000" />
      <select id="eyepiece"></select>
      <input id="finder" type="checkbox" checked />
      <a id="downloadLink" href=""></a>
      <div id="svgContainer"></div>
      <span id="metric-focalRatio"></span>
      <span id="metric-magnification"></span>
      <span id="metric-trueField"></span>
      <span id="metric-exitPupil"></span>
      <span id="metric-lightGathering"></span>
      <span id="metric-resolution"></span>
      <span id="metric-maxMagnification"></span>
    `;

    const downloadLink = document.getElementById('downloadLink');
    let storedHref = '';
    Object.defineProperty(downloadLink, 'href', {
      configurable: true,
      enumerable: true,
      get() {
        return storedHref;
      },
      set(value) {
        storedHref = value;
      }
    });
  }

  function createMakerJsStub() {
    return {
      models: {
        Rectangle: jest.fn((width, height) => ({ kind: 'Rectangle', width, height }))
      },
      paths: {
        Circle: jest.fn((center, radius) => ({ kind: 'Circle', center, radius })),
        Line: jest.fn((start, end) => ({ kind: 'Line', start, end }))
      },
      model: {
        move: jest.fn((shape, offset) => ({ ...shape, movedBy: offset })),
        rotate: jest.fn()
      },
      exporter: {
        toSVG: jest.fn(() => '<svg></svg>')
      }
    };
  }

  function createDesigner() {
    setupDom();
    const makerjs = createMakerJsStub();
    window.makerjs = makerjs;
    const designer = new TelescopeDesigner();
    return { designer, makerjs };
  }

  test('createModel builds refractor with finder and dobsonian base', () => {
    const { designer, makerjs } = createDesigner();
    makerjs.model.rotate.mockClear();

    const model = designer.createModel();

    expect(model.models.tube).toEqual({ kind: 'Rectangle', width: 100, height: 10 });
    expect(model.models.finder).toEqual({ kind: 'Rectangle', width: 20, height: 1, movedBy: [40, 10] });
    expect(model.paths.aperture).toEqual({ kind: 'Circle', center: [100, 5], radius: 5 });
    expect(model.models.base).toEqual({ kind: 'Rectangle', width: 20, height: 5, movedBy: [40, -5] });
    expect(makerjs.model.rotate).toHaveBeenCalledWith(model, 0, [0, 0]);
  });

  test('createModel builds newtonian without finder and alt-az mount', () => {
    const { designer, makerjs } = createDesigner();

    designer.options.opticalType = 'newtonian';
    designer.options.showFinder = false;
    designer.options.mount = 'altaz';
    designer.options.orientation = 45;

    makerjs.model.rotate.mockClear();

    const model = designer.createModel();

    expect(model.models.finder).toBeUndefined();
    expect(model.paths.primary).toEqual({ kind: 'Circle', center: [0, 5], radius: 5 });
    expect(model.paths.secondary).toEqual({ kind: 'Circle', center: [80, 5], radius: 2.5 });
    expect(model.paths.mount).toEqual({ kind: 'Line', start: [50, -5], end: [50, -10] });
    expect(makerjs.model.rotate).toHaveBeenCalledWith(model, 45, [0, 0]);
  });

  test('updateModel exports svg and refreshes download link', () => {
    const { designer, makerjs } = createDesigner();

    const previousHref = 'blob:previous';
    designer.downloadLink.href = previousHref;
    const expectedRevoked = designer.downloadLink.href;

    makerjs.exporter.toSVG.mockClear();
    makerjs.model.rotate.mockClear();
    createObjectURLMock.mockClear();
    revokeObjectURLMock.mockClear();

    designer.updateModel();

    expect(revokeObjectURLMock).toHaveBeenCalledWith(expectedRevoked);
    expect(makerjs.exporter.toSVG).toHaveBeenCalledWith(expect.any(Object), { stroke: designer.options.color, fill: 'none' });
    expect(designer.svgContainer.innerHTML).toBe('<svg></svg>');
    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    const blobArg = createObjectURLMock.mock.calls[0][0];
    expect(blobArg).toBeInstanceOf(Blob);
    expect(blobArg.parts).toEqual(['<svg></svg>']);
    expect(blobArg.type).toBe('image/svg+xml');
    expect(designer.downloadLink.href).toBe(createObjectURLMock.mock.results[0].value);
  });

  test('metrics panel displays derived values for default configuration', () => {
    createDesigner();

    expect(document.getElementById('metric-focalRatio').textContent).toBe('f/5.0');
    expect(document.getElementById('metric-magnification').textContent).toBe('40×');
    expect(document.getElementById('metric-trueField').textContent).toBe('1.25°');
    expect(document.getElementById('metric-exitPupil').textContent).toBe('5.0 mm');
    expect(document.getElementById('metric-lightGathering').textContent).toBe('816× human eye');
    expect(document.getElementById('metric-resolution').textContent).toBe('0.58″');
    expect(document.getElementById('metric-maxMagnification').textContent).toBe('400×');
  });
});
