<template>
  <div class="flex w-full items-center justify-center mb-4 border-b border-r border-l border-gray-200">
    <div
      class="flex gap-0 justify-items-stretch ticketyboo"
      :style="{ width: `${gridInfo.totalWidthPx}px` }"
    >
      <template v-for="col of cols" :key="col">
        <span
          class="flex w-full justify-center"
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
import { defineComponent } from 'vue';

export interface GridInfo {
  width:        number
  height:       number
  actualPerRow: number
  actualPerCol: number
}

export default defineComponent({
  name: "TicketyBoo",
  components: {
  },
  props: {
    actualPerRow: { type: Number, required: true },
    gridInfo:     { type: Object as PropType<GridInfo>, required: true },
  },
  // emits: ['updateOrder'],
  computed: {
    cols() { return _.range(1, this.gridInfo.actualPerRow + 1) },
  },
});
</script>

<style scoped>
  .odd  { background: #f4f4f4; }
  .even { background: #ffffff; }
</style>
