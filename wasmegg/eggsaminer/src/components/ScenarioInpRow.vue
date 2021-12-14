<template>
  <tr class="bg-white">
    <td
      v-tippy="{ content: row.tip }"
      class="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-600"
      >
      {{ row.title }}
    </td>
    <td v-if="row.val !== undefined"
        >
      <input
        :value="row.val"
        type="number"
        class="w-28 text-right"
        @input="$emit('update-rowval', { row, val: $event.target?.value, ev: $event })"
        />
    </td>
    <td
      v-for="(cell, idx) in row.cells"
      :key="`cell-${idx}`"
      :class="cell.class"
      class="px-8 py-1 whitespace-nowrap text-sm font-medium text-gray-900"
      >
      <base-e-i-value v-if="cell.basey" :value="cell.val" />
      <span v-else>{{ cell.val }}</span>
    </td>
  </tr>

</template>

<script lang="ts">
// import _ from "lodash";
import { defineComponent, PropType } from 'vue';
import BaseEIValue      from '@/components/BaseEIValue.vue';
// import BaseEIValueInput from 'ui/components/BaseEIValueInput.vue';

type Cell = {
  val:    string;
  style?: object;
  class?: string[];
}

type Row = {
  title: number;
  cells: Cell[];
};

export default defineComponent({
  components: {
    BaseEIValue,
    // BaseEIValueInput,
  },

  methods: {
    updateRowval($event, row) {
      console.log('updateRowval', ev)
      this.$emit('update-rowval', { row, val: $event.target?.value, ev: $event })
    },
  },

  props: {
    row: {
      type: Object as PropType<Row>,
      required: true,
    },
  },

  emits: ['update-rowval'],

});
</script>
