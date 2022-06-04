<template>

<template v-if="true && loaded">
  <inventory-canvas
    :inventory="inventory"
    :artifacts="artifacts"
    :stones="stones"
    :aspects="selaspects"
    :bookmark="bookmark"
    :show-ticks="options.showTicks"
    :smush-stoned="options.smushStoned"
    :transpose="options.transpose"
    :silly-sizes="options.sillySizes"
  />
</template>

<tabs
  :options="{ useUrlFragment: false, defaultTabHash: 'grouping_tab' }"
  class="max-w-[1024px] m-auto"
  nav-class="tab-nav flex 2xl:px-32 flex-row my-8 md:items-stretch items-center justify-around"
  nav-item-class="tabs-nav grow flex py-2"
  nav-item-link-class="tabs-tab-nav flex w-full justify-center text-center"
  nav-item-active-class="tab-is-active bg-gray-200"
  nav-item-disabled-class="bg-red"
  panels-wrapper-class="min-h-[400px] tabs-panels  border border-blue-100"
>
  <tab id="options_tab" name="Options" class="p-2 mb-4 flex flex-col items-center justify-start Aspects ordering" :selected="true">
    <select id="bookmarks" v-model="bookmark" class="my-1" name="bookmarks" @change="handleBookmarkChange">
      <template v-for="bkInfo of bookmarkProps" :key="bkInfo.id">
        <option :value="bkInfo.id">{{ bkInfo.label }}</option>
      </template>
    </select>
    <div class="flex flex-col justify-start mt-2">
    <check-option id="transpose" class="w-full ml-2 mb-2" :checked="options.transpose" @change="updateTranspose">Swap Rows / Columns</check-option>
    <check-option id="sillySizes" class="w-full ml-2 mb-2" :checked="options.sillySizes" @change="updateSillySizes">Allow Silly Sizes</check-option>
    <check-option id="showTicks" class="w-full ml-2 mb-2" :checked="options.showTicks" @change="updateShowTicks">Show Tickmarks</check-option>
    <check-option id="smushStoned" class="w-full ml-2 mb-2" :checked="options.smushStoned" @change="updateSmushStoned">Combine Similar Artifacts</check-option>
    </div>
    <reset-button class="mt-2" @click="resetAllMaybe">Reset {{ bookmarkProps[bookmark]?.label }}</reset-button>
    <reset-button class="bg-purple-200" @click="() => randomizeAxis('aspects')">I'm Feeling Lucky!</reset-button>

  </tab>

  <tab
    id="grouping_tab"
    name="Groups"
    class="p-2 mb-4 flex flex-col items-start justify-around Aspects ordering"
    :selected="false"
  >

    <div class="flex flex-row w-full items-start justify-around">

      <div class="flex w-full items-center justify-center flex-col">
        <h3 class="mb-2 font-bold m-2 text-center">Groups</h3>
        <drag-orderer item-classes="w-60" :layout-order="selaspects" group="aspects" direction="vert" @update-order="updateAspectsLayout">
          <template #listItem="{element}">
            <div class="h-7 w-7 relative rounded-full isolate bg-epic">
              <img v-if="element.rarity" class="absolute h-9 w-8 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" :src="`https://eggincassets.tcl.sh/256/egginc-extras/glow/${element.rarity}-13.png`" />
              <img v-if="element.img" class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
              <span v-else class="absolute p-1 z-10 text-xl">{{ element.glyph }}</span>
            </div>
            <span class="m-1">{{ element.name }}</span>
          </template>
        </drag-orderer>
        <reset-button @click="() => resetAxis('aspects')">Reset Sorting</reset-button>
        <reset-button class="bg-purple-200" @click="() => randomizeAxis('aspects')">I'm Feeling Lucky!</reset-button>
        <div class="flex w-full justify-center">
          <check-option id="fancy" class="ml-2 mt-2" :checked="options.fancy" @change="updateFancy">Fancy Groupings</check-option>
        </div>
      </div>

      <div class="flex w-full items-center content-center justify-center flex-col hidden md:block">
        <h3 class="mb-2 font-bold m-2 text-center">Artifact Ordering</h3>
        <drag-orderer item-classes="w-60 max-h-10 mb-1 items-center" group="artifacts" :layout-order="artifacts" direction="vert" @update-order="updateArtifactsLayout">
          <template #listItem="{element}">
            <div class="h-7 w-7 relative rounded-full isolate">
              <img class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
            </div>
            <span class="m-1 ml-1.5">{{ element.name }}</span>
          </template>
        </drag-orderer>
        <reset-button @click="() => resetAxis('artifacts')">Reset Artifacts</reset-button>
      </div>

      <div class="flex w-full items-center justify-center flex-col hidden md:block">

        <h3 class="mb-2 font-bold m-2 text-center">Stones Ordering</h3>
        <drag-orderer item-classes="w-60 stone" :layout-order="stones" group="stones" direction="vert" @update-order="updateStonesLayout">
          <template #listItem="{element}">
            <div class="h-8 w-8 relative isolate">
              <img class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
            </div>
            <span class="m-1">{{ element.name }}</span>
          </template>
        </drag-orderer>
        <div class="h-full flex flex-col justify-end">
          <reset-button @click="() => resetAxis('stones')">Reset Stones</reset-button>
        </div>
      </div>
    </div>
  </tab>

  <tab id="artifact_tab" name="Artifacts" class="p-2 mb-4 flex flex-col items-center Artifacts ordering">
    <h3 class="mb-2 font-bold m-2 text-center">Artifact Ordering</h3>
    <drag-orderer item-classes="w-60 max-h-10 mb-1 items-center" group="artifacts" :layout-order="artifacts" direction="vert" @update-order="updateArtifactsLayout">
      <template #listItem="{element}">
        <div class="h-7 w-7 relative rounded-full isolate">
          <img class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
        </div>
        <span class="m-1 ml-1.5">{{ element.name }}</span>
      </template>
    </drag-orderer>
    <reset-button @click="() => resetAxis('artifacts')">Reset Artifacts</reset-button>
  </tab>

  <tab id="stone_tab" name="Stones" class="p-2 mb-4 flex flex-col items-center Stones ordering">
    <h3 class="mb-2 font-bold m-2 text-center">Stones Ordering</h3>
    <drag-orderer item-classes="w-60 stone" :layout-order="stones" group="stones" direction="vert" @update-order="updateStonesLayout">
      <template #listItem="{element}">
        <div class="h-8 w-8 relative isolate">
          <img class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
        </div>
        <span class="m-1">{{ element.name }}</span>
      </template>
    </drag-orderer>
    <div class="h-full flex flex-col justify-end">
      <reset-button @click="() => resetAxis('stones')">Reset Stones</reset-button>
    </div>
  </tab>
