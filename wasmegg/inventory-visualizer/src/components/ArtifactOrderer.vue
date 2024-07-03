<template>
  <drag-orderer item-classes="w-56 max-h-10 mb-0.5 items-center" group="artifacts" :layout-order="artifacts" direction="vert" @update-order="(updated) => $emit('updateOrder', updated)">
    <template #listItem="{element}">
      <div class="h-6 w-6 mx-0.5 relative rounded-full isolate">
        <img class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
      </div>
      <span class="m-1 ml-1.5">{{ element?.name }}</span>
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
    artifacts: { type: Object as PropType<Orderables>, required: true },
  },
  emits: ['updateOrder'],
})
</script>
