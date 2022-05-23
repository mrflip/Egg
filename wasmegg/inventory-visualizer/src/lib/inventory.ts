import { Artifact, ei, Inventory, Stone } from 'lib';
import { Orderables } from '@/lib';
import Name = ei.ArtifactSpec.Name;
import Level = ei.ArtifactSpec.Level;
import Rarity = ei.ArtifactSpec.Rarity;

export type InventoryGridItem = {
  afxId: Name;
  afxLevel: Level;
  afxRarity: Rarity;
  iconPath: string;
  count: number;
  stones: Stone[];
};

export type InventoryGrid = InventoryGridItem[];

// I'm a bit too lazy to write the logic... So hard-coded it is.
const afxIdOrder = [
  Name.LIGHT_OF_EGGENDIL,
  Name.BOOK_OF_BASAN,
  Name.TACHYON_DEFLECTOR,
  Name.SHIP_IN_A_BOTTLE,
  Name.TITANIUM_ACTUATOR,
  Name.DILITHIUM_MONOCLE,
  Name.QUANTUM_METRONOME,
  Name.PHOENIX_FEATHER,
  Name.THE_CHALICE,
  Name.INTERSTELLAR_COMPASS,
  Name.CARVED_RAINSTICK,
  Name.BEAK_OF_MIDAS,
  Name.MERCURYS_LENS,
  Name.NEODYMIUM_MEDALLION,
  Name.ORNATE_GUSSET,
  Name.TUNGSTEN_ANKH,
  Name.AURELIAN_BROOCH,
  Name.VIAL_MARTIAN_DUST,
  Name.DEMETERS_NECKLACE,
  Name.LUNAR_TOTEM,
  Name.PUZZLE_CUBE,

  Name.PROPHECY_STONE,
  Name.CLARITY_STONE,
  Name.DILITHIUM_STONE,
  Name.LIFE_STONE,
  Name.QUANTUM_STONE,
  Name.SOUL_STONE,
  Name.TERRA_STONE,
  Name.TACHYON_STONE,
  Name.LUNAR_STONE,
  Name.SHELL_STONE,

  Name.SOLAR_TITANIUM,
  Name.TAU_CETI_GEODE,
  Name.GOLD_METEORITE,

  Name.PROPHECY_STONE_FRAGMENT,
  Name.CLARITY_STONE_FRAGMENT,
  Name.LIFE_STONE_FRAGMENT,
  Name.TERRA_STONE_FRAGMENT,
  Name.DILITHIUM_STONE_FRAGMENT,
  Name.SOUL_STONE_FRAGMENT,
  Name.QUANTUM_STONE_FRAGMENT,
  Name.TACHYON_STONE_FRAGMENT,
  Name.SHELL_STONE_FRAGMENT,
  Name.LUNAR_STONE_FRAGMENT,
];

export function defaultLayoutOrder() {
  return {
    Legendary: { name: "Legendary", weight: 1 },
    Epic:      { name: "Epic",      weight: 2 },
    Rare:      { name: "Rare",      weight: 3 },
    Common:    { name: "Common",    weight: 4 },
  }
}

export function generateInventoryGrid(
  inventory: Inventory,
  options?: {
    rarerItemsFirst: boolean,
    forceItemsPerCol?: number,
    transpose: boolean,
    layoutOrder: Orderables,
  }
): InventoryGrid {
  const { layoutOrder = defaultLayoutOrder() } = options
  const rarityMap = {
    [Rarity.LEGENDARY]: layoutOrder.Legendary.weight,
    [Rarity.EPIC]: layoutOrder.Epic.weight,
    [Rarity.RARE]: layoutOrder.Rare.weight,
    other: layoutOrder.Common.weight,
  }
  function remapRarity(rarity) {
    return rarityMap[rarity] || rarityMap.other
  }

  const inventoryItems = [...inventory.items].sort((i1, i2) => {
    const cmp = afxIdOrder.indexOf(i1.afxId) - afxIdOrder.indexOf(i2.afxId);
    if (cmp !== 0) {
      return cmp;
    }
    return i2.afxLevel - i1.afxLevel;
  });
  const grid = <InventoryGrid>[];
  for (const item of inventoryItems) {
    const commonProps = {
      afxId: item.afxId,
      afxLevel: item.afxLevel,
      iconPath: item.iconPath,
    };
    const stoned = {
      [Rarity.LEGENDARY]: <Artifact[]>[],
      [Rarity.EPIC]: <Artifact[]>[],
      [Rarity.RARE]: <Artifact[]>[],
    };
    for (const artifact of inventory.stoned) {
      if (
        artifact.afxId === item.afxId &&
        artifact.afxLevel === item.afxLevel &&
        // This condition is obviously true for a stoned artifact; only added so
        // that `artifact.afxRarity` can be used to index `stoned`.
        artifact.afxRarity !== Rarity.COMMON
      ) {
        stoned[artifact.afxRarity].push(artifact);
      }
    }
    for (const rarity of [Rarity.LEGENDARY, Rarity.EPIC, Rarity.RARE] as const) {
      for (const artifact of stoned[rarity]) {
        grid.push({
          ...commonProps,
          afxRarity: rarity,
          count: 1,
          stones: artifact.stones,
        });
      }
      const unstonedCount = item.haveRarity[rarity] - stoned[rarity].length;
      if (unstonedCount > 0) {
        grid.push({
          ...commonProps,
          afxRarity: rarity,
          count: unstonedCount,
          stones: [],
        });
      }
    }
    if (item.haveCommon - item.slotted > 0) {
      grid.push({
        ...commonProps,
        afxRarity: Rarity.COMMON,
        count: item.haveCommon - item.slotted,
        stones: [],
      });
    }
  }
  if (options?.rarerItemsFirst) {
    grid.sort((i1, i2) => remapRarity(i1.afxRarity) - remapRarity(i2.afxRarity));
  }
  return grid;
}
