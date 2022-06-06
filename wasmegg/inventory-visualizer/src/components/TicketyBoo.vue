<template>
  <div class="flex w-full items-center justify-center mb-1 border-b border-r border-l border-gray-200 tickety">
    <div
      class="flex gap-0 justify-items-stretch ticketyboo smusher"
      :style="{ width: smusherWidth }"
    >
      <template v-for="col of cols" :key="col">
        <span
          :class="`${((col % 2 === 0) ? ('even' + trimSmall) : 'odd')} overflow-clip flex w-full justify-center text-center text-[0.25rem] md:text-base sillySize`"
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
    trimSmall() {
      if (this.gridInfo.actualPerRow > 30) { return ' hidden sm:flex ' }
      if (this.gridInfo.actualPerRow > 18) { return ' hidden xs:flex ' }
      return ''
    },
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
      if (this.gridInfo.actualPerRow > 25) { return '0.75rem' }
      return '1rem'
    },
    sillySizeOkReallyNow() {
      if (this.gridInfo.actualPerRow > 160) { return 'none' }
      return 'flex'
    },
  },
});

</script>

<style scoped>
  .odd  { background: #ffffff; }
  .even { background: #f4f4f4; }
  .sillySize {
    font-size: v-bind('sillySizeFont');
  }
  .tickety {
    display:   v-bind('sillySizeOkReallyNow');
  }
</style>
