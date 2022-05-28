import _ from 'lodash'
import { Artifact, ei, Inventory, Stone, getArtifactTierProps, getArtifactFamilyProps } from 'lib';
import { Orderables, LayoutOrderables, LayoutAxis, afxIconURL } from '@/lib';
import Name = ei.ArtifactSpec.Name;
import Level = ei.ArtifactSpec.Level;
import Rarity = ei.ArtifactSpec.Rarity;
import Type = ei.ArtifactSpec.Type;
import eiafxConfig from 'lib/eiafx-config.json';

export type InventoryGridItem = {
  afxId: Name;
  afxLevel: Level;
  afxRarity: Rarity;
  iconPath: string;
  count: number;
  stones: Stone[];
};

export type InventoryGrid = InventoryGridItem[];

const fallbackTypeOrder = [
  Name.ARTIFACT,
  Name.STONE,
  Name.STONE_INGREDIENT,
  Name.INGREDIENT,
]

// I'm a bit too lazy to write the logic... So hard-coded it is.
const artifactIdOrder = [

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
]

const stoneIdOrder = [
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
]

const fragmentToStone = {
  [Name.PROPHECY_STONE_FRAGMENT]:   Name.PROPHECY_STONE,
  [Name.CLARITY_STONE_FRAGMENT]:    Name.CLARITY_STONE,
  [Name.DILITHIUM_STONE_FRAGMENT]:  Name.DILITHIUM_STONE,
  [Name.LIFE_STONE_FRAGMENT]:       Name.LIFE_STONE,
  [Name.QUANTUM_STONE_FRAGMENT]:    Name.QUANTUM_STONE,
  [Name.SOUL_STONE_FRAGMENT]:       Name.SOUL_STONE,
  [Name.TERRA_STONE_FRAGMENT]:      Name.TERRA_STONE,
  [Name.TACHYON_STONE_FRAGMENT]:    Name.TACHYON_STONE,
  [Name.LUNAR_STONE_FRAGMENT]:      Name.LUNAR_STONE,
  [Name.SHELL_STONE_FRAGMENT]:      Name.SHELL_STONE,
}

const ingredientOrder = [
  Name.SOLAR_TITANIUM,
  Name.TAU_CETI_GEODE,
  Name.GOLD_METEORITE,
];

const afxIdOrder = [
  ...artifactIdOrder, ...stoneIdOrder, ...Object.keys(fragmentToStone), ...ingredientOrder,
]

function hackyIconUrl(iconName: string): string {
  return `https://eggincassets.tcl.sh/256/egginc/${iconName}`
}

const DEFAULT_KINDS_ORDER: Orderables = {
  Legendary:  { id: "Legendary",  name: "Legendary",  weight: 1, img: hackyIconUrl('afx_book_of_basan_4.png') },
  Epic:       { id: "Epic",       name: "Epic",       weight: 2, img: hackyIconUrl('afx_aurelian_brooch_4.png') },
  Rare:       { id: "Rare",       name: "Rare",       weight: 3, img: hackyIconUrl('afx_tungsten_ankh_4.png') },
  Common:     { id: "Common",     name: "Common",     weight: 4, img: hackyIconUrl('afx_puzzle_cube_4.png') },
  Stone:      { id: "Stone",      name: "Stone",      weight: 5, img: hackyIconUrl('afx_prophecy_stone_4.png') },
  Ingredient: { id: "Ingredient", name: "Ingredient", weight: 6, img: hackyIconUrl('afx_gold_meteorite_3.png') },
}

const DEFAULT_STONES_ORDER: Orderables = _.fromPairs(_.map(stoneIdOrder, (id, idx) => {
  const artfam = getArtifactFamilyProps(id as number)
  // if (! artfam) { // ? this seems harder than it should be
  //   const art = getArtifactTierProps(id as number, 0)
  //   return [id, { id, name: art.name, weight: Number(idx) + 1, img: hackyIconUrl(art.icon_filename) }]
  // }
  const art = _.last(artfam.tiers)
  return [id, { id, name: artfam.name, weight: Number(idx) + 1, img: hackyIconUrl(art.icon_filename) }]
}))

const DEFAULT_ARTIFACTS_ORDER: Orderables = _.fromPairs(_.map(artifactIdOrder, (id, idx) => {
  const artfam = getArtifactFamilyProps(id as number)
  const art = _.last(artfam.tiers)
  return [id, { id, name: artfam.name, weight: Number(idx) + 1, img: hackyIconUrl(art.icon_filename) }]
}))

