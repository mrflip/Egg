import _ from 'lodash'
import { Artifact, ei, Inventory, Stone, getArtifactFamilyProps } from 'lib';
import {
  LayoutAxis, LayoutOrderables, Orderable, Orderables,
  PlayerDataOptions, VisualizerConfig, VisualizerConfigAxis,
} from '@/lib';
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

const ORDERABLES_ABBRS: { [axis in VisualizerConfigAxis]: { [key: string]: string } } = {
  artifacts: _.fromPairs([
    [Name.LIGHT_OF_EGGENDIL,    'e'],
    [Name.BOOK_OF_BASAN,        'o'],
    [Name.TACHYON_DEFLECTOR,    't'],
    [Name.SHIP_IN_A_BOTTLE,     's'],
    [Name.TITANIUM_ACTUATOR,    'y'],
    [Name.DILITHIUM_MONOCLE,    'm'],
    [Name.QUANTUM_METRONOME,    'q'],
    [Name.PHOENIX_FEATHER,      'f'],
    [Name.THE_CHALICE,          'c'],
    [Name.INTERSTELLAR_COMPASS, 'i'],
    [Name.CARVED_RAINSTICK,     'r'],
    [Name.BEAK_OF_MIDAS,        'k'],
    [Name.MERCURYS_LENS,        'l'],
    [Name.NEODYMIUM_MEDALLION,  'n'],
    [Name.ORNATE_GUSSET,        'g'],
    [Name.TUNGSTEN_ANKH,        'a'],
    [Name.AURELIAN_BROOCH,      'b'],
    [Name.VIAL_MARTIAN_DUST,    'v'],
    [Name.DEMETERS_NECKLACE,    'd'],
    [Name.LUNAR_TOTEM,          'u'],
    [Name.PUZZLE_CUBE,          'p'],
  ]),
  //
  stones: _.fromPairs([
    [Name.PROPHECY_STONE,       'p'],
    [Name.CLARITY_STONE,        'c'],
    [Name.DILITHIUM_STONE,      'd'],
    [Name.LIFE_STONE,           'l'],
    [Name.QUANTUM_STONE,        'q'],
    [Name.SOUL_STONE,           's'],
    [Name.TERRA_STONE,          't'],
    [Name.TACHYON_STONE,        'x'],
    [Name.LUNAR_STONE,          'u'],
    [Name.SHELL_STONE,          'h'],
  ]),
  //
  options: { transpose: 'x', sillySizes: 'z', showTicks: 't', smushStoned: 'm', fancy: 'f' },
  //
  aspects: {
    byRarity:     'o',
    byType:       't',
    byFamily:     'g',
    byLevel:      'v',
    byStoning:    'n',
    byStoningLvl: 'z',
    //
    byStone:      's',
    byAnyStone:   'a',
    byIngredient: 'i',
    byFragment:   'f',
    byArtifact:   'x',
    //
    byLegendary:  'l',
    byEpic:       'e',
    byRare:       'r',
    byCommonArt:  'c',
    byUncommon:   'u',
    byNonLegend:  'y',
  },
  //
}

const UNABBR_ORDERABLES: { [key in VisualizerConfigAxis]: { [key: string]: string } } = _.mapValues(ORDERABLES_ABBRS, _.invert)

const DNA_AXIS_ABBRS: { [key in VisualizerConfigAxis]: string } = {
  options: 'O', aspects: 'G', artifacts: 'A', stones: 'S',
}
// @ts-ignore
const DNA_AXIS_UNABBRS: { [key in 'O' | 'G' | 'A' | 'S']: VisualizerConfigAxis } = _.invert(DNA_AXIS_ABBRS)

// _.each(ORDERABLES_ABBRS, (abbrs, kk: VisualizerConfigAxis) => {
//   const vals = _.values(abbrs).sort()
//   if (! (_.uniq(vals).length == vals.length)) {
//     throw new Error(`Duplicate key in ${kk}: ${vals.join()}`)
//   }
//   if (! (_.every(abbrs, (abbr, abkey) => UNABBR_ORDERABLES[kk][abbr] === abkey))) {
//     console.error('bad lookup table', abbrs, UNABBR_ORDERABLES[kk])
//   }
// })

function abbrOpts(val: any, name: keyof PlayerDataOptions): string {
  return val ? ORDERABLES_ABBRS.options[name] : ''
}

function dnaStrForOrderable(orderables: Orderables, key: LayoutAxis) {
  const abbrs = ORDERABLES_ABBRS[key]
  const ordIds = _.map(_.sortBy(orderables, 'weight'), 'id')
  return _.map(ordIds, (id) => abbrs[id]).join('')
}

