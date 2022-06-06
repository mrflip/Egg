import _ from 'lodash'
import {
  Artifact, ei, Inventory, Stone, getArtifactFamilyProps, getLocalStorage, setLocalStorage,
} from 'lib'
import {
  LayoutAxis, LayoutOrderables, Orderable, Orderables, LayoutOrderableComponent,
  PlayerDataOptions, VisualizerConfig, VisualizerConfigAxis,
} from '@/lib';
import { defaultAxisOrder } from './inventory'
//
import Name = ei.ArtifactSpec.Name;
import Level = ei.ArtifactSpec.Level;
import Rarity = ei.ArtifactSpec.Rarity;
import Type = ei.ArtifactSpec.Type;

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
}

const DEFAULT_OPTIONS = {
  transpose:    false,
  sillySizes:   false,
  showTicks:    false,
  smushStoned:  false,
  fancy:        false,
  perCol:       '',
}

export const UNABBR_ORDERABLES: { [key in VisualizerConfigAxis]: { [key: string]: string } } = _.mapValues(ORDERABLES_ABBRS, _.invert)

export const DNA_AXIS_ABBRS: { [key in VisualizerConfigAxis | 'perCol']: string } = {
  options: 'O', artifacts: 'A', aspects: 'G', stones: 'S', perCol: 'P',
}
// @ts-ignore
export const DNA_AXIS_UNABBRS: { [key in 'O' | 'G' | 'A' | 'S' | 'P']: VisualizerConfigAxis | 'perCol' } = _.invert(DNA_AXIS_ABBRS)

// _.each(ORDERABLES_ABBRS, (abbrs, kk: VisualizerConfigAxis) => {
//   const vals = _.values(abbrs).sort()
//   if (! (_.uniq(vals).length == vals.length)) {
//     throw new Error(`Duplicate key in ${kk}: ${vals.join()}`)
//   }
//   if (! (_.every(abbrs, (abbr, abkey) => UNABBR_ORDERABLES[kk][abbr] === abkey))) {
//     console.error('bad lookup table', abbrs, UNABBR_ORDERABLES[kk])
//   }
// })

export type OldBookKey = 'BkA' | 'BkB' | 'BkC' | 'BkD'

export const BOOKMARK_PROPS: { [name in Bookmarker]: BookmarkInfo } = {
  Bk1: { id: "Bk1", label: 'Save A', oldbk: 'BkA' },
  Bk2: { id: "Bk2", label: 'Save B', oldbk: 'BkB' },
  Bk3: { id: "Bk3", label: 'Save C', oldbk: 'BkC' },
  Bk4: { id: "Bk4", label: 'Save D', oldbk: 'BkD' },
}
export type Bookmarker = 'Bk1' | 'Bk2' | 'Bk3' | 'Bk4'
export interface BookmarkInfo { id: Bookmarker, label: string, oldbk: OldBookKey }

export interface BookmarkDnas {
  Bk1:          DnaStr
  Bk2:          DnaStr
  Bk3:          DnaStr
  Bk4:          DnaStr
}

export const DEFAULT_BOOKMARK: Bookmarker = 'Bk1'

const LOCALSTORAGE_KEYS: { [key in Bookmarker | 'wasMigrated']: string } = {
  Bk1:          'Sg1Sto',
  Bk2:          'Sg2Sto',
  Bk3:          'Sg3Sto',
  Bk4:          'Sg4Sto',
  wasMigrated:  'wasMigratedSto',
}
export type StorageKeyName = keyof (typeof LOCALSTORAGE_KEYS);

export type DnaStr = string

const DEFAULT_DNA = dnaStr(DEFAULT_OPTIONS, {
  artifacts: defaultAxisOrder('artifacts'),
  aspects: defaultAxisOrder('aspects'),
  stones: defaultAxisOrder('stones')
})

export function defaultDNA() { return DEFAULT_DNA }

export function resetAxis(comp: LayoutOrderableComponent, axis: LayoutAxis) {
  const orderables = defaultAxisOrder(axis)
  comp[axis] = orderables
}

export function loadSavedDNA(): BookmarkDnas {
  const arrangements: BookmarkDnas = _.mapValues(BOOKMARK_PROPS, loadSavedFor) as BookmarkDnas
  if (! getWasMigrated()) {
    // @ts-ignore
    _.each(arrangements, (dna: DnaStr, bookmark: Bookmarker) => {
      if (dna !== DEFAULT_DNA) { saveDNA(dna, bookmark) }
    })
  }
  setWasMigrated()
  return arrangements
}

export function saveDNA(dna: DnaStr, bookmark: Bookmarker) {
  if (! validateDNA(dna)) { console.warn('invalid dna, not saving', dna); return }
  setLocalStorage(storageKeyFor(bookmark), dna)
}

