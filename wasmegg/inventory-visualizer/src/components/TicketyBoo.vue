<template>
<div class="flex items-center justify-center mb-4 ticketyboo text-center mr-4">
  <div class="flex" :style="{ maxWidth: `${gridInfo.totalWidthPx}px` }">
  <template v-for="col of _.range(1, gridInfo.actualPerRow + 1)" key="col">
    <span
      class="px-1" :class="((col % 2 === 0) ? 'even' : 'odd')" style="flex"
      :style="{ width: `${gridInfo.cellWidthPx}px` }"
      >
      {{col}}
    </span>
  </template>
  </div>
</div>
</template>

<script lang="ts">
import lodash from 'lodash';
import { defineComponent } from 'vue';
//
const _ = lodash

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
    actualPerRow: { type: Number },
    gridInfo:     { type: Object as PropType<GridInfo> },
  },
  // emits: ['updateOrder'],
  data() {
    return { _: lodash };
  },
});
</script>

<style scoped>
  .odd { background: #f4f4f4; }
</style>