function dnaStrForAxis(str: string, axis: LayoutAxis) {
  return `${DNA_AXIS_ABBRS[axis]}${str}`
}

export function dnaStr(bookmark: string, options: PlayerDataOptions, layoutOrder: LayoutOrderables) {
  // @ts-ignore
  const opts = _.map(options, abbrOpts).join('')
  const wts = _.mapValues(layoutOrder, dnaStrForOrderable)
  const dna = _.map({ ...wts, options: opts }, dnaStrForAxis).join('_')
  return dna
}

export function vivifyOrderables(axis: LayoutAxis, dnaseg: string): Orderables {
  try {
    const abbrs = ORDERABLES_ABBRS[axis]
    const orderables = defaultAxisOrder(axis)
    if (! dnaseg) { return orderables }
    _.each(orderables, (bag) => {
      const abbr = abbrs[bag.id]
      if (! dnaseg.includes(abbr)) { bag.weight += 50; return }
      bag.weight = dnaseg.indexOf(abbr) + 1
    })
    return orderables
  } catch (err) {
    console.error(err)
    return defaultAxisOrder(axis)
  }
}

export function vivifyDNA(dna: string): VisualizerConfig {
  const { options = '', ...obSegs } = dnaToBag(dna)
  const newConfig: VisualizerConfig = {
    aspects:   vivifyOrderables('aspects',   obSegs.aspects),
    artifacts: vivifyOrderables('artifacts', obSegs.artifacts),
    stones:    vivifyOrderables('stones',    obSegs.stones),
  } as VisualizerConfig
  newConfig.options = _.mapValues(ORDERABLES_ABBRS.options, (kk: string) => options.includes(kk)) as PlayerDataOptions
  return newConfig
}

function dnaToBag(dna: string) {
  const abbrBag = _.fromPairs(dna.split(/_/g).map((str) => ([_.first(str), str.slice(1)])))
  const ret = _.mapKeys(abbrBag, (_vv, abbr: keyof typeof DNA_AXIS_UNABBRS) => (DNA_AXIS_UNABBRS[abbr] || 'NOPE'))
  delete ret.NOPE
  return ret
}

export function validateLoadableDNA(dna: string): boolean {
  return (!! dna) && _.isString(dna) && /^(?:[AGOS][a-z]*_?)+$/.test(dna)
}

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
  byRarity:     { name: 'Rarity',            weight:  1, grain: 1, area: 'rar', id: 'byRarity',    glyph: '🎰', img: '' },
  byType:       { name: 'Type',              weight:  2, grain: 1, area: 'typ', id: 'byType',      glyph: '📇', img: '' },
  byFamily:     { name: 'Family',            weight:  3, grain: 2, area: 'fam', id: 'byFamily',    glyph: '🌈', img: '' },
  byLevel:      { name: 'Level',             weight:  4, grain: 2, area: 'lvl', id: 'byLevel',     glyph: '🚀', img: '' },
  byStoning:    { name: 'Stoning Type',      weight:  5, grain: 2, area: 'stg', id: 'byStoning',                img: hackyIconUrl('afx_clarity_stone_3.png') },
  byStoningLvl: { name: 'Stoning Level',     weight:  6, grain: 2, area: 'stl', id: 'byStoningLvl',             img: hackyIconUrl('afx_clarity_stone_2.png') },

  byStone:      { name: 'Stone',             weight: 10, grain: 3, area: 'typ', id: 'byStone',                  img: hackyIconUrl('afx_prophecy_stone_4.png') },
  byAnyStone:   { name: 'Stone or Fragment', weight: 13, grain: 2, area: 'typ', id: 'byAnyStone',               img: hackyIconUrl('afx_soul_stone_2.png') },
  byIngredient: { name: 'Ingredient',        weight: 11, grain: 3, area: 'typ', id: 'byIngredient',             img: hackyIconUrl('afx_gold_meteorite_3.png') },
  byFragment:   { name: 'Fragment',          weight: 12, grain: 3, area: 'typ', id: 'byFragment',               img: hackyIconUrl('afx_soul_stone_1.png') },
  byArtifact:   { name: 'Artifact',          weight: 14, grain: 3, area: 'typ', id: 'byArtifact',               img: hackyIconUrl('afx_quantum_metronome_4.png') },

  byLegendary:  { name: 'Legendary',         weight: 21, grain: 3, area: 'rar', id: 'byLegendary',              img: hackyIconUrl('afx_book_of_basan_4.png'), rarity: 'legendary' },
  byEpic:       { name: 'Epic',              weight: 22, grain: 3, area: 'rar', id: 'byEpic',                   img: hackyIconUrl('afx_aurelian_brooch_4.png'), rarity: 'epic' },
  byRare:       { name: 'Rare',              weight: 23, grain: 3, area: 'rar', id: 'byRare',                   img: hackyIconUrl('afx_tungsten_ankh_4.png'), rarity: 'rare' },
  byCommonArt:  { name: 'Common Artifact',   weight: 24, grain: 3, area: 'rar', id: 'byCommonArt',              img: hackyIconUrl('afx_puzzle_cube_1.png') },
  byUncommon:   { name: 'Uncommon',          weight: 25, grain: 3, area: 'rar', id: 'byUncommon',               img: hackyIconUrl('afx_puzzle_cube_4.png'), rarity: 'epic' },
  byNonLegend:  { name: 'Non-Legendary',     weight: 26, grain: 3, area: 'rar', id: 'byNonLegend', glyph: '🥱', img: '', rarity: 'epic' },
}
type AspectsKey = keyof (typeof DEFAULT_ASPECTS_ORDER)