</tabs>

<div class="flex flex-col w-full items-center justify-center">
  <div class="text-left mt-2 px-2 max-w-[600px] lg:max-w-[800px]">
    <h3 class="mb-2 font-bold m-2 text-center">How this works</h3>
    <p>
      To organize your inventory we
      {{ options.smushStoned ? 'first combine all items with the same stoning into a square. Then we' : '' }}
    </p>
    <ul class="pl-4">
      <li class="list-disc">{{ examples[0]?.desc }};      </li>
      <li class="list-disc">then {{ examples[1]?.desc }}, </li>
      <li class="list-disc">then {{ examples[2]?.desc }}, </li>
      <li class="list-disc">then {{ examples[3]?.desc }}, </li>
      <li class="list-disc">then {{ examples[4]?.desc }}, </li>
    </ul>
    <p class="mb-2">
      and so forth. You can change that in the 'Groups' tab.
    </p>
    <p class="mt-2 mb-2">
      When it comes time to sort by Family, we will use the order
      you choose in the "Artifacts" tab: the way it is now puts the
      {{ firstArtifact }} first and the {{ lastArtifact }} last.
      Similarly, the "Stones" widget is set to choose the
      {{ firstStone }} first for stones and fragments
      and when sorting by mounted stone.
    </p>
    <p v-if="examples.slice(4).some(({ id }) => (id === 'byStoning'))">
      But if you, say, moved '{{ aspects.byStoning?.name }}' to the top, it would first {{ aspects.byStoning?.desc }}.
    </p>
    <p v-else-if="examples.slice(4).some(({ id }) => (id === 'byFamily'))">
      But if you, say, moved '{{ aspects.byFamily?.name }}' to the top, it would first {{ aspects.byFamily?.desc }}.
    </p>
    <p v-else>
      But if you, say, moved '{{ _.last(examples).name }}' to the top, it would first {{ _.last(examples).desc }}.
    </p>
    <p class="mt-2">
      Or -- instead of reading blah blah blah, click the "I'm Feeling
      Lucky!" buttonn and play around with what comes out. (The button
      probably isn't a rickroll, you'll have to weigh the risks.)
    </p>
  </div>
