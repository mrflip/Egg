<template>

  <template v-if="loaded">
    <inventory-canvas :inventory="inventory" :layoutOrder="layoutOrder" :showTicks="showTicks" :transpose="transpose" />
  </template>

  <!-- <div class="flex max-w-lg flex-row items-center justify-center mt-4">
       <drag-orderer :layoutOrder="aspectsOrder" @updateOrder="updateAspectsLayout" direction="horiz">
       <template #listItem="{element}">
       <div class="h-8 w-8 relative isolate">
       <img v-if="element.img" class="absolute top-0 left-0 h-full w-full z-10" :src="element.img">
       <span v-else class="absolute p-1 z-10">{{ element.glyph }}</span>
       <img class="GlowingEffect absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" :src="`https://eggincassets.tcl.sh/256/egginc-extras/glow/${element.name.toLowerCase()}-13.png`" v-if="/^(Leg|Epi|Ra)/.test(element.name)" />
       </div>
       <span class="m-1">{{ element.name }}</span>
       </template>
       </drag-orderer>
       <div class="flex py-2">
       <button
       class="mx-4 w-36 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
       @click="resetAspects"
       >
       Reset Aspects
       </button>
       </div>
       </div> -->

  <div class="flex lg:flex-row max-w-full my-8 items-start justify-center">

    <div class="flex flex-col items-center Kinds">
      <drag-orderer :layoutOrder="layoutOrder.kinds" @updateOrder="updateKindsLayout" direction="vert">
        <template #listItem="{element}">
          <div class="h-8 w-8 relative rounded-full isolate bg-epic">
            <img class="absolute top-0 left-0 h-full w-full z-10" :src="element.img">
            <img class="GlowingEffect absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" :src="`https://eggincassets.tcl.sh/256/egginc-extras/glow/${element.name.toLowerCase()}-13.png`" v-if="/^(Leg|Epi|Ra)/.test(element.name)" />
          </div>
          <span class="m-1">{{ element.name }}</span>
        </template>
      </drag-orderer>
      <button
        class="m-3 w-48 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-800 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        @click="resetKinds"
      >
        Reset Kind Order
      </button>
    </div>

    <div class="flex flex-col items-center Artifacts">
      <drag-orderer :layoutOrder="artifactsOrder" @updateOrder="updateArtifactsLayout" direction="vert">
        <template #listItem="{element}">
          <div class="h-8 w-8 relative rounded-full isolate">
            <img class="absolute top-0 left-0 h-full w-full z-10" :src="element.img">
            <img class="GlowingEffect absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" :src="`https://eggincassets.tcl.sh/256/egginc-extras/glow/${element.name.toLowerCase()}-13.png`" v-if="/^(Leg|Epi|Ra)/.test(element.name)" />
          </div>
          <span class="m-1">{{ element.name }}</span>
        </template>
      </drag-orderer>
      <button
        class="m-3 w-48 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-800 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        @click="resetArtifacts"
      >
        Reset Artifact Order
      </button>
    </div>

    <div class="flex flex-col items-center Stones">
      <drag-orderer :layoutOrder="stonesOrder" @updateOrder="updateStonesLayout" direction="vert">
        <template #listItem="{element}">
          <div class="h-8 w-8 relative isolate">
            <img class="absolute top-0 left-0 h-full w-full z-10" :src="element.img">
            <img class="GlowingEffect absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" :src="`https://eggincassets.tcl.sh/256/egginc-extras/glow/${element.name.toLowerCase()}-13.png`" v-if="/^(Leg|Epi|Ra)/.test(element.name)" />
          </div>
          <span class="m-1">{{ element.name }}</span>
        </template>
      </drag-orderer>
      <button
        class="m-3 w-48 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-800 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        @click="resetStones"
      >
        Reset Stone Order
      </button>
    </div>

  </div>


  <div class="flex items-center justify-start my-4" :class="loading ? 'opacity-50' : null">
    <h4 class="flex w-1//6 mr-4">Silly Options</h4>

    <div class="flex w-1//6 mx-4 items-center justify-center">
      <div class="flex items-center h-5">
        <input
          id="showTicks"
          v-model="showTicks"
          name="showTicks"
          type="checkbox"
          class="focus:ring-0 focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
          :disabled="loading"
        />
      </div>
      <div class="ml-4 text-sm">
        <label for="showTicks" class="text-gray-600">Show Tickmarks</label>
      </div>
    </div>

    <check-option :disabled="true">hi</check-option>
  </div>

</template>

<script lang="ts">
import _ from 'lodash'
import { defineComponent } from 'vue';
import { getLocalStorage, setLocalStorage, Inventory, requestFirstContact, UserBackupEmptyError } from 'lib';
import { defaultAxisOrder } from '@/lib'

