import { Build, Config } from '../models';
import { ArtifactSpec } from '../proto';
import { multiplicativeEffect } from './common';
import { boostMultiplier } from './boosts';
import { earningsWithMaxRunningChickenBonusMultiplier } from './earnings';

/**
 * @param {!Build} build
 * @param {!Config} config
 * @returns {!Number}
 */
function soulEggsGainMultiplier(build, config) {
  return Math.pow(virtualEarningsMultiplier(build, config), 0.21);
}

/**
 * @param {!Build} build
 * @param {!Config} config
 * @returns {!Number}
 */
function soulEggsGainWithEmptyHabsStartMultiplier(build, config) {
  return Math.pow(virtualEarningsWithEmptyHabsStartMultiplier(build, config), 0.21);
}

/**
 * @param {!Build} build
 * @param {!Config} config
 * @returns {!Number}
 */
function virtualEarningsMultiplier(build, config) {
  return (
    earningsWithMaxRunningChickenBonusMultiplier(build, config) *
    multiplicativeEffect(build, config, [ArtifactSpec.Name.PHOENIX_FEATHER]) *
    (config.soulBeaconActive ? boostMultiplier(build, config) : 1)
  );
}

/**
 * @param {!Build} build
 * @param {!Config} config
 * @returns {!Number}
 */
function virtualEarningsWithEmptyHabsStartMultiplier(build, config) {
  return (
    virtualEarningsMultiplier(build, config) *
    multiplicativeEffect(build, config, [
      ArtifactSpec.Name.THE_CHALICE,
      ArtifactSpec.Name.LIFE_STONE,
    ]) *
    (config.tachyonPrismActive ? boostMultiplier(build, config) : 1)
  );
}

export { soulEggsGainMultiplier, soulEggsGainWithEmptyHabsStartMultiplier };
