<template>

<template v-if="loaded">
  <inventory-canvas
    :inventory="inventory"
    :layout-order="layoutOrder"
    />
</template>

<div class="flex max-w-full md:flex-row flex-col my-8 md:items-stretch items-center justify-around">

  <div class="p-2 mb-4 flex flex-col items-center Aspects ordering border border-blue-100">
    <h4 class="mb-2">Aspects</h4>
    <drag-orderer item-classes="w-60" :layout-order="aspectsOrder" direction="vert" @updateOrder="updateAspectsLayout">
      <template #listItem="{element}">
        <div class="h-8 w-8 relative rounded-full isolate bg-epic">
          <img v-if="element.img" class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
          <span v-else class="absolute p-1 z-10 text-xl">{{ element.glyph }}</span>
        </div>
        <span class="m-1">{{ element.name }}</span>
      </template>
    </drag-orderer>
    <div class="h-full flex flex-col justify-end">
      <button
        class="mt-2 mb-1 w-48 py-2 px-4 flex grow-0 justify-center border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-800 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        @click="resetAspects"
        >
        Reset Aspect Order
      </button>
    </div>
  </div>

  <div class="p-2 mb-4 flex flex-col items-center Artifacts ordering border border-blue-100">
    <h4>Artifacts</h4>
    <drag-orderer item-classes="w-60 max-h-10 mb-1 items-center" :layout-order="artifactsOrder" direction="vert" @updateOrder="updateArtifactsLayout">
      <template #listItem="{element}">
        <div class="h-7 w-7 relative rounded-full isolate">
          <img class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
        </div>
        <span class="m-1 ml-1.5">{{ element.name }}</span>
      </template>
    </drag-orderer>
    <button
      class="mt-2 mb-1 w-48 py-2 px-4 flex justify-center border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-800 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
      @click="resetArtifacts"
      >
      Reset Artifact Order
    </button>
  </div>

  <div class="p-2 mb-4 flex flex-col items-center Stones ordering border border-blue-100">
    <h4>Stones</h4>
    <drag-orderer item-classes="w-60 stone" :layout-order="stonesOrder" direction="vert" @updateOrder="updateStonesLayout">
      <template #listItem="{element}">
        <div class="h-8 w-8 relative isolate">
          <img class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
        </div>
        <span class="m-1">{{ element.name }}</span>
      </template>
    </drag-orderer>
    <div class="h-full flex flex-col justify-end">
      <reset-button @click="resetStones">Reset Stone Order</reset-button>
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
  artifacts: 'layoutOrderArtifacts',
  stones:    'layoutOrderStones',
  aspects:   'layoutOrderAspects',
}

function loadLayoutAxis(axis: keyof (typeof LOCALSTORAGE_KEYS)): Orderables {
  const fallback   = defaultAxisOrder(axis)
  const storageKey = LOCALSTORAGE_KEYS[axis]
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
  storeLayoutAxis(axis, fallback)
  return fallback
}

function getOrderablesDna(orderables: Orderables) {
  return _.mapValues(orderables, (orderable) => _.pick(orderable, ['weight']))
}

function storeLayoutAxis(axis: keyof (typeof LOCALSTORAGE_KEYS), orderables: Orderables) {
  setLocalStorage(LOCALSTORAGE_KEYS[axis], JSON.stringify(getOrderablesDna(orderables)))
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
    return {
      inventory:      null as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      loaded:         false,
      artifactsOrder: loadLayoutAxis('artifacts'),
      stonesOrder:    loadLayoutAxis('stones'),
      aspectsOrder:   loadLayoutAxis('aspects'),
      console,
    }
  },

  computed: {
    layoutOrder() {
      return {
        stones:    this.stonesOrder,
        artifacts: this.artifactsOrder,
        aspects:   this.aspectsOrder,
      }
    },
  },

  mounted() {
    this.fetchArtifactsDb()
  },

  methods: {
    updateArtifactsLayout(orderables: Orderables) {
      storeLayoutAxis('artifacts', orderables)
      this.artifactsOrder = orderables
    },
    resetArtifacts() {
      const orderables = defaultAxisOrder('artifacts')
      storeLayoutAxis('artifacts', orderables)
      this.artifactsOrder = orderables
    },
    //
    updateStonesLayout(orderables: Orderables) {
      storeLayoutAxis('stones', orderables)
      this.stonesOrder = orderables
    },
    resetStones() {
      const orderables = defaultAxisOrder('stones')
      storeLayoutAxis('stones', orderables)
      this.stonesOrder = orderables
    },
    updateAspectsLayout(orderables: Orderables) {
      storeLayoutAxis('aspects', orderables)
      this.aspectsOrder = orderables
    },
    resetAspects() {
      const orderables = defaultAxisOrder('aspects')
      storeLayoutAxis('aspects', orderables)
      this.aspectsOrder = orderables
    },
    async fetchArtifactsDb() {
      const artifactsDb = await fetchArtifactsDb(this.playerId)
      this.inventory    = new Inventory(artifactsDb)
      this.loaded       = true
    },
    // updateTranspose(ev) {
    //   this.transpose = ev.target.checked
    //   setLocalStorage(LOCALSTORAGE_KEYS.transpose, String(ev.target.checked))
    // },
    // updateShowTicks(ev) {
    //   this.showTicks = ev.target.checked
    //   setLocalStorage(LOCALSTORAGE_KEYS.showTicks, String(ev.target.checked))
    // },
    //
  },

})


</script>
<style>
  .DragOrderer li.byLegendary  { background: #FFFFC4; }
  .DragOrderer li.byEpic       { background: #F7DAF7; }
  .DragOrderer li.byRare       { background: #C0FFFF; }
  .DragOrderer li.byCommon     { background: #E9E9E9; }
  .DragOrderer li.byArtifact   { background: #E9E9E9; }
  .DragOrderer li.byFamily     { background: #DAF7E9; }
  .DragOrderer li.byType       { background: #F7DADA; }
  .DragOrderer li.byLevel      { background: #F7F7D9; }
  .DragOrderer li.byDecoration { background: #F2F7ED; }
  .DragOrderer li.byStone      { background: #F2F7ED; }
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
