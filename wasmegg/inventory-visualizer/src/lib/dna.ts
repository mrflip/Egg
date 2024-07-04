import _ from 'lodash'
import {
  ei, getLocalStorage, setLocalStorage,
} from 'lib'
import {
  LayoutAxis, LayoutOrderables, Orderables, LayoutOrderableComponent,
  PlayerDataOptions, VisualizerConfig, VisualizerConfigAxis,
} from '@/lib';
import { defaultAxisOrder } from './inventory'
//
import Name = ei.ArtifactSpec.Name;
// import Level = ei.ArtifactSpec.Level;
// import Rarity = ei.ArtifactSpec.Rarity;
// import Type = ei.ArtifactSpec.Type;

export const ORDERABLES_ABBRS: { [axis in VisualizerConfigAxis]: { [key: string]: string } } = {
  artifacts: _.fromPairs([
    [Name.LIGHT_OF_EGGENDIL,    'e'],
    [Name.BOOK_OF_BASAN,        'o'],
    [Name.TACHYON_DEFLECTOR,    'x'],
    [Name.SHIP_IN_A_BOTTLE,     's'],
    [Name.TITANIUM_ACTUATOR,    'y'],
    [Name.DILITHIUM_MONOCLE,    'm'],
    [Name.QUANTUM_METRONOME,    'q'],
    [Name.PHOENIX_FEATHER,      'f'],
    [Name.THE_CHALICE,          't'],
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
    [Name.LUNAR_TOTEM,          'z'],
    [Name.PUZZLE_CUBE,          'p'],
  ]),
  //
  aspects: {
    // d w z remaining
    byRarity:      'o',
    byType:        't',
    byFamily:      'g',
    byLevel:       'v',
    byStoningFam:  'd',
    byStoningTier: 'w',
    byStoningF1:   'm',
    // byStoningF2:   'n',
    byStoningT1:   'p',
    // byStoningT2:   'q',
    //
    byStone:       's',
    byAnyStone:    'a',
    byStFrIn:      'b',
    byIngredient:  'i',
    byFragment:    'f',
    byArtifact:    'x',
    //
    byRare:        'r',   //     R
    byEpic:        'e',   //   E
    byEpicRare:    'h',   //   E R
    byLegendary:   'l',   // L
    byLegRare:     'j',   // L   R
    byLegEpic:     'k',   // L E
    byUncommon:    'u',   // L E R
    byNonLegend:   'y',   //   E R C
    byCommonArt:   'c',   //       C
  },
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
    [Name.GOLD_METEORITE,       'm'],
    [Name.SOLAR_TITANIUM,       'i'],
    [Name.TAU_CETI_GEODE,       'g'],
    ['unstoned',                'z'],
  ]),
  //
  options: { transpose: 'x', sillySizes: 'z', showTicks: 't', smushStoned: 'm', fancy: 'f', showSidecar: 's' },
}

const DEFAULT_OPTIONS = {
  transpose:    false,
  sillySizes:   false,
  showTicks:    false,
  smushStoned:  false,
  showSidecar:  false,
  fancy:        false,
  perCol:       '',
  boxMax:       '1280',
}

export const UNABBR_ORDERABLES: { [key in VisualizerConfigAxis]: { [key: string]: string } } = _.mapValues(ORDERABLES_ABBRS, _.invert)

export const DNA_AXIS_ABBRS: { [key in VisualizerConfigAxis | 'perCol' | 'boxMax']: string } = {
  options: 'O', artifacts: 'A', aspects: 'G', stones: 'S', perCol: 'P', boxMax: 'X'
}

type DnaAxisUnabbrsT = { [key in 'O' | 'A' | 'G' | 'S' | 'P' | 'X']: VisualizerConfigAxis | 'perCol' | 'boxMax' }
export const DNA_AXIS_UNABBRS: DnaAxisUnabbrsT = _.invert(DNA_AXIS_ABBRS) as DnaAxisUnabbrsT

// _.each(ORDERABLES_ABBRS, (abbrs, kk: VisualizerConfigAxis) => {
//   const vals = _.values(abbrs).sort()
//   if (! (_.uniq(vals).length == vals.length)) {
//     throw new Error(`Duplicate key in ${kk}: ${vals.join()}`)
//   }
//   if (! (_.every(abbrs, (abbr, abkey) => UNABBR_ORDERABLES[kk][abbr] === abkey))) {
//     console.error('bad lookup table', abbrs, UNABBR_ORDERABLES[kk])
//   }
// })

export type OldBookKey = 'BkA' | 'BkB' | 'BkC' | 'BkD' | 'BkE' | 'BkF'

