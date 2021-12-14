<template>
<scenario-table>

  <thead class="bg-gray-50">
    <tr>
      <th
        scope="col"
        class="px-2 py-2 whitespace-pre text-sm font-medium text-gray-500"
        >
        {{ titleHeader.text }}
      </th>
      <th
        v-for="(header, idx) in dataHeaders"
        :key="`header-${idx}`"
        scope="col"
        class="px-2 py-2 whitespace-pre text-sm font-medium text-gray-500"
        >
        {{ header.text }}
      </th>
    </tr>
  </thead>
  <tbody>

    <scenario-input-row
      v-for="row in rows"
      :key="row.id"
      :row="row"
      @update-rowval="(vals) => $emit('update-rowval', vals)"
      />
  </tbody>
</scenario-table>
</template>

<script lang="ts">
// import _ from "lodash";
import { defineComponent, PropType } from 'vue';
import ScenarioTable from '@/components/ScenarioTable.vue'
import ScenarioInputRow from '@/components/ScenarioInputRow.vue'

type Header = {
  text: string;
};

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
    ScenarioTable,
    ScenarioInputRow,
  },

  props: {
    titleHeader: {
      type: Object as PropType<Header>,
      required: false,
      default: () => ({ text: 'Name' }),
    },
    dataHeaders: {
      type: Array as PropType<Header[]>,
      required: true,
    },
    rows: {
      type: Array as PropType<Row[]>,
      required: true,
    },
  },

  emits: ['update-rowval'],

  methods: {
    updateCommonResearchLevel(vals) {
      console.warn('updateCommonResearchLevel', vals)
      this.$emit('update-rowval', vals)
    },
  },

});
</script>
