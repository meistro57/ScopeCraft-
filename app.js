let calculations = null;

if (typeof require === 'function') {
  try {
    calculations = require('./calculations');
  } catch (error) {
    calculations = null;
  }
}

if (!calculations && typeof window !== 'undefined') {
  calculations = window.ScopeCraftCalculations || null;
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

class TelescopeDesigner {
  constructor() {
    this.eyepieces = [
      { id: 'plossl-32', name: '32mm Plössl (50°)', focalLength: 32, apparentFoV: 50 },
      { id: 'plossl-25', name: '25mm Plössl (50°)', focalLength: 25, apparentFoV: 50 },
      { id: 'plossl-10', name: '10mm Plössl (52°)', focalLength: 10, apparentFoV: 52 },
      { id: 'uw-6.5', name: '6.5mm Ultra-Wide (82°)', focalLength: 6.5, apparentFoV: 82 }
    ];

    this.options = {
      diameter: 200,
      focalLength: 1000,
      opticalType: 'refractor',
      mount: 'dobsonian',
      orientation: 0,
      color: '#000000',
      showFinder: true,
      eyepieceId: this.eyepieces[1]?.id || null
    };

    this.svgContainer = document.getElementById('svgContainer');
    this.downloadLink = document.getElementById('downloadLink');
    this.eyepieceSelect = document.getElementById('eyepiece');

    this.metricsElements = {
      focalRatio: document.getElementById('metric-focalRatio'),
      magnification: document.getElementById('metric-magnification'),
      trueField: document.getElementById('metric-trueField'),
      exitPupil: document.getElementById('metric-exitPupil'),
      lightGathering: document.getElementById('metric-lightGathering'),
      resolution: document.getElementById('metric-resolution'),
      maxMagnification: document.getElementById('metric-maxMagnification')
    };

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

    if (this.eyepieceSelect) {
      this.populateEyepieces();
      this.eyepieceSelect.addEventListener('change', e => {
        this.options.eyepieceId = e.target.value;
        this.updateModel();
      });
    }

    const syncValues = () => {
      diameterValue.textContent = this.options.diameter + ' mm';
      focalValue.textContent = this.options.focalLength + ' mm';
      orientationValue.textContent = this.options.orientation + '°';
      if (this.eyepieceSelect && this.options.eyepieceId) {
        this.eyepieceSelect.value = this.options.eyepieceId;
      }
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

  populateEyepieces() {
    if (!this.eyepieceSelect) {
      return;
    }
    this.eyepieceSelect.innerHTML = '';
    this.eyepieces.forEach(eyepiece => {
      const option = document.createElement('option');
      option.value = eyepiece.id;
      option.textContent = eyepiece.name;
      this.eyepieceSelect.appendChild(option);
    });
    if (this.options.eyepieceId) {
      this.eyepieceSelect.value = this.options.eyepieceId;
    }
  }

  getSelectedEyepiece() {
    if (!this.options.eyepieceId) {
      return null;
    }
    return this.eyepieces.find(eyepiece => eyepiece.id === this.options.eyepieceId) || null;
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

  updateMetrics() {
    if (!calculations) {
      return;
    }

    const { diameter, focalLength } = this.options;
    const eyepiece = this.getSelectedEyepiece();
    const focalRatio = calculations.calculateFocalRatio(diameter, focalLength);
    const magnification = eyepiece ? calculations.calculateMagnification(focalLength, eyepiece.focalLength) : null;
    const trueField = eyepiece
      ? calculations.calculateTrueFieldOfView(focalLength, eyepiece.focalLength, eyepiece.apparentFoV)
      : null;
    const exitPupil = magnification ? calculations.calculateExitPupil(diameter, magnification) : null;
    const lightGathering = calculations.calculateLightGatheringPower(diameter);
    const resolution = calculations.calculateResolutionLimit(diameter);
    const maxMagnification = calculations.calculateMaxUsefulMagnification(diameter);

    this.setMetric('focalRatio', isFiniteNumber(focalRatio) ? `f/${focalRatio.toFixed(1)}` : '—');
    this.setMetric('magnification', isFiniteNumber(magnification) ? `${magnification.toFixed(0)}×` : '—');
    this.setMetric('trueField', isFiniteNumber(trueField) ? `${trueField.toFixed(2)}°` : '—');
    this.setMetric('exitPupil', isFiniteNumber(exitPupil) ? `${exitPupil.toFixed(1)} mm` : '—');
    this.setMetric('lightGathering', isFiniteNumber(lightGathering) ? `${Math.round(lightGathering)}× human eye` : '—');
    this.setMetric('resolution', isFiniteNumber(resolution) ? `${resolution.toFixed(2)}″` : '—');
    this.setMetric('maxMagnification', isFiniteNumber(maxMagnification) ? `${maxMagnification.toFixed(0)}×` : '—');
  }

  setMetric(key, value) {
    const element = this.metricsElements[key];
    if (element) {
      element.textContent = value;
    }
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
    this.updateMetrics();
  }
}

if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('DOMContentLoaded', () => new TelescopeDesigner());
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TelescopeDesigner;
}
