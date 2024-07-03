<template>
  <drag-orderer item-classes="w-52 aspect" :layout-order="aspects" group="aspects" direction="vert" @update-order="(updated) => $emit('updateOrder', updated)">
    <template #listItem="{element}">
      <div class="h-7 w-7 relative rounded-full isolate bg-epic">
        <img v-if="element.rarity" class="absolute h-9 w-8 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" :src="`https://eggincassets.tcl.sh/256/egginc-extras/glow/${element.rarity}-13.png`" />
        <img v-if="element.img" class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
        <span v-else class="absolute p-1 z-10 text-xl">{{ element.glyph }}</span>
      </div>
      <span class="m-1">{{ element?.name }}</span>
    </template>
  </drag-orderer>
  <reset-button @click="$emit('resetOrder')">Reset Sorting</reset-button>
  <reset-button class="bg-purple-200" @click="$emit('randomOrder')">I Feel Lucky!</reset-button>
  <check-option id="fancy" class="mt-2 ml-4" :checked="fancy" @change="(ev: any) => $emit('updateFancy', ev.target?.checked || false)">Fancy Groupings</check-option>

</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Orderables } from '@/lib/types'
import DragOrderer     from '@/components/DragOrderer.vue'
import CheckOption     from '@/components/CheckOption.vue'
import ResetButton     from '@/components/ResetButton.vue'

export default defineComponent({
  components: { DragOrderer, CheckOption, ResetButton },
  props: {
    aspects: { type: Object as PropType<Orderables>, required: true },
    fancy: { type: Boolean, required: true },
  },
  emits: ['updateOrder', 'randomOrder', 'resetOrder', 'updateFancy'],
})
</script>
