<template>
  <div class="flex w-full items-center justify-center mb-4 border-b border-r border-l border-gray-200">
    <div
      class="flex gap-0 justify-items-stretch ticketyboo smusher"
      :style="{ width: smusherWidth }"
    >
      <template v-for="col of cols" :key="col">
        <span
          class="flex w-full justify-center text-center text-xs sm:text-base sillySize"
          :class="`${((col % 2 === 0) ? 'even' : 'odd')}`"
        >
          {{ col }}
        </span>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { defineComponent, PropType } from 'vue';

export interface GridInfo {
  width:        number
  height:       number
  actualPerRow: number
  actualPerCol: number
  totalWidthPx: number
}

export default defineComponent({
  name: "TicketyBoo",
  components: {
  },
  props: {
    gridInfo:     { type: Object as PropType<GridInfo>, required: true },
  },
  // emits: ['updateOrder'],
  computed: {
    cols() {
      return _.range(1, this.gridInfo.actualPerRow + 1)
    },
    smusherWidth() {
      const { totalWidthPx } = this.gridInfo
      return (totalWidthPx === 1024) ? '100%' : `${totalWidthPx}px`
    },
    sillySizeFont() {
      if (this.gridInfo.actualPerRow > 80) { return '0.25rem' }
      if (this.gridInfo.actualPerRow > 50) { return '0.5rem' }
      if (this.gridInfo.actualPerRow > 30) { return '0.75rem' }
      return '1rem'
    },
    sillySizeOkReallyNow() {
      if (this.gridInfo.actualPerRow > 160) { return 'none' }
      return null // 'block'
    },
  },
});

</script>

<style scoped>
  .odd  { background: #f4f4f4; }
  .even { background: #ffffff; }
  .sillySize {
    font-size: v-bind('sillySizeFont');
    display:   v-bind('sillySizeOkReallyNow');
  }
</style>
