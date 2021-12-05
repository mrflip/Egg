<template>
  <collapsible-section
    section-title="Common Research"
    :visible="isVisibleSection('common_research', false)"
    class="my-2 text-sm"
    @toggle="toggleSectionVisibility('common_research')"
    >
    {{ scenarioA.farms[0] }}
    <p>Note that amount paid may not reflect discounts or any changes to the game</p>
  </collapsible-section>

  <!-- <collapsible-section section-title="Raw Data" :visible="isVisibleSection('raw_data')" class="my-2 text-sm" @toggle="toggleSectionVisibility('raw_data')"> -->
  <!--   {{ scenarioA.farms[0].commonResearch }} -->
  <!-- </collapsible-section> -->
</template>

<script lang="ts">

import _ from "lodash";
import { useSectionVisibility } from 'ui/composables/section_visibility';
import { defineComponent, PropType } from 'vue'; // toRefs
import CollapsibleSection from '@/components/CollapsibleSection.vue';
//
import researchesData from '@/researches.json';
import StatsMatrix from '@/components/StatsMatrix.vue';

export default defineComponent({
  components: {
    CollapsibleSection,
    StatsMatrix,
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
  },

  emits: ['update-list-by-id'],

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
      const { commonResearch } = this.scenarioA.farms[0]

      console.warn('regenerating CommonResearchWidget', commonResearch)
      return _.compact(_.map(commonResearch, ({ id, level }) => {

        const alt = this.scenarioB.farms[0].commonResearch.find(({ id:elID }) => (elID === id))?.level

        const info = researches[id]
        if (! info) { return { title: _.startCase(id), values: [level, alt, id, '(Problem understanding this research)'] } }
        const {
          name:title, levels, categories, description, effect_type, per_level, levels_compound, prices,
          // serial_id, type, id,
        } = info

        const paidPriceTot = sum(prices.slice(0, level))
        const leftPriceTot = sum(prices.slice(level))

        const nextPrice = numOrQuiet(prices[level], '-',   level < levels,  { basey: true })
        const paidPrice = numOrQuiet(paidPriceTot,  0,    paidPriceTot > 0, { basey: true })
        const leftPrice = numOrQuiet(leftPriceTot,  0, leftPriceTot > 0,    { basey: true })

        const symbol = effectSymbols[effect_type] || effect_type
        const effect = `${symbol} ${per_level}`

        const stacks = isStacking(levels_compound)

        const action = 'hi' // categories ? _.startCase(categories) : commonResearchActions[id]

        const cells = [
          // { val: level },
          { val: alt,     class: ['text-center'] },
          { val: levels,  class: ['text-center'] },
          { val: effect },
          { val: stacks },
          nextPrice,
          paidPrice,
          leftPrice,
          { val: action },
          // { val: id },
          // { val: sum(prices) },
          // { val: description },
          // { val: prices },
        ]

        return { id, val: level, title, cells, tip: description, info }
      }));
    },
  },

  methods: {
    updateCommonResearchLevel({ row, val }) {
      const max = row.info.levels
      const level = _.clamp(val, 0, max)
      console.warn('updateCommonResearchLevel', row, max, level)
      this.$emit('update-list-by-id', { path: 'scenarioA.farms[0].commonResearch', id: row.id, updates: { level } })
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
