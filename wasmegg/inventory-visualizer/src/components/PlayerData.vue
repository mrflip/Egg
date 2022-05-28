<template>

  <drag-orderer :layoutOrder="layoutOrder.kinds" @updateOrder="updateKindsLayout" direction="horiz">
    <template #listItem="{element}">
      <div class="h-8 w-8 relative rounded-full isolate bg-epic">
        <img class="absolute top-0 left-0 h-full w-full z-10" :src="element.img">
        <img class="GlowingEffect absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" :src="`https://eggincassets.tcl.sh/256/egginc-extras/glow/${element.name.toLowerCase()}-13.png`" v-if="/^(Leg|Epi|Ra)/.test(element.name)" />
      </div>
      <span class="m-1">{{ element.name }}</span>
    </template>
  </drag-orderer>

  <template v-if="loaded">
    <inventory-canvas :inventory="inventory" :layoutOrder="layoutOrder" />
  </template>

  <div class="flex flex-row my-8 justify-center">

    <div class="flex flex-col items-center mt-4 Artifacts">
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
        class="mx-4 w-48 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        @click="resetArtifacts"
      >
        Reset Artifact Order
      </button>
    </div>

    <div class="flex flex-col items-center mt-4">
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
        class="mx-4 w-48 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        @click="resetStones"
      >
        Reset Stone Order
      </button>
    </div>

    <div class="flex flex-col items-center mt-4">
      <drag-orderer :layoutOrder="aspectsOrder" @updateOrder="updateAspectsLayout" direction="vert">
        <template #listItem="{element}">
          <div class="h-8 w-8 relative isolate">
            <img v-if="element.img" class="absolute top-0 left-0 h-full w-full z-10" :src="element.img">
            <span v-else class="absolute p-1 z-10">{{ element.glyph }}</span>
            <img class="GlowingEffect absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" :src="`https://eggincassets.tcl.sh/256/egginc-extras/glow/${element.name.toLowerCase()}-13.png`" v-if="/^(Leg|Epi|Ra)/.test(element.name)" />
          </div>
          <span class="m-1">{{ element.name }}</span>
        </template>
      </drag-orderer>
      <button
        class="mx-4 w-48 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        @click="resetAspects"
      >
        Reset Aspects
      </button>
    </div>
  </div>

</template>

<script lang="ts">
import _ from 'lodash'
import { defineComponent } from 'vue';
import { getLocalStorage, setLocalStorage, Inventory, requestFirstContact, UserBackupEmptyError } from 'lib';
import { defaultAxisOrder } from '@/lib'

import InventoryCanvas from '@/components/InventoryCanvas.vue';
import DragOrderer from '@/components/DragOrderer.vue';

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
  components: { DragOrderer, InventoryCanvas },
  mounted() {
    this.fetchArtifactsDb(this.playerId)
  },
  methods: {
    updateKindsLayout(orderables) {
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
      inventory: null,
      loaded:    false,
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
