<template>

  <drag-orderer :layoutOrder="layoutOrder" @updateOrder="updateLayoutOrder">
    <template #listItem="{element}">
      <div class="h-8 w-8 mx-2 my-2 relative rounded-full isolate bg-epic">
        <img class="absolute top-0 left-0 h-full w-full z-10" src="https://eggincassets.tcl.sh/256/egginc/afx_tungsten_ankh_4.png" data-v-115f86f7="">
        <img class="GlowingEffect Legendary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" :src="`https://eggincassets.tcl.sh/256/egginc-extras/glow/${element.name.toLowerCase()}-13.png`" v-if="element.name !== 'Common'" />
      </div>
      <span class="my-3 mx-2 pr-2">{{ element.name }}</span>
    </template>
  </drag-orderer>

  <template v-if="loaded">
    <inventory-canvas :inventory="inventory" :layoutOrder="layoutOrder" />
  </template>

</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { getLocalStorage, setLocalStorage, Inventory, requestFirstContact, UserBackupEmptyError } from 'lib';
import { defaultLayoutOrder } from '@/lib'

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

const LEGENDARY_LAYOUT_ORDER_LOCALSTORAGE_KEY = 'legendaryLayoutOrder';
const EPIC_LAYOUT_ORDER_LOCALSTORAGE_KEY      = 'epicLayoutOrder';
const RARE_LAYOUT_ORDER_LOCALSTORAGE_KEY      = 'rareLayoutOrder';
const COMMON_LAYOUT_ORDER_LOCALSTORAGE_KEY    = 'commonLayoutOrder';

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
    updateLayoutOrder(orderables) {
      setLocalStorage(LEGENDARY_LAYOUT_ORDER_LOCALSTORAGE_KEY, orderables.Legendary.weight)
      setLocalStorage(EPIC_LAYOUT_ORDER_LOCALSTORAGE_KEY,      orderables.Epic.weight)
      setLocalStorage(RARE_LAYOUT_ORDER_LOCALSTORAGE_KEY,      orderables.Rare.weight)
      setLocalStorage(COMMON_LAYOUT_ORDER_LOCALSTORAGE_KEY,    orderables.Common.weight)
      this.layoutOrder = orderables
    },
    async fetchArtifactsDb(playerId) {
      const artifactsDb = await fetchArtifactsDb(this.playerId)
      this.inventory = new Inventory(artifactsDb)
      this.loaded    = true
    },
  },

  data() {
    const layoutOrder = defaultLayoutOrder();
    layoutOrder.Legendary.weight = Number(getLocalStorage(LEGENDARY_LAYOUT_ORDER_LOCALSTORAGE_KEY)  || 1);
    layoutOrder.Epic.weight      = Number(getLocalStorage(EPIC_LAYOUT_ORDER_LOCALSTORAGE_KEY)       || 2);
    layoutOrder.Rare.weight      = Number(getLocalStorage(RARE_LAYOUT_ORDER_LOCALSTORAGE_KEY)       || 3);
    layoutOrder.Common.weight    = Number(getLocalStorage(COMMON_LAYOUT_ORDER_LOCALSTORAGE_KEY)     || 4);
    return {
      inventory: null,
      loaded:    false,
      layoutOrder,
    }
  },
})

</script>
<style>
  .DragOrderer li.Legendary { background: #FFFFC4; }
  .DragOrderer li.Epic      { background: #F7DAF7; }
  .DragOrderer li.Rare      { background: #C0FFFF; }
  .DragOrderer li.Common    { background: #E9E9E9; }

  img.GlowingEffect {
    height: 140%;
    width: 140%;
  }
</style>
