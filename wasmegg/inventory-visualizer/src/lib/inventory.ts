import _ from 'lodash'
import { Artifact, ei, Inventory, Stone, getArtifactFamilyProps } from 'lib';
import {
  LayoutAxis, LayoutOrderables, Orderable, Orderables,
  // PlayerDataOptions, VisualizerConfig, VisualizerConfigAxis,
} from '@/lib';
import Name = ei.ArtifactSpec.Name;
import Level = ei.ArtifactSpec.Level;
import Rarity = ei.ArtifactSpec.Rarity;
import Type = ei.ArtifactSpec.Type;

export type GridItem = {
  id?:    string;
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
  Name.GOLD_METEORITE,
  Name.SOLAR_TITANIUM,
  Name.TAU_CETI_GEODE,
  'unstoned',
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

// const ingredientOrder = [
//   Name.GOLD_METEORITE,
//   Name.SOLAR_TITANIUM,
//   Name.TAU_CETI_GEODE,
// ];

// @ts-expect-error lodash types weirdness
const DEFAULT_STONES_ORDER: Orderables = _.fromPairs(_.map(stoneIdOrder, (id: Name, idx: number) => {
  // @ts-expect-error not detecting type on id
  if (id === 'unstoned') { return [id, { id: String(id), name: 'Unstoned', weight: Number(idx) + 1, glyph: '😳' }] }
  const artfam = getArtifactFamilyProps(id as number)
  const art = _.last(artfam.tiers)
  // console.log(art)
  const weight =  Number(idx) + 1;
  return [id, { id: String(id), name: artfam.name, weight, img: hackyIconUrl(art?.icon_filename) }]
}))

const DEFAULT_ARTIFACTS_ORDER: Orderables = _.fromPairs(_.map(artifactIdOrder, (id: Name, idx: number) => {
  const artfam = getArtifactFamilyProps(id as number)
  const art = _.last(artfam.tiers)
  return [id, { id: String(id), name: artfam.name, weight: Number(idx) + 1, img: hackyIconUrl(art?.icon_filename) }]
}))

const DEFAULT_ASPECTS_ORDER: Orderables = {
  byRarity:      { name: 'Rarity',            weight:  1, grain: 1, area: 'rar', id: 'byRarity',    glyph: '🎰', img: '' },
  byType:        { name: 'Type',              weight:  2, grain: 1, area: 'typ', id: 'byType',      glyph: '📇', img: '' },
  byFamily:      { name: 'Family',            weight:  3, grain: 2, area: 'fam', id: 'byFamily',    glyph: '🌈', img: '' },
  byLevel:       { name: 'Level',             weight:  4, grain: 2, area: 'lvl', id: 'byLevel',     glyph: '🚀', img: '' },
  byStoningFam:  { name: 'Stoning Family',    weight:  5, grain: 2, area: 'stg', id: 'byStoningFam',             img: hackyIconUrl('afx_clarity_stone_4.png') },
  byStoningTier: { name: 'Stoning Tier',      weight:  6, grain: 2, area: 'stg', id: 'byStoningTier',            img: hackyIconUrl('afx_life_stone_4.png') },

  byStone:       { name: 'Stone',             weight: 10, grain: 3, area: 'typ', id: 'byStone',                  img: hackyIconUrl('afx_prophecy_stone_4.png') },
  byAnyStone:    { name: 'Stone or Fragment', weight: 11, grain: 2, area: 'typ', id: 'byAnyStone',               img: hackyIconUrl('afx_soul_stone_2.png') },
  byStFrIn:      { name: 'Stone/Frag or Ing', weight: 12, grain: 2, area: 'typ', id: 'byStFrIn',                 img: hackyIconUrl('afx_soul_stone_3.png') },
  byIngredient:  { name: 'Ingredient',        weight: 13, grain: 3, area: 'typ', id: 'byIngredient',             img: hackyIconUrl('afx_gold_meteorite_3.png') },
  byFragment:    { name: 'Fragment',          weight: 14, grain: 3, area: 'typ', id: 'byFragment',               img: hackyIconUrl('afx_soul_stone_1.png') },
  byArtifact:    { name: 'Artifact',          weight: 15, grain: 3, area: 'typ', id: 'byArtifact',               img: hackyIconUrl('afx_quantum_metronome_4.png') },
  byStoningT1:   { name: 'Stoning #1 Fam',    weight: 16, grain: 2, area: 'stg', id: 'byStoningF1',               img: hackyIconUrl('afx_clarity_stone_3.png') },
  // byStoningT2: { name: 'Stone Family 2',    weight: 17, grain: 2, area: 'stg', id: 'byStoningF2',            img: hackyIconUrl('afx_clarity_stone_3.png') },
  byStoningL1:   { name: 'Stoning #1 Tier',   weight: 18, grain: 2, area: 'stl', id: 'byStoningT1',               img: hackyIconUrl('afx_life_stone_1.png') },
  // byStoningL2: { name: 'Stone 2 Tier',      weight: 19, grain: 2, area: 'stl', id: 'byStoningT2',            img: hackyIconUrl('afx_clarity_stone_1.png') },

  byRare:        { name: 'Rare',              weight: 21, grain: 3, area: 'rar', id: 'byRare',                   img: hackyIconUrl('afx_tungsten_ankh_4.png'),     rarity: 'rare' },
  byEpic:        { name: 'Epic',              weight: 22, grain: 3, area: 'rar', id: 'byEpic',                   img: hackyIconUrl('afx_aurelian_brooch_4.png'),   rarity: 'epic' },
  byLegendary:   { name: 'Legendary',         weight: 23, grain: 3, area: 'rar', id: 'byLegendary',              img: hackyIconUrl('afx_book_of_basan_4.png'),     rarity: 'legendary' },
  byEpicRare:    { name: 'Epic/Rare',         weight: 24, grain: 3, area: 'rar', id: 'byEpicRare',               img: hackyIconUrl('afx_dilithium_monocle_2.png'), rarity: 'epic' },
  byLegRare:     { name: 'Leg/Rare',          weight: 25, grain: 3, area: 'rar', id: 'byLegRare',                img: hackyIconUrl('afx_dilithium_monocle_3.png'), rarity: 'epic' },
  byLegEpic:     { name: 'Leg/Epic',          weight: 26, grain: 3, area: 'rar', id: 'byLegEpic',                img: hackyIconUrl('afx_dilithium_monocle_4.png'), rarity: 'legendary' },
  byCommonArt:   { name: 'Common Artifact',   weight: 27, grain: 3, area: 'rar', id: 'byCommonArt',              img: hackyIconUrl('afx_puzzle_cube_1.png') },
  byUncommon:    { name: 'Uncommon',          weight: 28, grain: 3, area: 'rar', id: 'byUncommon',               img: hackyIconUrl('afx_puzzle_cube_4.png'),        rarity: 'epic' },
  byNonLegend:   { name: 'Non-Legendary',     weight: 29, grain: 3, area: 'rar', id: 'byNonLegend',  glyph: '🥱', img: '', rarity: 'epic' },
}
type AspectsKey = keyof (typeof DEFAULT_ASPECTS_ORDER)

const ASPECT_DESCRIPTIONS: { [key: AspectsKey]: string } = {
  byRarity:       'order by rarity (legendary / epic / rare / common)',
  //
  byStone:        'group all stones',
  byIngredient:   'group all ingredients',
  byFragment:     'group all fragments',
  //
  byFamily:       'group each family (metronomes, soul stones, etc) together',
  byLevel:        'order by tier (T4 .. T1)',
  byStoningFam:   'order artifact groups by mounted stone types',
  byStoningTier:  'order artifact groups by mounted stone tier (T4 stones, then T3, ...)',
  byStoningF1:    'order artifact groups by what stones are mounted in slot 1',
  // byStoningF2: 'order artifact groups by what stones are mounted in slot 2',
  byStoningT1:    'order artifact groups by tier of mounted stone #1 (items with a T4 stone, then T3, ...)',
  // byStoningT2: 'order artifact groups by tier of mounted stone #2 (items with a T4 stone, then T3, ...)',
  //
  byLegendary:    'group all legendaries',
  byEpic:         'group all epics',
  byRare:         'group all rares',
  byEpicRare:     'group all epics with all rares',
  byLegEpic:      'group all epics with all legendaries',
  byLegRare:      'group all rares with all legendaries',
  byCommonArt:    'group all commons',
  byUncommon:     'group all legendaries, epics, and rares (unsorted)',
  byNonLegend:    'group all non-legendaries (unsorted)',
  byType:         'group by type (artifact / stone / ingredient / fragment, but without any other sorting)',
  //
  byAnyStone:     'group stones and fragments together',
  byStFrIn:       'group stones, fragments and ingredients together',
  byArtifact:     'group all artifacts',
}
_.each(DEFAULT_ASPECTS_ORDER, (bag: Orderable) => { bag.desc = ASPECT_DESCRIPTIONS[bag.id] })

const AxisOrders: LayoutOrderables = {
  artifacts:    DEFAULT_ARTIFACTS_ORDER,
  aspects:      DEFAULT_ASPECTS_ORDER,
  stones:       DEFAULT_STONES_ORDER,
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
  byRarity(item: GridItem)     { return (-(item.afxRarity + 1)) },
  byLegendary(item: GridItem)  { return (item.afxRarity === Rarity.LEGENDARY) ? 1 : Last },
  byNonLegend(item: GridItem)  { return ((item.afxType === Type.ARTIFACT) && (item.afxRarity !== Rarity.LEGENDARY)) ? 1 : Last },
  byEpicRare(item: GridItem)   { return (item.afxRarity === Rarity.EPIC      || item.afxRarity === Rarity.RARE) ? 1 : Last },
  byLegEpic(item: GridItem)    { return (item.afxRarity === Rarity.LEGENDARY || item.afxRarity === Rarity.EPIC) ? 1 : Last },
  byCommonArt(item: GridItem)  { return (item.afxRarity === Rarity.COMMON && item.afxType === Type.ARTIFACT) ? 1 : Last },
  byLegRare(item: GridItem)    { return (item.afxRarity === Rarity.LEGENDARY || item.afxRarity === Rarity.RARE) ? 1 : Last },
  byEpic(item: GridItem)       { return (item.afxRarity === Rarity.EPIC)         ? 1 : Last },
  byRare(item: GridItem)       { return (item.afxRarity === Rarity.RARE)         ? 1 : Last },
  byUncommon(item: GridItem)   { return (item.afxRarity !== Rarity.COMMON)       ? 1 : Last },
  byArtifact(item: GridItem)   { return (item.afxType === Type.ARTIFACT)         ? 1 : Last },
  byStone(item: GridItem)      { return (item.afxType === Type.STONE)            ? 1 : Last },
  byFragment(item: GridItem)   { return (item.afxType === Type.STONE_INGREDIENT) ? 1 : Last },
  byIngredient(item: GridItem) { return (item.afxType === Type.INGREDIENT)       ? 1 : Last },
  //
  byAnyStone(item: GridItem, layoutOrder: LayoutOrderables) {
    if  (! (item.afxType === Type.STONE_INGREDIENT || item.afxType === Type.STONE)) { return Last }
    return (1000 * layoutOrder.stones[item.nofragId]?.weight) + Sorters.byLevel(item, layoutOrder)
  },
  byStFrIn(item: GridItem, layoutOrder: LayoutOrderables) {
    if (item.afxType === Type.INGREDIENT) {
      // console.log(item, item.nofragId, layoutOrder.stones[item.id])
      return (1000 * layoutOrder.stones[item.afxId]?.weight) + Sorters.byLevel(item, layoutOrder)
    }
    if  (! (item.afxType === Type.STONE_INGREDIENT || item.afxType === Type.STONE)) { return Last }
    // console.log(layoutOrder.stones[stone.afxId]?.weight, layoutOrder.stones[stone.afxId])
    return (1000 * layoutOrder.stones[item.nofragId]?.weight) + Sorters.byLevel(item, layoutOrder)
  },
  //
  byFamily(item: GridItem, layoutOrder: LayoutOrderables) {
    if (item.afxType    === Type.ARTIFACT)         { return       (layoutOrder.artifacts[item.afxId]?.weight + 1) }
    /* if (item.afxType    === Type.STONE)            { return Sorters.byAnyStone(
     * if (item.afxType    === Type.STONE_INGREDIENT) { return 1e9 * (layoutOrder.stones[item.nofragId]?.weight + 1) }
     * if (item.afxType    === Type.INGREDIENT)       { return 1e6 * (ingredientOrder.indexOf(item.afxId) + 1) } */
    return Last
  },
  byLevel(item:        GridItem) { return -1 * (item.afxType === Type.STONE ? (item.afxLevel + 1) : item.afxLevel) },
  byType(item:         GridItem) { return typeOrder.indexOf(item.afxType) },
  byStoningFam(item:   GridItem, lo: LayoutOrderables) { return byStoningFam(item, lo) },
  byStoningTier(item:  GridItem, lo: LayoutOrderables) { return byStoningTier(item, lo) },
  byStoningT1(item:    GridItem, lo: LayoutOrderables) { return byStoningSlotTier(item, 0, lo) },
  // byStoningT2(item: GridItem, lo: LayoutOrderables) { return byStoningSlotTier(item, 1, lo) },
  byStoningF1(item:    GridItem, lo: LayoutOrderables) { return byStoningSlotFamily(item, 0, lo) },
  // byStoningF2(item: GridItem, lo: LayoutOrderables) { return byStoningSlotFamily(item, 1, lo) },
}

function byStoningFam(item: GridItem, layoutOrder: LayoutOrderables) {
  if (! (item.afxRarity && item.stones)) { return 1e3 }
  const weight = _byStoningFam(item, layoutOrder)
  // const { stones = [] } = item
  // const [stone1, stone2, stone3] = stones
  // console.log(layoutOrder.stones.unstoned.weight, weight, item,
  //   stone1?.afxId, layoutOrder.stones[stone1?.afxId]?.weight,
  //   stone2?.afxId, layoutOrder.stones[stone2?.afxId]?.weight,
  //   stone3?.afxId, layoutOrder.stones[stone3?.afxId]?.weight,
  // )
  return weight
}

function _byStoningFam(item: GridItem, layoutOrder: LayoutOrderables) {
  if (! (item.afxRarity && item.stones)) { return 1e9 }
  const unstonedWeight = layoutOrder.stones.unstoned.weight
  const { stones = [] } = item
  let weight = 1e4 * (layoutOrder.stones[stones[0]?.afxId]?.weight ?? unstonedWeight)
  if (stones[1]?.afxId !== stones[0]?.afxId) { weight += 100 * (layoutOrder.stones[stones[1]?.afxId]?.weight ?? unstonedWeight) }
  if (stones[2]?.afxId !== stones[0]?.afxId) { weight +=       (layoutOrder.stones[stones[2]?.afxId]?.weight ?? unstonedWeight) }
  return weight
}

function byStoningTier(item: GridItem, layoutOrder: LayoutOrderables) {
  if (! (item.afxRarity && item.stones)) { return 1e12 }
  const stone = item.stones[0]
  if (stone === undefined) { return 95 + (layoutOrder.stones.unstoned.weight / 3) }
  return 100 - (stone.afxLevel + 1)
}

function byStoningSlotTier(item: GridItem, idx: number, layoutOrder: LayoutOrderables) {
  if (! (item.afxRarity && item.stones)) { return 1e12 }
  const stone = item.stones[idx]
  if (stone === undefined) { return 95 + (layoutOrder.stones.unstoned.weight / 3) }
  return 100 - (stone.afxLevel + 1)
}

function byStoningSlotFamily(item: GridItem, idx: number, layoutOrder: LayoutOrderables) {
  if (! (item.afxRarity && item.stones)) { return 1e3 }
  const stone = item.stones?.[idx]
  if (stone === undefined) {return layoutOrder.stones.unstoned.weight }
  return layoutOrder.stones[stone.afxId]?.weight
}

const extraSorterKeys = _.difference(_.keys(Sorters), _.map(DEFAULT_ASPECTS_ORDER, 'id'))
const extraAspectKeys = _.difference(_.map(DEFAULT_ASPECTS_ORDER, 'id'), _.keys(Sorters))
if (! (_.isEmpty(extraAspectKeys))) {
  console.error('missing or extra aspects', extraAspectKeys, extraSorterKeys)
  throw new Error('Missing or extra aspects')
}

function hackyIconUrl(iconName: string | undefined): string {
  if (! iconName) { return '' }
  return `https://eggincassets.tcl.sh/256/egginc/${iconName}`
}

export function generateInventoryGrid(
  inventory: Inventory,
  options: {
    transpose: boolean,
    layoutOrder: LayoutOrderables,
    smushStoned: boolean,
  }
): InventoryGrid {

  const inventoryItems = [...inventory.items]
  const grid = <InventoryGrid>[];
  for (const item of inventoryItems) {
    // @ts-expect-error Property 'afxTier' is protected
    const afxType = item.afxTier.afx_type
    const commonProps = {
      afxId:      item.afxId,
      afxLevel:   item.afxLevel,
      iconPath:   item.iconPath,
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
        artifact.afxId    === item.afxId &&
        artifact.afxLevel === item.afxLevel &&
        // This condition is obviously true for a stoned artifact; only added so
        // that `artifact.afxRarity` can be used to index `stoned`.
        artifact.afxRarity !== Rarity.COMMON
      ) {
        stoned[artifact.afxRarity].push(artifact);
      }
    }
    for (const rarity of [Rarity.LEGENDARY, Rarity.EPIC, Rarity.RARE] as const) {
      if ((afxType === Type.ARTIFACT) && (options.smushStoned)) {
        const sameStones = _.groupBy(stoned[rarity], ({ stones }) => _.map(stones, 'id').join('~'))
        _.each(sameStones, (arr) => {
          grid.push({
            ...commonProps,
            afxRarity: rarity,
            count: arr.length,
            stones: arr[0].stones,
          });
        })
      } else {
        for (const artifact of stoned[rarity]) {
          grid.push({
            ...commonProps,
            afxRarity: rarity,
            count: 1,
            stones: artifact.stones,
          });
        }
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

  const { layoutOrder } = options

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

  return grid
}