</div>

</template>

<script lang="ts">
import _ from 'lodash'
import { defineComponent } from 'vue';
import { getLocalStorage, setLocalStorage, Inventory, requestFirstContact, UserBackupEmptyError } from 'lib';
import { defaultAxisOrder, Orderables } from '@/lib'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
import {Tabs, Tab} from 'vue3-tabs-component'

import InventoryCanvas from '@/components/InventoryCanvas.vue';
import DragOrderer from '@/components/DragOrderer.vue';
import ResetButton from '@/components/ResetButton.vue';
import CheckOption from '@/components/CheckOption.vue'

async function fetchArtifactsDb(playerId: string) {
  const userinfo = await requestFirstContact(playerId);
  if (!userinfo.backup || !userinfo.backup.game) {
    throw new UserBackupEmptyError(playerId);
  }
  const backup = userinfo.backup;
  if (!backup.settings) {
    throw new Error(`${playerId}: settings not found in backup`);
  }
  const artifactsDb = backup.artifactsDb;
  if (!artifactsDb) {
    throw new Error(`${playerId}: no artifacts database in backup`);
  }
  return artifactsDb
}

const LOCALSTORAGE_KEYS = {
  aspects:   'layoutOrderAspects',
  artifacts: 'layoutOrderArtifacts',
  stones:    'layoutOrderStones',
  options:   'optionsBag'
}
type StorageKeyName = keyof (typeof LOCALSTORAGE_KEYS);
type OrderablesAxis = 'aspects' | 'artifacts' | 'stones'

export interface PlayerDataOptions {
  transpose:    boolean
  sillySizes:   boolean
  showTicks:    boolean
  smushStoned:  boolean
  fancy:        boolean
  coarse:       boolean
}


const DEFAULT_OPTIONS = {
  transpose:    false,
  sillySizes:   false,
  showTicks:    false,
  smushStoned:  false,
  fancy:        false,
  coarse:       false,
}

// const COARSE_GRAIN = 1
const ALWAYS_GRAIN = 2
const FANCY_GRAIN  = 3

const BOOKMARK_PROPS = {
  BkA: { id: "BkA", label: 'Bookmark A' },
  BkB: { id: "BkB", label: 'Bookmark B' },
  BkC: { id: "BkC", label: 'Bookmark C' },
}
type Bookmarker = keyof (typeof BOOKMARK_PROPS);
const DEFAULT_BOOKMARK: Bookmarker = 'BkA'

function getStorageKey(keyName: StorageKeyName, bookmark: string) {
  return `${LOCALSTORAGE_KEYS[keyName]}${bookmark}`
}

function storeOptions(options: PlayerDataOptions, bookmark: Bookmarker) {
  if (! bookmark) { console.error('no bookmark!', bookmark); return }
  setLocalStorage(getStorageKey('options', bookmark), JSON.stringify(options))
}

function storeLayoutAxis(orderables: Orderables, axis: OrderablesAxis, bookmark: Bookmarker) {
  if (! bookmark) { console.error('no bookmark!', bookmark); return }
  setLocalStorage(getStorageKey(axis, bookmark), JSON.stringify(getOrderablesDna(orderables)))
}

function loadOptions(bookmark: Bookmarker): PlayerDataOptions {
  const storageKey = getStorageKey('options', bookmark)
  //
  const optionsJson = getLocalStorage(storageKey) || null
  if (optionsJson) {
    try {
      const parsed = JSON.parse(optionsJson)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
      return _.pick(_.merge({}, DEFAULT_OPTIONS, parsed), _.keys(DEFAULT_OPTIONS))
    }  catch (err) {
      console.warn("could not parse stored JSON", optionsJson, err)
    }
  }
  // if nothing or error
  storeOptions(DEFAULT_OPTIONS, bookmark)
  return _.cloneDeep(DEFAULT_OPTIONS)
}