const DEFAULT_ASPECTS_ORDER: Orderables = {
  kind:       { id: 'kind',       name: 'Kind/Rarity',    weight: 1, img: '', glyph: '🌈' },
  family:     { id: 'family',     name: 'Family',         weight: 1, img: hackyIconUrl('afx_quantum_metronome_4.png'), glyph: 'F' },
  level:      { id: 'level',      name: 'Level',          weight: 1, img: '', glyph: '🚀' },
  mounts:     { id: 'mounts',     name: 'Mounted Stones', weight: 1, img: hackyIconUrl('afx_clarity_stone_2.png'), glyph: 'M' },
}

const AxisOrders: LayoutOrderables = {
  kinds:        DEFAULT_KINDS_ORDER,
  artifacts:    DEFAULT_ARTIFACTS_ORDER,
  stones:       DEFAULT_STONES_ORDER,
  aspects:      DEFAULT_ASPECTS_ORDER,
}

export function defaultAxisOrder(axis: LayoutAxis): Orderables {
  const order: Orderables = AxisOrders[axis]
  if (! order) {
    console.error('no defined order for axis', axis)
    return {}
  }
  return { ...order }
}

const ingredientRe = /solar_titanium|tau_ceti_geode|gold_meteor/

export function generateInventoryGrid(
  inventory: Inventory,
  options?: {
    rarerItemsFirst: boolean,
    forceItemsPerCol?: number,
    transpose: boolean,
    layoutOrder: LayoutOrderables,
  }
): InventoryGrid {
  const {
    kinds:kindsOrder         = defaultAxisOrder('kinds'),
    artifacts:artifactsOrder = defaultAxisOrder('artifacts'),
    stones:stonesOrder       = defaultAxisOrder('stones'),
    aspects:aspectsOrder     = defaultAxisOrder('aspects'),
  } = options?.layoutOrder || {}

  const inventoryItems = [...inventory.items]
  const grid = <InventoryGrid>[];
  for (const item of inventoryItems) {
    const commonProps = {
      afxId: item.afxId,
      afxLevel: item.afxLevel,
      iconPath: item.iconPath,
      afxType: item.afxTier.afx_type,
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

  function byAfxOrder(item) {
    if (! item) { return Infinity }
    const stoneMaybe = fragmentToStone[item.afxId]
    if (! _.isNil(stoneMaybe)) {
      return stonesOrder[stoneMaybe]?.weight + 0.5
    }
    return (stonesOrder[item.afxId]?.weight) ?? (artifactsOrder[item.afxId]?.weight) ?? (1000 + item.afxID)
  }

  function byTypeOrder(afx: InventoryGridItem) {
    if (afx.afxType === Type.STONE) { return kindsOrder.Stone.weight }
    if (afx.afxType === Type.STONE_INGREDIENT) { return kindsOrder.Stone.weight }
    if (afx.afxType === Type.INGREDIENT) { return kindsOrder.Ingredient.weight }
    return kindsOrder.Common.weight
  }

  function byKindOrder(afx: InventoryGridItem) {
    const { iconPath, afxRarity, afxType } = afx
    if (afxRarity === Rarity.LEGENDARY) { return kindsOrder.Legendary.weight }
    if (afxRarity === Rarity.EPIC)      { return kindsOrder.Epic.weight }
    if (afxRarity === Rarity.RARE)      { return kindsOrder.Rare.weight }
    return byTypeOrder(afx)
  }

  function byMountedOrder(afx: InventoryGridItem, idx: number) {
    const stone = afx.stones?.[idx]
    if (stone === undefined) { return 99999 }
    return byAfxOrder(stone)
  }

  const sorters = {
    kind(i1, i2)   { return byKindOrder(i1) - byKindOrder(i2) },
    family(i1, i2) { return (byTypeOrder(i1) - byTypeOrder(i2)) || (byAfxOrder(i1) - byAfxOrder(i2)) },
    level(i1, i2)  { return i2.afxLevel - i1.afxLevel },
    mounts(i1, i2) {
      return (byMountedOrder(i1, 0) - byMountedOrder(i2, 0))
        ||   (byMountedOrder(i1, 1) - byMountedOrder(i2, 1))
        ||   (byMountedOrder(i1, 2) - byMountedOrder(i2, 2))
    },
  }
  const sortAspects = _.map(_.sortBy(aspectsOrder, 'weight'), ({ id }) => sorters[id])

  grid.sort((i1, i2) => {
    for (const sorter of sortAspects) {
      const cmp = sorter(i1, i2)
      if (cmp !== 0) { return cmp }
    }
    return null
  });
  return grid;
}
