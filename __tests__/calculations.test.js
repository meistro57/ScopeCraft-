const calculations = require('../calculations');

describe('calculations', () => {
  test('computes fundamental telescope metrics', () => {
    expect(calculations.calculateFocalRatio(200, 1000)).toBeCloseTo(5);
    expect(calculations.calculateMagnification(1000, 25)).toBeCloseTo(40);
    expect(calculations.calculateTrueFieldOfView(1000, 25, 50)).toBeCloseTo(1.25);
    expect(calculations.calculateExitPupil(200, 40)).toBeCloseTo(5);
    expect(calculations.calculateLightGatheringPower(200)).toBeCloseTo(816.3265, 4);
    expect(calculations.calculateResolutionLimit(200)).toBeCloseTo(0.58);
    expect(calculations.calculateMaxUsefulMagnification(200)).toBe(400);
  });

  test('returns null for invalid inputs', () => {
    expect(calculations.calculateFocalRatio(0, 1000)).toBeNull();
    expect(calculations.calculateMagnification(1000, 0)).toBeNull();
    expect(calculations.calculateTrueFieldOfView(1000, 0, 50)).toBeNull();
    expect(calculations.calculateExitPupil(200, 0)).toBeNull();
    expect(calculations.calculateLightGatheringPower(200, 0)).toBeNull();
    expect(calculations.calculateResolutionLimit(0)).toBeNull();
    expect(calculations.calculateMaxUsefulMagnification('not a number')).toBeNull();
  });
});