const ASPECT_DESCRIPTIONS: { [key: AspectsKey]: string } = {
  byRarity:     'order by rarity (legendary / epic / rare / common)',
  //
  byStone:      'group all stones',
  byIngredient: 'group all ingredients',
  byFragment:   'group all fragments',
  //
  byFamily:     'group each family (metronomes, soul stones, etc) together',
  byLevel:      'order by tier (T4 .. T1)',
  byStoning:    'order artifact groups by what stones are mounted',
  byStoningLvl: 'order artifact groups by the tier of mounted stone (items with a T4 stone, then T3, ...)',
  //
  byLegendary:  'group all legendaries',
  byEpic:       'group all epics',
  byRare:       'group all rares',
  byCommonArt:  'group all commons',
  byUncommon:   'group all legendaries, epics, and rares (unsorted)',
  byNonLegend:  'group all non-legendaries (unsorted)',
  byType:       'group by type (artifact / stone / ingredient / fragment, but without any other sorting)',
  //
  byAnyStone:   'group stones and fragments together',
  byArtifact:   'group all artifacts',
}
_.each(DEFAULT_ASPECTS_ORDER, (bag: Orderable) => { bag.desc = ASPECT_DESCRIPTIONS[bag.id] })

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
  byRarity(item: GridItem)      { return (-(item.afxRarity + 1)) },
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
    if (item.afxType    === Type.ARTIFACT)         { return       (layoutOrder.artifacts[item.afxId]?.weight + 1) }
    if (item.afxType    === Type.STONE)            { return 1e3 * (layoutOrder.stones[item.nofragId]?.weight + 1) }
    if (item.afxType    === Type.INGREDIENT)       { return 1e6 * (ingredientOrder.indexOf(item.afxId) + 1) }
    if (item.afxType    === Type.STONE_INGREDIENT) { return 1e9 * (layoutOrder.stones[item.nofragId]?.weight + 1) }
    return Last
  },
  byLevel(item: GridItem)      { return -1 * (item.afxType === Type.STONE ? (item.afxLevel + 1) : item.afxLevel) },
  byType(item: GridItem)       { return typeOrder.indexOf(item.afxType) },
  byStoningLvl(item: GridItem, lo: LayoutOrderables) {
    if (! item.afxRarity) { return ((item.afxType === Type.ARTIFACT) ? 10 : 20) * 1e12 }
    return (byStoningLvlOrder(item, 0) * 1e6) // + (byStoningLvlOrder(item, 1, lo) * 1e3) + byStoningLvlOrder(item, 2, lo)
    // return Math.min(byStoningLvlOrder(item, 0, lo), byStoningLvlOrder(item, 1, lo), byStoningLvlOrder(item, 2, lo))
  },
  byStoning(item: GridItem, lo: LayoutOrderables) {
    if (! item.afxRarity) { return ((item.afxType === Type.ARTIFACT) ? 10 : 20) * 1e12 }
    return (byStoningOrder(item, 0, lo) * 1e6) + (byStoningOrder(item, 1, lo) * 1e3) + byStoningOrder(item, 2, lo)
    // return Math.min(byStoningOrder(item, 0, lo), byStoningOrder(item, 1, lo), byStoningOrder(item, 2, lo))
  },
}

function byStoningLvlOrder(item: GridItem, idx: number) {
  const stone = item.stones?.[idx]
  if (stone === undefined) { return 777 }
  return 100 - (stone.afxLevel + 1)
}

function byStoningOrder(item: GridItem, idx: number, layoutOrder: LayoutOrderables) {
  const stone = item.stones?.[idx]
  if (stone === undefined) { return 777 }
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