export const BOOKMARK_PROPS: { [name in Bookmarker]: BookmarkInfo } = {
  Bk1: { id: "Bk1", label: 'Slot A', oldbk: 'BkA' },
  Bk2: { id: "Bk2", label: 'Slot B', oldbk: 'BkB' },
  Bk3: { id: "Bk3", label: 'Slot C', oldbk: 'BkC' },
  Bk4: { id: "Bk4", label: 'Slot D', oldbk: 'BkD' },
  Bk5: { id: "Bk5", label: 'Slot E', oldbk: 'BkE' },
  Bk6: { id: "Bk6", label: 'Slot F', oldbk: 'BkF' },
}
export type Bookmarker = 'Bk1' | 'Bk2' | 'Bk3' | 'Bk4' | 'Bk5' | 'Bk6'
export interface BookmarkInfo { id: Bookmarker, label: string, oldbk: OldBookKey }

export interface BookmarkDnas {
  Bk1:          DnaStr
  Bk2:          DnaStr
  Bk3:          DnaStr
  Bk4:          DnaStr
  Bk5:          DnaStr
  Bk6:          DnaStr
}

export const DEFAULT_BOOKMARK: Bookmarker = 'Bk1'

const LOCALSTORAGE_KEYS: { [key in Bookmarker | 'wasMigrated' | 'slotNames']: string } = {
  Bk1:          'Sg1Sto',
  Bk2:          'Sg2Sto',
  Bk3:          'Sg3Sto',
  Bk4:          'Sg4Sto',
  Bk5:          'Sg5Sto',
  Bk6:          'Sg6Sto',
  wasMigrated:  'wasMigratedSto',
  slotNames:    'slotNamesSto',
}
export type StorageKeyName = keyof (typeof LOCALSTORAGE_KEYS);

export const DEFAULT_SLOT_NAMES = _.mapValues(BOOKMARK_PROPS, 'label')
export type SlotProps = { [key: string]: string }

export type DnaStr = string

const DEFAULT_DNA = dnaStr(DEFAULT_OPTIONS, {
  artifacts:    defaultAxisOrder('artifacts'),
  aspects:      defaultAxisOrder('aspects'),
  stones:       defaultAxisOrder('stones')
})

export function defaultDNA() { return DEFAULT_DNA }

export function resetAxis(comp: LayoutOrderableComponent, axis: LayoutAxis) {
  const orderables = defaultAxisOrder(axis)
  comp[axis] = orderables
}

export function loadSavedDNA(): BookmarkDnas {
  const arrangements: BookmarkDnas = _.mapValues(BOOKMARK_PROPS, loadSavedFor) as BookmarkDnas
  if (! getWasMigrated()) {
    // @ts-expect-error lodash type effery
    _.each(arrangements, (dna: DnaStr, bookmark: Bookmarker) => {
      if (dna !== DEFAULT_DNA) { saveDNA(dna, bookmark) }
    })
  }
  setWasMigrated()
  return arrangements
}

type JsonLoadable = Orderables | PlayerDataOptions | SlotProps
function mergeLoaded<T extends JsonLoadable>(fallback: T, parsed: Partial<T>): T {
  return _.pick(_.merge({}, fallback, parsed), _.keys(fallback)) as T
}

export function saveDNA(dna: DnaStr, bookmark: Bookmarker) {
  if (! validateDNA(dna)) { console.warn('invalid dna, not saving', dna); return }
  setLocalStorage(storageKeyFor(bookmark), dna)
}

export function loadSlotNames(): SlotProps {
  const fallback = _.cloneDeep(DEFAULT_SLOT_NAMES)
  const rawJson  = getLocalStorage(storageKeyFor('slotNames'))
  if (rawJson) {
    try {
      const slots = mergeLoaded<SlotProps>(fallback, JSON.parse(rawJson))
      return slots
    } catch (err) {
      console.error('Could not parse json', rawJson, fallback)
      return fallback
    }
  }
  return fallback
}

export function storeSlotNames(bag: SlotProps) {
  setLocalStorage(storageKeyFor('slotNames'), JSON.stringify(bag))
}

function getWasMigrated() {
  return String(getLocalStorage(storageKeyFor('wasMigrated'))) === 'true'
}

function setWasMigrated() {
  setLocalStorage(storageKeyFor('wasMigrated'), 'true')
}

function storageKeyFor(concern: Bookmarker | 'wasMigrated' | 'slotNames') {
  return LOCALSTORAGE_KEYS[concern]
}

function loadSavedFor(bookmarkInfo: BookmarkInfo) {
  const dna = getLocalStorage(storageKeyFor(bookmarkInfo.id)) || ''
  if (dna) { return dna }
  // const migrated = migrateOldBk(bookmarkInfo.oldbk)
  // if (migrated) { return migrated }
  return DEFAULT_DNA
}

