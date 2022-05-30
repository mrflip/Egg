<template>

<template v-if="loaded">
  <inventory-canvas
    :inventory="inventory"
    :layout-order="layoutOrder"
    :bookmark="bookmark"
    >
    <select id="bookmarks" v-model="bookmark" class="my-1" name="bookmarks" @change="handleBookmarkChange">
      <template v-for="bkInfo of bookmarkProps" :key="bkInfo.id">
        <option :value="bkInfo.id">{{ bkInfo.label }}</option>
      </template>
    </select>
    <reset-button @click="resetAllMaybe">Reset Arrangement</reset-button>
  </inventory-canvas>
</template>

<div class="flex 2xl:px-32 md:flex-row flex-col my-8 md:items-stretch items-center justify-around">

  <div class="p-2 mb-4 flex flex-col items-center Aspects ordering border border-blue-100">
    <h4 class="mb-2">Aspects</h4>
    <drag-orderer item-classes="w-60" :layout-order="aspects" direction="vert" @updateOrder="updateAspectsLayout">
      <template #listItem="{element}">
        <div class="h-7 w-7 relative rounded-full isolate bg-epic">
          <img v-if="element.rarity" class="absolute h-9 w-8 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" :src="`https://eggincassets.tcl.sh/256/egginc-extras/glow/${element.rarity}-13.png`" />
          <img v-if="element.img" class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
          <span v-else class="absolute p-1 z-10 text-xl">{{ element.glyph }}</span>
        </div>
        <span class="m-1">{{ element.name }}</span>
      </template>
    </drag-orderer>
    <div class="h-full flex flex-col justify-end">
      <reset-button @click="() => resetAxis('aspects')">Reset Sorting</reset-button>
    </div>
  </div>

  <div class="p-2 mb-4 flex flex-col items-center Artifacts ordering border border-blue-100">
    <h4>Artifacts</h4>
    <drag-orderer item-classes="w-60 max-h-10 mb-1 items-center" :layout-order="artifacts" direction="vert" @updateOrder="updateArtifactsLayout">
      <template #listItem="{element}">
        <div class="h-7 w-7 relative rounded-full isolate">
          <img class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
        </div>
        <span class="m-1 ml-1.5">{{ element.name }}</span>
      </template>
    </drag-orderer>
    <reset-button @click="() => resetAxis('artifacts')">Reset Artifacts</reset-button>
  </div>

  <div class="p-2 mb-4 flex flex-col items-center Stones ordering border border-blue-100">
    <h4>Stones</h4>
    <drag-orderer item-classes="w-60 stone" :layout-order="stones" direction="vert" @updateOrder="updateStonesLayout">
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

</template>

<script lang="ts">
import _ from 'lodash'
import { defineComponent } from 'vue';
import { getLocalStorage, setLocalStorage, Inventory, requestFirstContact, UserBackupEmptyError } from 'lib';
import { defaultAxisOrder, Orderables } from '@/lib'

import InventoryCanvas from '@/components/InventoryCanvas.vue';
import DragOrderer from '@/components/DragOrderer.vue';
import ResetButton from '@/components/ResetButton.vue';

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
}
type OrderablesAxis = keyof (typeof LOCALSTORAGE_KEYS);

const BOOKMARK_PROPS = {
  BkA: { id: "BkA", label: 'Bookmark A' },
  BkB: { id: "BkB", label: 'Bookmark B' },
  BkC: { id: "BkC", label: 'Bookmark C' },
}
type Bookmarker = keyof (typeof BOOKMARK_PROPS);
const DEFAULT_BOOKMARK: Bookmarker = 'BkA'

function getStorageKey(axis: OrderablesAxis, bookmark: string) {
  return `${LOCALSTORAGE_KEYS[axis]}${bookmark}`
}

function storeLayoutAxis(orderables: Orderables, axis: OrderablesAxis, bookmark: Bookmarker) {
  if (! bookmark) { throw new Error(axis) }
  setLocalStorage(getStorageKey(axis, bookmark), JSON.stringify(getOrderablesDna(orderables)))
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

function resetAxis(comp: LayoutOrderableComponent, axis: OrderablesAxis) {
  const orderables = defaultAxisOrder(axis)
  storeLayoutAxis(orderables, axis, comp.bookmark)
  comp[axis] = orderables
}

function resetAll(comp: LayoutOrderableComponent) {
  resetAxis(comp, 'aspects')
  resetAxis(comp, 'stones')
  resetAxis(comp, 'artifacts')
}

export default defineComponent({
  components: {
    DragOrderer, InventoryCanvas, ResetButton,
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
    return {
      loaded:         false,
      artifacts: loadLayoutAxis('artifacts', bookmark),
      stones:    loadLayoutAxis('stones',    bookmark),
      aspects:   loadLayoutAxis('aspects',   bookmark),
      bookmark,
      inventory,
      console,
      bookmarkProps: BOOKMARK_PROPS,
    }
  },

  computed: {
    layoutOrder() {
      return {
        stones:    this.stones,
        artifacts: this.artifacts,
        aspects:   this.aspects,
      }
    },
  },

  mounted() {
    this.fetchArtifactsDb()
  },

  methods: {
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
      storeLayoutAxis(orderables, 'aspects', this.bookmark)
      this.aspects = orderables
    },
    //
    resetAllMaybe() {
      if (confirm('are you sure?')) {
        resetAll(this)
      }
    },
    resetAxis(axis: OrderablesAxis) { resetAxis(this, axis) },
    handleBookmarkChange(ev: Event) {
      const bookmark: Bookmarker = ((<HTMLInputElement>ev?.target)?.value || DEFAULT_BOOKMARK) as Bookmarker
      const { artifacts, aspects, stones } = loadLayoutAll(bookmark)
      this.artifacts = artifacts
      this.aspects = aspects
      this.stones = stones
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
  .DragOrderer li.byCommonArt  { background: #E9E9E9; }
  .DragOrderer li.byArtifact   { background: #E9E9E9; }
  .DragOrderer li.byFamily     { background: #DAF7E9; }
  .DragOrderer li.byType       { background: #F7DADA; }
  .DragOrderer li.byLevel      { background: #F7F7D9; }
  .DragOrderer li.byDecoration { background: #F2F7ED; }
  .DragOrderer li.byStone      { background: #F2F7ED; }
  .DragOrderer li.byFragment   { background: #F2F7ED; }
  .DragOrderer li.byAnyStone   { background: #F2F7ED; }
  .DragOrderer li.byIngredient { background: #F3ECE8; }
  .DragOrderer .stone          { background: #F2F7ED; }
  .Artifacts li                { background: #E9E9E9; }
  .ordering  h4                { margin-bottom: 0.25rem; }

  img.GlowingEffect {
    height: 140%;
    width: 140%;
  }
</style>
