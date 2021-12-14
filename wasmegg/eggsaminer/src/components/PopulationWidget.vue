<template>
<collapsible-section
  section-title="Population"
  :visible="isVisibleSection('population', true)"
  class="my-2 text-sm"
  @toggle="toggleSectionVisibility('population')"
  >

  <div class="mt-1 relative rounded-md shadow-sm">
    <e-i-value-input
      v-model:raw="populationInput"
      v-model:value="farmA.numChickens"
      base-class="pl-10 pt-2.5 pb-2"
      />
    <e-i-value :value="farmA.numChickens" />
    {{ populationInput }}
    chx: {{ farmA.numChickens }}
  </div>

  <scenario-table>

    <tbody>
    <scenario-input-row
      :row="rows.population"
      @update-rowval="updatePopulation"
      />

    <tr
      class="bg-white"
      >
      <td
        v-tippy="{ content: 'hi!' }"
        class="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-600"
        >
        Title
      </td>
    </tr>
    </tbody>

  </scenario-table>
</collapsible-section>

<collapsible-section section-title="Raw Data" :visible="isVisibleSection('raw_data')" class="my-2 text-sm" @toggle="toggleSectionVisibility('raw_data')">
  {{ farmA.activeBoosts }}
  {{ Object.keys(farmA) }}
</collapsible-section>
</template>

<script lang="ts">

import _ from "lodash";
import { useSectionVisibility } from 'ui/composables/section_visibility';
import { defineComponent, PropType } from 'vue'; // toRefs
import { formatEIValue } from '@/lib';
import CollapsibleSection from '@/components/CollapsibleSection.vue';
import EIValue from '@/components/BaseEIValue.vue';
import EIValueInput from '@/components/EIValueInput.vue';
//
import researchesData from '@/researches.json';
import StatsMatrix from '@/components/StatsMatrix.vue';
import ScenarioInputRow from '@/components/ScenarioInputRow.vue'
import ScenarioTable from '@/components/ScenarioTable.vue'

export default defineComponent({
  components: {
    CollapsibleSection,
    // StatsMatrix,
    ScenarioInputRow,
    ScenarioTable,
    EIValue,
    EIValueInput,
  },

  props: {
    scenarioA: {
      type: Object as PropType<Backup>,
      required: true,
    },
    scenarioB: {
      type: Object as PropType<Backup>,
      required: true,
    },
    farmA: {
      type: Object as PropType<Backup>,
      required: true,
    },
    farmB: {
      type: Object as PropType<Backup>,
      required: true,
    },
  },

  emits: ['update-list-by-id', 'update-value'],

  data() {
    return {
      populationInput: formatEIValue(this.farmA.numChickens),
    }
  },

  setup() {
    const { isVisibleSection, toggleSectionVisibility } = useSectionVisibility(false);

    const dataHeaders = _.map([
      'Level A', 'Level B', 'Max Levels', 'Effect', 'Stacks?', 'Next Price', 'Paid', 'Remaining', 'Action',
    ], (text) => ({ text }))

    return {
      // titleHeader: { text: 'Name' },
      dataHeaders,
      isVisibleSection,
      toggleSectionVisibility,
    };
  },

  computed: {
    rows() {
      const { numChickens, habPopulation } = this.farmA
      const { numChickens:populationB } = this.farmB
      console.warn('regenerating Population')
      const population = numChickens

      return {
        populationInput: String(this.farmA.lastStepTime),
        population: {
          id: 'population', title: 'Population', basey: true, val: population,
          cells: [
            // { id: 'a', val: population, basey: true },
            { id: 'b', val: populationB, basey: true },
            { val: habPopulation.join(' / ') },
          ] },
      }
    },
  },

  methods: {
    updatePopulation({ row, val }) {
      console.warn('updatePopulation', row, val)
      // this.$emit('update-list-by-id', { path: 'scenarioA.farms[0].commonResearch', id: row.id, updates: { level } })
      this.$emit('update-value', { path: 'scenarioA.farms[0].numChickens', val })
    },
  },

});

const researches = _.mapKeys(researchesData, 'id')

const effectSymbols = { additive: '+', multiplicative: '×' }

const isStackingStrs = { additive: 'N', multiplicative: 'Y' }

function sum(arr) { return _.reduce(arr, (tot, val) => (tot + val)) }

function isStacking(val) {
  return isStackingStrs[val] || val
}

const quietClass = 'text-gray-400'

function numOrQuiet(val, replacement, test, attrs) {
  if (test) {
    return { val, class: ['text-right'], ...attrs }
  }
  return { val: replacement, class: quietClass }
}

</script>