// function migrateOldBk(oldbk: OldBookKey) {
//   const options   = loadOldOptions(oldbk)
//   if (! options) { return '' }
//   const artifacts   = loadOldLayoutAxis('artifacts', `layoutOrderArtifacts${oldbk}`)
//   const aspects     = loadOldLayoutAxis('aspects' ,  `layoutOrderAspects${oldbk}`)
//   const stones      = loadOldLayoutAxis('stones',    `layoutOrderStones${oldbk}`)
//   const perCol      = getLocalStorageNumStr(`itemsPerColStorageKey${oldbk}`, '')
//   if (_.some([aspects, artifacts, stones], _.isEmpty)) { return '' }
//   return dnaStr({ ...options, perCol }, { artifacts, aspects, stones } as LayoutOrderables)
// }

// function getLocalStorageNumStr(key: StorageKeyName, fallback: string): string {
//   const val = getLocalStorage(String(key))
//   if (_.isFinite(Number(val))) { return val as string }
//   return fallback
// }

export function validateDNA(dna: string): boolean {
  // Aldbnvztpqgerskoyfmxia_Glxaigrecynzvufsothjk_Slhxstpqcdu_Oxtmf_P20_X1280
  return (!! dna) && _.isString(dna) && /^(?:[AGOS][a-z]*_?|P\d{0,3}_?|X\d{0,4}_?)+$/.test(dna)
}

export function dnaStr(options: PlayerDataOptions, layoutOrder: LayoutOrderables) {
  const { perCol, boxMax, ...bools } = options
  const pc     = /^\d+$/.test(perCol) ? String(perCol).slice(0, 3) : ''
  const bx     = /^\d+$/.test(boxMax) ? String(boxMax).slice(0, 4) : ''
  const opts   = _.map(bools, abbrOpts).join('')
  const wts    = _.mapValues(layoutOrder, dnaStrForOrderable)
  const dna    = _.map({ ...wts, options: opts }, dnaStrForAxis).join('_') + `_P${pc}` + `_X${bx}`
  return dna
}

export function vivifyOrderables(axis: LayoutAxis, dnaseg: string): Orderables {
  try {
    const abbrs      = ORDERABLES_ABBRS[axis]
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
  const { options = '', perCol = '', boxMax = '1280', ...obSegs } = dnaToBag(dna)
  const newConfig: VisualizerConfig = {
    artifacts: vivifyOrderables('artifacts', obSegs.artifacts),
    aspects:   vivifyOrderables('aspects',   obSegs.aspects),
    stones:    vivifyOrderables('stones',    obSegs.stones),
  } as VisualizerConfig
  newConfig.options = _.mapValues(ORDERABLES_ABBRS.options, (kk: string) => options.includes(kk)) as PlayerDataOptions
  newConfig.options.perCol = perCol
  newConfig.options.boxMax = boxMax
  return newConfig
}

function abbrOpts(val: unknown, name: keyof PlayerDataOptions): string {
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

function dnaToBag(dna: string) {
  const abbrBag = _.fromPairs(dna.split(/_/g).map((str) => ([_.first(str), str.slice(1)])))
  const ret = _.mapKeys(abbrBag, (_vv, abbr: keyof typeof DNA_AXIS_UNABBRS) => (DNA_AXIS_UNABBRS[abbr] || 'NOPE'))
  delete ret.NOPE
  return ret
}

// function getOnlyWeights(orderables: Orderables) {
//   return _.mapValues(orderables, (orderable) => _.pick(orderable, ['weight']))
// }

// function loadOldOptions(oldbk: OldBookKey): PlayerDataOptions | null {
//   const optionsJson = getLocalStorage(`optionsBag${oldbk}`)
//   if (optionsJson) {
//     try {
//       const merged = mergeLoaded(DEFAULT_OPTIONS, JSON.parse(optionsJson)) as PlayerDataOptions
//       return merged
//     }  catch (err) { console.warn("could not parse stored JSON", optionsJson, err) }
//   }
//   return null // if nothing or error
// }

// function loadOldLayoutAxis(axis: LayoutAxis, storageKey: string): Orderables | null {
//   const axisJson = getLocalStorage(storageKey)
//   if (axisJson) {
//     try {
//       const parsed = getOnlyWeights(JSON.parse(axisJson))
//       const merged = mergeLoaded<Orderables>(defaultAxisOrder(axis), parsed as Partial<Orderables>)
//       return merged as Orderables
//     } catch (err) { console.warn("could not parse stored JSON", axis, axisJson, err) }
//   }
//   return null
// }
