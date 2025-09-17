(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ScopeCraftCalculations = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  function safeDivide(numerator, denominator) {
    if (!isFiniteNumber(numerator) || !isFiniteNumber(denominator) || denominator === 0) {
      return null;
    }
    return numerator / denominator;
  }

  function calculateFocalRatio(apertureMm, focalLengthMm) {
    return safeDivide(focalLengthMm, apertureMm);
  }

  function calculateMagnification(focalLengthMm, eyepieceFocalLengthMm) {
    return safeDivide(focalLengthMm, eyepieceFocalLengthMm);
  }

  function calculateTrueFieldOfView(focalLengthMm, eyepieceFocalLengthMm, eyepieceApparentFoVDeg) {
    if (!isFiniteNumber(eyepieceApparentFoVDeg)) {
      return null;
    }
    const magnification = calculateMagnification(focalLengthMm, eyepieceFocalLengthMm);
    if (!isFiniteNumber(magnification) || magnification === 0) {
      return null;
    }
    return eyepieceApparentFoVDeg / magnification;
  }

  function calculateExitPupil(apertureMm, magnification) {
    return safeDivide(apertureMm, magnification);
  }

  function calculateLightGatheringPower(apertureMm, referenceMm = 7) {
    if (!isFiniteNumber(apertureMm) || !isFiniteNumber(referenceMm) || referenceMm === 0) {
      return null;
    }
    const ratio = apertureMm / referenceMm;
    return ratio * ratio;
  }

  function calculateResolutionLimit(apertureMm) {
    if (!isFiniteNumber(apertureMm) || apertureMm === 0) {
      return null;
    }
    return 116 / apertureMm;
  }

  function calculateMaxUsefulMagnification(apertureMm) {
    if (!isFiniteNumber(apertureMm)) {
      return null;
    }
    return apertureMm * 2;
  }

  return {
    calculateExitPupil,
    calculateFocalRatio,
    calculateLightGatheringPower,
    calculateMagnification,
    calculateMaxUsefulMagnification,
    calculateResolutionLimit,
    calculateTrueFieldOfView
  };
});
