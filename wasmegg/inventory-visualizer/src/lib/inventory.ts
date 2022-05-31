import _ from 'lodash'
import { Artifact, ei, Inventory, Stone, getArtifactFamilyProps } from 'lib';
import { Orderables, Orderable, LayoutOrderables, LayoutAxis } from '@/lib';
import Name = ei.ArtifactSpec.Name;
import Level = ei.ArtifactSpec.Level;
import Rarity = ei.ArtifactSpec.Rarity;
import Type = ei.ArtifactSpec.Type;

export type GridItem = {
  afxId: Name;
  afxLevel: Level;
  afxRarity: Rarity;
  afxType: Type;
  nofragType: Type;
  nofragId: Name;
  iconPath: string;
  count: number;
  stones: Stone[];
};

export type InventoryGrid = GridItem[];

const typeOrder = [
  Type.ARTIFACT,
  Type.STONE,
  Type.INGREDIENT,
  Type.STONE_INGREDIENT,
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

const fragmentToStone: { [key: string]: Name } = {
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

const DEFAULT_STONES_ORDER: Orderables = _.fromPairs(_.map(stoneIdOrder, (id: Name, idx: number) => {
  const artfam = getArtifactFamilyProps(id as number)
  const art = _.last(artfam.tiers)
  return [id, { id: String(id), name: artfam.name, weight: Number(idx) + 1, img: hackyIconUrl(art?.icon_filename) }]
}))

const DEFAULT_ARTIFACTS_ORDER: Orderables = _.fromPairs(_.map(artifactIdOrder, (id: Name, idx: number) => {
  const artfam = getArtifactFamilyProps(id as number)
  const art = _.last(artfam.tiers)
  return [id, { id: String(id), name: artfam.name, weight: Number(idx) + 1, img: hackyIconUrl(art?.icon_filename) }]
}))

const DEFAULT_ASPECTS_ORDER: Orderables = {
  byLegendary:  { name: 'Legendary',         id: 'byLegendary', weight:  1, img: hackyIconUrl('afx_book_of_basan_4.png'), rarity: 'legendary' },
  byEpic:       { name: 'Epic',              id: 'byEpic',      weight:  2, img: hackyIconUrl('afx_aurelian_brooch_4.png'), rarity: 'epic' },
  byRare:       { name: 'Rare',              id: 'byRare',      weight:  3, img: hackyIconUrl('afx_tungsten_ankh_4.png'), rarity: 'rare' },
  byCommonArt:  { name: 'Common Artifact',   id: 'byCommonArt', weight:  4, img: hackyIconUrl('afx_puzzle_cube_1.png') },
  //
  byStone:      { name: 'Stone',             id: 'byStone',     weight:  5, img: hackyIconUrl('afx_prophecy_stone_4.png') },
  byIngredient: { name: 'Ingredient',        id: 'byIngredient',weight:  6, img: hackyIconUrl('afx_gold_meteorite_3.png') },
  byFragment:   { name: 'Fragment',          id: 'byFragment',  weight:  7, img: hackyIconUrl('afx_soul_stone_1.png') },
  //
  byFamily:     { name: 'Family',            id: 'byFamily',    weight:  8, glyph: '🌈', img: '' },
  byLevel:      { name: 'Level',             id: 'byLevel',     weight:  9, glyph: '🚀', img: '' },
  byDecoration: { name: 'Mounted Stones',    id: 'byDecoration',weight: 10, img: hackyIconUrl('afx_clarity_stone_2.png') },
  //
  byAnyStone:   { name: 'Stone or Fragment', id: 'byAnyStone',  weight: 11, img: hackyIconUrl('afx_soul_stone_2.png') },
  byArtifact:   { name: 'Artifact',          id: 'byArtifact',  weight: 12, img: hackyIconUrl('afx_quantum_metronome_4.png') },
  byUncommon:   { name: 'Uncommon',          id: 'byUncommon',  weight: 13, img: hackyIconUrl('afx_puzzle_cube_4.png'), rarity: 'epic' },
  byNonLegend:  { name: 'Non-Legendary',     id: 'byNonLegend', weight: 14, glyph: '🥱', img: '', rarity: 'epic' },
  byType:       { name: 'Type',              id: 'byType',      weight: 15, glyph: '📇', img: '' },

}

const AxisOrders: LayoutOrderables = {
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
  return _.cloneDeep(order)
}

const Last = 9e12

type SorterFunc = (item: GridItem, layoutOrder: LayoutOrderables) => number
const Sorters: { [key:string]: SorterFunc }  = {
  byLegendary(item: GridItem)  { return (item.afxRarity === Rarity.LEGENDARY) ? 1 : Last },
  byNonLegend(item: GridItem)  { return (item.afxRarity !== Rarity.LEGENDARY) ? 1 : Last },
  byEpic(item: GridItem)       { return (item.afxRarity === Rarity.EPIC) ? 1 : Last },
  byRare(item: GridItem)       { return (item.afxRarity === Rarity.RARE) ? 1 : Last },
  byCommonArt(item: GridItem)  { return (item.afxRarity === Rarity.COMMON && item.afxType === Type.ARTIFACT) ? 1 : Last },
  // byCommon(item: GridItem)  { return (item.afxRarity === Rarity.COMMON) ? 1 : Last },
  byUncommon(item: GridItem)   { return (item.afxRarity !== Rarity.COMMON) ? 1 : Last },
  byArtifact(item: GridItem)   { return (item.afxType === Type.ARTIFACT) ? 1 : Last },
  byStone(item: GridItem)      { return (item.afxType === Type.STONE) ? 1 : Last },
  byFragment(item: GridItem)   { return (item.afxType === Type.STONE_INGREDIENT) ? 1 : Last },
  byIngredient(item: GridItem) { return (item.afxType === Type.INGREDIENT) ? 1 : Last },
  //
  byAnyStone(item: GridItem, layoutOrder: LayoutOrderables) {
    if  (! (item.afxType === Type.STONE_INGREDIENT || item.afxType === Type.STONE)) { return Last }
    return (1000 * layoutOrder.stones[item.nofragId]?.weight) + Sorters.byLevel(item, layoutOrder)
  },
  //
  byFamily(item: GridItem, layoutOrder: LayoutOrderables) {
    if (item.afxType    === Type.ARTIFACT)   { return layoutOrder.artifacts[item.afxId]?.weight }
    if (item.nofragType === Type.STONE)      { return 1e3 * layoutOrder.stones[item.nofragId]?.weight }
    if (item.afxType    === Type.INGREDIENT) { return 1e6 * ingredientOrder.indexOf(item.afxId) }
    return Last
  },
  byLevel(item: GridItem)      { return -1 * (item.afxType === Type.STONE ? (item.afxLevel + 1) : item.afxLevel) },
  byType(item: GridItem)       { return typeOrder.indexOf(item.afxType) },
  byDecoration(item: GridItem, lo: LayoutOrderables) {
    if (! item.afxRarity) { return Last * 1e12 }
    return ((byMountedOrder(item, 0, lo) * 1e6) + (byMountedOrder(item, 1, lo) * 1e3) + byMountedOrder(item, 2, lo))
  },
}

function byMountedOrder(item: GridItem, idx: number, layoutOrder: LayoutOrderables) {
  const stone = item.stones?.[idx]
  if (stone === undefined) { return 999 }
  return layoutOrder.stones[stone.afxId]?.weight
}

const extraSorterKeys = _.difference(_.keys(Sorters), _.keys(DEFAULT_ASPECTS_ORDER))
const extraAspectKeys = _.difference(_.keys(DEFAULT_ASPECTS_ORDER), _.keys(Sorters))
if (! (_.isEmpty(extraSorterKeys) && _.isEmpty(extraAspectKeys))) {
  console.error('missing or extra aspects', extraAspectKeys, extraSorterKeys)
  throw new Error('Missing or extra aspects')
}

function hackyIconUrl(iconName: string | undefined): string {
  if (! iconName) { return '' }
  return `https://eggincassets.tcl.sh/256/egginc/${iconName}`
}

export function generateInventoryGrid(
  inventory: Inventory,
  options?: {
    transpose: boolean,
    layoutOrder: LayoutOrderables,
  }
): InventoryGrid {

  const inventoryItems = [...inventory.items]
  const grid = <InventoryGrid>[];
  for (const item of inventoryItems) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const afxType = item.afxTier.afx_type
    const commonProps = {
      afxId: item.afxId,
      afxLevel: item.afxLevel,
      iconPath: item.iconPath,
      afxType,
      nofragType: ((afxType === Type.STONE_INGREDIENT) ? Type.STONE : afxType),
      nofragId:   ((afxType === Type.STONE_INGREDIENT) ? (<Name>fragmentToStone[item.afxId]) : item.afxId),
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

  const layoutOrder: LayoutOrderables = _.merge({
    artifacts: defaultAxisOrder('artifacts'),
    stones: defaultAxisOrder('stones'),
    aspects: defaultAxisOrder('aspects'),
  }, options?.layoutOrder || {})

  const sortAspects: SorterFunc[] = _.compact(
    _.map(_.sortBy(layoutOrder.aspects, 'weight'), ({ id }) => Sorters[id]),
  )

  grid.sort((i1, i2) => {
    for (const sorter of sortAspects) {
      const cmp = sorter(i1, layoutOrder) - sorter(i2, layoutOrder)
      if (cmp !== 0) { return cmp }
    }
    return 0
  });

  return grid;
}
