<template>
  <drag-orderer item-classes="w-52 stone" :layout-order="stones" group="stones" direction="vert" @update-order="(updated) => $emit('updateOrder', updated)">
    <template #listItem="{element}">
      <div class="h-8 w-8 relative isolate">
        <img v-if="element.img" class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
        <span v-else class="absolute p-1 z-10 text-xl">{{ element.glyph }}</span>
      </div>
      <span class="m-1">{{ element?.name }}</span>
    </template>
  </drag-orderer>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Orderables } from '@/lib/types'
import DragOrderer     from '@/components/DragOrderer.vue'

export default defineComponent({
  components: { DragOrderer },
  props: {
    stones: { type: Object as PropType<Orderables>, required: true },
  },
  emits: ['updateOrder'],
})
</script>
