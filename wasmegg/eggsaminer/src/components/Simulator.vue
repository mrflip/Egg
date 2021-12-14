<template>

  <earnings-widget
    :scenario-a="scenarioA"
    :scenario-b="scenarioB"
    :farm-a="scenarioA.farms[0]"
    :farm-b="scenarioB.farms[0]"
    @update-list-by-id="onUpdateListByID"
    @update-value="onUpdateValue"
  />

  <artifact-widget
    :scenario-a="scenarioA"
    :scenario-b="scenarioB"
    :farm-a="scenarioA.farms[0]"
    :farm-b="scenarioB.farms[0]"
    @update-list-by-id="onUpdateListByID"
    @update-value="onUpdateValue"
  />

  <population-widget
    :scenario-a="scenarioA"
    :scenario-b="scenarioB"
    :farm-a="scenarioA.farms[0]"
    :farm-b="scenarioB.farms[0]"
    @update-list-by-id="onUpdateListByID"
    @update-value="onUpdateValue"
    />

  <common-research-widget
    :scenario-a="scenarioA"
    :scenario-b="scenarioB"
    :farm-a="scenarioA.farms[0]"
    :farm-b="scenarioB.farms[0]"
    @update-list-by-id="onUpdateListByID"
    @update-value="onUpdateValue"
    />

  <epic-research-widget
    :scenario-a="scenarioA"
    :scenario-b="scenarioB"
    @update-list-by-id="onUpdateListByID"
  />
</template>

<script lang="ts">
  import _ from "lodash";
import { defineComponent, PropType } from 'vue';
//
import { Backup } from 'lib'
import ArtifactWidget from '@/components/ArtifactWidget.vue';
import EarningsWidget from '@/components/EarningsWidget.vue';
import EpicResearchWidget from '@/components/EpicResearchWidget.vue';
import CommonResearchWidget from '@/components/CommonResearchWidget.vue';
import PopulationWidget from '@/components/PopulationWidget.vue';

export default defineComponent({
  components: {
    ArtifactWidget,
    EarningsWidget,
    EpicResearchWidget,
    CommonResearchWidget,
    PopulationWidget,
  },

  props: {
    backup: {
      type: Object as PropType<Backup>,
      required: true,
    },
  },

  // This async component does not respond to playerId changes.
  /* eslint-disable vue/no-setup-props-destructure */
  setup({ backup }) {
    return {
      scenarioB: backup,
    };
  },

  data() {
    const scenarioA = _.cloneDeep(this.backup)
    scenarioA.gameev = {
      research_discount: 0, craft_discount: 0, epic_discount: 0,
      earnings_mult: 1, boost_duration: 1, prestige_mult: 1,
      piggy_mult: 1, drone_mult: 1, gift_mult: 1, housing_mult: 1,
    }

    return { scenarioA }
  },

  methods: {
    onUpdateListByID({ path, id, updates }) {
      const list = _.get(this, path)
      console.warn('onUpdateListByID', path, id, updates, list)
      const idx = list.findIndex(({ id:elID }) => (elID === id))
      list[idx] = _.merge({}, list[idx], updates)
    },

    onUpdateValue({ path, val }) {
      console.warn('onUpdateValue', path, val)
      _.set(this, path, val)
    },
  },
});

</script>