import InventoryCanvas from '@/components/InventoryCanvas.vue';
import DragOrderer from '@/components/DragOrderer.vue';
import CheckOption from '@/components/CheckOption.vue';

async function fetchArtifactsDb(playerId) {
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
  kinds:     'layoutOrderKinds',
  artifacts: 'layoutOrderArtifacts',
  stones:    'layoutOrderStones',
  aspects:   'layoutOrderAspects',
}

const FALLBACK_ORDERS = {
  kinds:       defaultAxisOrder('kinds'),
  artifacts:   defaultAxisOrder('artifacts'),
  stones:      defaultAxisOrder('stones'),
  aspects:     defaultAxisOrder('aspects'),
}

function loadLayoutAxis(axis: Keys<LOCALSTORAGE_KEYS>): Orderables {
  const fallback   = { ...FALLBACK_ORDERS[axis] }
  const storageKey = LOCALSTORAGE_KEYS[axis]
  //
  const axisJson = getLocalStorage(storageKey) || null
  if (axisJson) {
    try {
      const parsed = JSON.parse(axisJson)
      // allow the keys to change without having leftover/missing entries
      return _.merge({}, fallback, _.pick(parsed, _.keys(fallback)))
    } catch (err) {
      console.warn("could not parse stored JSON", axisJson, err)
    }
  }
  // if nothing or error
  storeLayoutAxis(axis, fallback)
  return fallback
}

function storeLayoutAxis(axis: Keys<LOCALSTORAGE_KEYS>, orderables: Orderables) {
  setLocalStorage(LOCALSTORAGE_KEYS[axis], JSON.stringify(orderables))
}

export default defineComponent({
  props: {
    playerId: {
      type: String,
      required: true,
    },
  },
  components: { DragOrderer, InventoryCanvas, CheckOption },
  mounted() {
    this.fetchArtifactsDb(this.playerId)
  },
  methods: {
    updateKindsLayout(orderables) {
      storeLayoutAxis('kinds', orderables)
      this.kindsOrder = orderables
    },
    resetKinds() {
      const orderables = FALLBACK_ORDERS.kinds
      storeLayoutAxis('kinds', orderables)
      this.kindsOrder = orderables
    },
    updateArtifactsLayout(orderables) {
      storeLayoutAxis('artifacts', orderables)
      this.artifactsOrder = orderables
    },
    resetArtifacts() {
      const orderables = FALLBACK_ORDERS.artifacts
      storeLayoutAxis('artifacts', orderables)
      this.artifactsOrder = orderables
    },
    //
    updateStonesLayout(orderables) {
      storeLayoutAxis('stones', orderables)
      this.stonesOrder = orderables
    },
    resetStones() {
      const orderables = FALLBACK_ORDERS.stones
      storeLayoutAxis('stones', orderables)
      this.stonesOrder = orderables
    },
    updateAspectsLayout(orderables) {
      storeLayoutAxis('aspects', orderables)
      this.aspectsOrder = orderables
    },
    resetAspects() {
      const orderables = FALLBACK_ORDERS.aspects
      storeLayoutAxis('aspects', orderables)
      this.aspectsOrder = orderables
    },
    //
    async fetchArtifactsDb(playerId) {
      const artifactsDb = await fetchArtifactsDb(this.playerId)
      this.inventory    = new Inventory(artifactsDb)
      this.loaded       = true
    },
  },

  computed: {
    layoutOrder() {
      return {
        stones:    this.stonesOrder,
        kinds:     this.kindsOrder,
        artifacts: this.artifactsOrder,
        aspects:   this.aspectsOrder,
      }
    },
  },

  data() {
    return {
      inventory:      null,
      loaded:         false,
      transpose:      false,
      showTicks:      false,
      kindsOrder:     loadLayoutAxis('kinds'),
      artifactsOrder: loadLayoutAxis('artifacts'),
      stonesOrder:    loadLayoutAxis('stones'),
      aspectsOrder:   loadLayoutAxis('aspects'),
    }
  },
})


</script>
<style>
  .DragOrderer li.Legendary  { background: #FFFFC4; }
  .DragOrderer li.Epic       { background: #F7DAF7; }
  .DragOrderer li.Rare       { background: #C0FFFF; }
  .DragOrderer li.Common     { background: #E9E9E9; }
  .DragOrderer li.Stone      { background: #F2F7ED; }
  .DragOrderer li.Ingredient { background: #F3ECE8; }
  .DragOrderer .stone        { background: #F2F7ED; }
  .Artifacts li              { background: #E9E9E9; }

  img.GlowingEffect {
    height: 140%;
    width: 140%;
  }
</style>