function loadLayoutAxis(axis: OrderablesAxis, bookmark: Bookmarker): Orderables {
  const fallback   = defaultAxisOrder(axis)
  const storageKey = getStorageKey(axis, bookmark)
  //
  const axisJson = getLocalStorage(storageKey) || null
  if (axisJson) {
    try {
      const parsed = getOrderablesDna(JSON.parse(axisJson))
      // allow the keys to change without having leftover/missing entries
      const combined = _.pick(_.merge({}, fallback, parsed), _.keys(fallback))
      return combined
    } catch (err) {
      console.warn("could not parse stored JSON", axisJson, err)
    }
  }
  // if nothing or error
  storeLayoutAxis(fallback, axis, bookmark)
  return fallback
}

function loadLayoutAll(bookmark: Bookmarker = DEFAULT_BOOKMARK) {
  const aspects   = loadLayoutAxis('aspects',   bookmark)
  const artifacts = loadLayoutAxis('artifacts', bookmark)
  const stones    = loadLayoutAxis('stones',    bookmark)
  return { aspects, artifacts, stones }
}

function getOrderablesDna(orderables: Orderables) {
  return _.mapValues(orderables, (orderable) => _.pick(orderable, ['weight']))
}

interface LayoutOrderableComponent {
  stones: Orderables, artifacts: Orderables, aspects: Orderables, bookmark: Bookmarker,
}

function randomizeAxis(comp: LayoutOrderableComponent, axis: OrderablesAxis) {
  const shuff1 = _.shuffle(_.values(_.groupBy(defaultAxisOrder(axis), 'area')))
  const shuff2 = _.flatten(_.map(shuff1, _.shuffle))
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const newOrder = _.mapKeys(_.map(shuff2, (ob, idx) => ({ ...ob, weight: idx + 1 })), 'id')
  storeLayoutAxis(newOrder, axis, comp.bookmark)
  comp[axis] = newOrder

}

function resetAxis(comp: LayoutOrderableComponent, axis: OrderablesAxis) {
  const orderables = defaultAxisOrder(axis)
  storeLayoutAxis(orderables, axis, comp.bookmark)
  comp[axis] = orderables
}

function resetAll(comp: LayoutOrderableComponent) {
  resetAxis(comp, 'aspects')
  resetAxis(comp, 'stones')
  resetAxis(comp, 'artifacts')
  storeOptions(DEFAULT_OPTIONS, comp.bookmark)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  comp.options = DEFAULT_OPTIONS
}

function selectAspects(aspects: Orderables, options: PlayerDataOptions) {
  return _.pickBy(aspects, ({ grain }) => {
    if (grain === ALWAYS_GRAIN) { return true }
    if (grain === FANCY_GRAIN) { return (options.fancy) }
    return (! options.fancy) // || options.coarse
  })
}

