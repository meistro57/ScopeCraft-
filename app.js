class TelescopeDesigner {
  constructor() {
      this.options = {
        diameter: 200,
        focalLength: 1000,
        opticalType: 'refractor',
        mount: 'dobsonian',
        orientation: 0,
        color: '#000000',
        showFinder: true
      };
    this.svgContainer = document.getElementById('svgContainer');
    this.downloadLink = document.getElementById('downloadLink');
    this.makerjs = window.makerjs || window.MakerJs;
    if (!this.makerjs && typeof window.require === 'function') {
      try {
        this.makerjs = window.require('makerjs');
      } catch (e) {
        /* ignore */
      }
    }
    if (!this.makerjs) {
      throw new Error('Maker.js library not found');
    }
    this.initControls();
    this.updateModel();
  }

  initControls() {
    const diameterInput = document.getElementById('diameter');
    const focalInput = document.getElementById('focalLength');
    const opticalSelect = document.getElementById('opticalType');
    const mountSelect = document.getElementById('mount');
    const orientationInput = document.getElementById('orientation');
    const colorInput = document.getElementById('color');
    const finderInput = document.getElementById('finder');
    const diameterValue = document.getElementById('diameterValue');
    const focalValue = document.getElementById('focalValue');
    const orientationValue = document.getElementById('orientationValue');

    const syncValues = () => {
      diameterValue.textContent = this.options.diameter + ' mm';
      focalValue.textContent = this.options.focalLength + ' mm';
      orientationValue.textContent = this.options.orientation + '°';
    };

    diameterInput.addEventListener('input', e => {
      this.options.diameter = parseInt(e.target.value, 10);
      syncValues();
      this.updateModel();
    });

    focalInput.addEventListener('input', e => {
      this.options.focalLength = parseInt(e.target.value, 10);
      syncValues();
      this.updateModel();
    });

    opticalSelect.addEventListener('change', e => {
      this.options.opticalType = e.target.value;
      this.updateModel();
    });

    mountSelect.addEventListener('change', e => {
      this.options.mount = e.target.value;
      this.updateModel();
    });

    orientationInput.addEventListener('input', e => {
      this.options.orientation = parseInt(e.target.value, 10);
      syncValues();
      this.updateModel();
    });

    colorInput.addEventListener('input', e => {
      this.options.color = e.target.value;
      this.updateModel();
    });

    finderInput.addEventListener('change', e => {
      this.options.showFinder = e.target.checked;
      this.updateModel();
    });

    syncValues();
  }

  createModel() {
    const m = this.makerjs.models;
    const p = this.makerjs.paths;
    const model = { models: {}, paths: {} };

    const scale = 0.1;
    const length = this.options.focalLength * scale;
    const diameter = this.options.diameter * scale * 0.5;

    model.models.tube = new m.Rectangle(length, diameter);

    if (this.options.showFinder) {
      const finder = new m.Rectangle(length * 0.2, diameter * 0.1);
      model.models.finder = this.makerjs.model.move(finder, [length * 0.4, diameter]);
    }

    if (this.options.opticalType === 'refractor') {
      model.paths.aperture = new p.Circle([length, diameter / 2], diameter / 2);
    } else {
      model.paths.primary = new p.Circle([0, diameter / 2], diameter / 2);
      model.paths.secondary = new p.Circle([length * 0.8, diameter / 2], diameter / 4);
    }

    if (this.options.mount === 'dobsonian') {
      model.models.base = this.makerjs.model.move(new m.Rectangle(diameter * 2, diameter / 2), [length / 2 - diameter, -diameter / 2]);
    } else {
      model.paths.mount = new p.Line([length / 2, -diameter / 2], [length / 2, -diameter]);
    }

    this.makerjs.model.rotate(model, this.options.orientation, [0, 0]);

    return model;
  }

  updateModel() {
    const model = this.createModel();
    const svg = this.makerjs.exporter.toSVG(model, { stroke: this.options.color, fill: 'none' });
    this.svgContainer.innerHTML = svg;
    if (this.downloadLink.href) {
      URL.revokeObjectURL(this.downloadLink.href);
    }
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    this.downloadLink.href = URL.createObjectURL(blob);
  }
}

if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('DOMContentLoaded', () => new TelescopeDesigner());
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TelescopeDesigner;
}