function getWasMigrated() {
  return String(getLocalStorage(storageKeyFor('wasMigrated'))) === 'true'
}

function setWasMigrated() {
  setLocalStorage(storageKeyFor('wasMigrated'), 'true')
}

function storageKeyFor(concern: Bookmarker | 'wasMigrated') {
  return LOCALSTORAGE_KEYS[concern]
}

function loadSavedFor(bookmarkInfo: BookmarkInfo) {
  const dna = getLocalStorage(storageKeyFor(bookmarkInfo.id)) || ''
  if (dna) { return dna }
  const migrated = migrateOldBk(bookmarkInfo.oldbk)
  console.log(migrated, dna, 'got migrated', bookmarkInfo.id)
  if (migrated) { return migrated }
  return DEFAULT_DNA
}

function migrateOldBk(oldbk: OldBookKey) {
  const options   = loadOldOptions(oldbk)
  if (! options) { return '' }
  const artifacts   = loadOldLayoutAxis('artifacts', `layoutOrderArtifacts${oldbk}`)
  const aspects     = loadOldLayoutAxis('aspects' ,  `layoutOrderAspects${oldbk}`)
  const stones      = loadOldLayoutAxis('stones',    `layoutOrderStones${oldbk}`)
  // @ts-ignore
  const perCol      = getLocalStorageNumStr(`itemsPerColStorageKey${oldbk}`, '')
  if (_.some([aspects, artifacts, stones], _.isEmpty)) { return '' }
  // @ts-ignore
  return dnaStr({ ...options, perCol }, { artifacts, aspects, stones } as Orderables)
}

function getLocalStorageNumStr(key: StorageKeyName, fallback: string): string {
  const val = getLocalStorage(String(key))
  if (_.isFinite(Number(val))) { return val as string }
  return fallback
}

export function validateDNA(dna: string): boolean {
  return (!! dna) && _.isString(dna) && /^(?:[AGOS][a-z]*_?|P\d{0,3})+$/.test(dna)
}

export function dnaStr(options: PlayerDataOptions, layoutOrder: LayoutOrderables) {
  const { perCol, ...bools } = options
  // @ts-ignore
  const pc     = /^\d+$/.test(perCol) ? String(perCol).slice(0, 3) : ''
  // @ts-ignore
  const opts   = _.map(bools, abbrOpts).join('')
  const wts    = _.mapValues(layoutOrder, dnaStrForOrderable)
  const dna    = _.map({ ...wts, options: opts }, dnaStrForAxis).join('_') + `_P${pc}`
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
  const { options = '', perCol = '', ...obSegs } = dnaToBag(dna)
  const newConfig: VisualizerConfig = {
    artifacts: vivifyOrderables('artifacts', obSegs.artifacts),
    aspects:   vivifyOrderables('aspects',   obSegs.aspects),
    stones:    vivifyOrderables('stones',    obSegs.stones),
  } as VisualizerConfig
  newConfig.options = _.mapValues(ORDERABLES_ABBRS.options, (kk: string) => options.includes(kk)) as PlayerDataOptions
  newConfig.options.perCol = perCol
  return newConfig
}

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

function dnaToBag(dna: string) {
  const abbrBag = _.fromPairs(dna.split(/_/g).map((str) => ([_.first(str), str.slice(1)])))
  const ret = _.mapKeys(abbrBag, (_vv, abbr: keyof typeof DNA_AXIS_UNABBRS) => (DNA_AXIS_UNABBRS[abbr] || 'NOPE'))
  delete ret.NOPE
  return ret
}

function getOnlyWeights(orderables: Orderables) {
  return _.mapValues(orderables, (orderable) => _.pick(orderable, ['weight']))
}

function mergeLoaded(fallback: Orderables | PlayerDataOptions, parsed: Partial<Orderables> | Partial<PlayerDataOptions>) {
  return _.pick(_.merge({}, fallback, parsed), _.keys(fallback))
}

function loadOldOptions(oldbk: OldBookKey): PlayerDataOptions | null {
  const optionsJson = getLocalStorage(`optionsBag${oldbk}`)
  if (optionsJson) {
    try {
      const merged = mergeLoaded(DEFAULT_OPTIONS, JSON.parse(optionsJson)) as PlayerDataOptions
      return merged
    }  catch (err) { console.warn("could not parse stored JSON", optionsJson, err) }
  }
  return null // if nothing or error
}

function loadOldLayoutAxis(axis: LayoutAxis, storageKey: string): Orderables | null {
  const axisJson = getLocalStorage(storageKey)
  if (axisJson) {
    try {
      const parsed = getOnlyWeights(JSON.parse(axisJson))
      const merged = mergeLoaded(defaultAxisOrder(axis), parsed)
      return merged as Orderables
    } catch (err) { console.warn("could not parse stored JSON", axis, axisJson, err) }
  }
  return null
}