export default defineComponent({
  components: {
    DragOrderer, InventoryCanvas, ResetButton, Tabs, Tab, CheckOption,
  },
  props: {
    playerId: {
      type: String,
      required: true,
    },
  },

  data() {
    const bookmark: Bookmarker = DEFAULT_BOOKMARK
    // I don't know how to make ts happy most of the time
    const inventory: any = null // eslint-disable-line @typescript-eslint/no-explicit-any
    const options: PlayerDataOptions = loadOptions(bookmark)
    const aspects   = loadLayoutAxis('aspects',   bookmark)
    const artifacts = loadLayoutAxis('artifacts', bookmark)
    const stones    = loadLayoutAxis('stones',    bookmark)
    return {
      loaded:           false,
      artifacts,
      stones,
      aspects,
      options,
      bookmark,
      inventory,
      console,
      bookmarkProps:    BOOKMARK_PROPS,
      _, // eslint-disable-line vue/no-reserved-keys
    }
  },

  computed: {
    examples() {
      return _.sortBy(selectAspects(this.aspects, this.options), 'weight')
    },
    firstArtifact() { return _.first(_.sortBy(this.artifacts, 'weight'))?.name },
    lastArtifact()  { return _.last(_.sortBy(this.artifacts, 'weight'))?.name },
    firstStone()    { return _.first(_.sortBy(this.stones, 'weight'))?.name },
    selaspects()    { return selectAspects(this.aspects, this.options) },
  },

  mounted() {
    this.fetchArtifactsDb()
  },

  methods: {
    updateShowTicks(event: Event) {
      this.options.showTicks = (<HTMLInputElement>event.target)?.checked || false
      storeOptions(this.options, this.bookmark)
    },
    updateSillySizes(event: Event) {
      this.options.sillySizes = (<HTMLInputElement>event.target)?.checked || false
      storeOptions(this.options, this.bookmark)
    },
    updateTranspose(event: Event) {
      this.options.transpose = (<HTMLInputElement>event.target)?.checked || false
      storeOptions(this.options, this.bookmark)
    },
    updateSmushStoned(event: Event) {
      this.options.smushStoned = (<HTMLInputElement>event.target)?.checked || false
      storeOptions(this.options, this.bookmark)
    },
    updateFancy(event: Event) {
      this.options.fancy = (<HTMLInputElement>event.target)?.checked || false
      storeOptions(this.options, this.bookmark)
      this.aspects = { ...this.aspects }
    },
    updateArtifactsLayout(orderables: Orderables) {
      storeLayoutAxis(orderables, 'artifacts', this.bookmark)
      this.artifacts = orderables
    },
    //
    updateStonesLayout(orderables: Orderables) {
      storeLayoutAxis(orderables, 'stones', this.bookmark)
      this.stones = orderables
    },
    updateAspectsLayout(orderables: Orderables) {
      const full = defaultAxisOrder('aspects')
      const aspects = _.mapValues(full, (aspect) => {
        const weight = orderables[aspect.id]?.weight || (100 + aspect.weight)
        return { ...aspect, weight }
      })
      console.warn(aspects, full, orderables)
      storeLayoutAxis(aspects, 'aspects', this.bookmark)
      this.aspects = aspects
    },
    //
    resetAllMaybe() {
      if (confirm('are you sure?')) {
        resetAll(this)
      }
    },
    randomizeAxis(axis: OrderablesAxis) { randomizeAxis(this, axis) },
    resetAxis(axis: OrderablesAxis) { resetAxis(this, axis) },
    handleBookmarkChange(ev: Event) {
      const bookmark: Bookmarker = ((<HTMLInputElement>ev?.target)?.value || DEFAULT_BOOKMARK) as Bookmarker
      const { artifacts, aspects, stones } = loadLayoutAll(bookmark)
      this.options    = loadOptions(bookmark)
      this.artifacts  = artifacts
      this.aspects    = aspects
      this.stones     = stones
    },
    async fetchArtifactsDb() {
      const artifactsDb = await fetchArtifactsDb(this.playerId)
      this.inventory    = new Inventory(artifactsDb) // eslint-disable-line @typescript-eslint/no-explicit-any
      this.loaded       = true
    },
  },

})


</script>
<style>
  .DragOrderer li.byLegendary  { background: #FFFFC4; }
  .DragOrderer li.byEpic       { background: #F7DAF7; }
  .DragOrderer li.byRare       { background: #C0FFFF; }
  .DragOrderer li.byRarity     { background: #E3FCF8; }
  .DragOrderer li.byNonLegend  { background: #E3FCF8; }
  .DragOrderer li.byUncommon   { background: #E3FCF8; }
  .DragOrderer li.byCommonArt  { background: #E9E9E9; }
  .DragOrderer li.byArtifact   { background: #E3FCF8; }
  .DragOrderer li.byFamily     { background: #EAF7D9; }
  .DragOrderer li.byType       { background: #E9E9E9; }
  .DragOrderer li.byLevel      { background: #F7F7D9; }
  .DragOrderer li.byStoning    { background: #F3ECE8; }
  .DragOrderer li.byStoningLvl { background: #F3ECE8; }
  .DragOrderer li.byStone      { background: #F2F7ED; }
  .DragOrderer li.byFragment   { background: #F2F7ED; }
  .DragOrderer li.byAnyStone   { background: #F2F7ED; }
  .DragOrderer li.byIngredient { background: #F2F7ED; }
  .DragOrderer li.byRarity     { background: #E3FCF8; }
  .DragOrderer .stone          { background: #F2F7ED; }
  .Artifacts li                { background: #E9E9E9; }
  .ordering  h4                { margin-bottom: 0.25rem; }

  img.GlowingEffect {
    height: 140%;
    width: 140%;
  }

</style>
