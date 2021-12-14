<template>

<collapsible-section
  section-title="Artifacts"
  :visible="isVisibleSection('artifacts', true)"
  class="my-2 text-sm"
  @toggle="toggleSectionVisibility('artifacts')"
  >

  <artifact-set-display :build="build" :config="config" />

  <artifact-set-builder
    v-model:build="build"
    @update:build="updateBuild"
    />

</collapsible-section>

</template>

<script lang="ts">
import _ from "lodash";
import { defineComponent, PropType, ref, toRefs, watch } from 'vue';
import { useSectionVisibility } from 'ui/composables/section_visibility';
import { onBeforeRouteUpdate, useRouter } from 'vue-router';

import { Artifact, Build, Config } from 'artifact-sandbox/lib';
import ArtifactSetBuilder from 'artifact-sandbox/components/ArtifactSetBuilder.vue';
import ArtifactSetDisplay from 'artifact-sandbox/components/ArtifactSetDisplay.vue';
// import ArtifactSetsEffects from 'artifact-sandbox/components/ArtifactSetsEffects.vue';
// import Configurator from 'artifact-sandbox/components/Configurator.vue';
// import ShareSheet from 'artifact-sandbox/components/ShareSheet.vue';
import CollapsibleSection from '@/components/CollapsibleSection.vue';

export default defineComponent({
  components: {
    CollapsibleSection,
    ArtifactSetBuilder,
    ArtifactSetDisplay,
    // ArtifactSetsEffects,
    // Configurator,
    // ShareSheet,
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

  setup(props) {
    const { isVisibleSection, toggleSectionVisibility } = useSectionVisibility(false);
    const artifactsDb = toRefs(props.scenarioA.artifactsDb)
    const inventoryItems = toRefs(props.scenarioA.artifactsDb.inventoryItems)

    const items = _.mapKeys(props.scenarioA.artifactsDb.inventoryItems, 'itemId')

    // console.warn('ArtifactWidget', artifactsDb.inventoryItems, items)

    return {
      isVisibleSection,
      toggleSectionVisibility,
      items,
    };
  },

  data() {
    const { artifactsDb } = this.scenarioA

    const artifactInfo = artifactsDb.activeArtifactSets[0].slots.map(({ occupied, itemId }) => {
      if (! occupied) { return {} }
      const rawAfx = this.items[itemId]
      const { spec: { name:afxId, level:afxLevel, rarity:afxRarity } = {}, stones:rawStones } = rawAfx.artifact
      const stones = _.map(rawStones, ({ name:afxId, level:afxLevel }) => ({ afxId, afxLevel }))
      // const artifact = Artifact.fromProto({ afxId, afxLevel, afxRarity, stones })
      console.warn(afxId, afxLevel, afxRarity, stones)
      return { afxId, afxLevel, afxRarity, stones }
    })

    const build = Build.fromProto({ artifacts: artifactInfo })

    const config = Config.newDefaultConfig()

    console.warn('ArtifactWidget', build.artifacts)

    return { build, artifacts: build.artifacts, config }
  },

  methods: {

    updateBuild(newBuild) {

      console.warn(newBuild)
    },
  },

  // setup(props) {
  //   // const router = useRouter();
  //   // const { serializedBuilds } = toRefs(props);
  //
  //   // Use a key to work around the problem of artifact-set-builder and
  //   // configurator not updating upon manual hashchange.
  //   // const key = ref(0);
  //   // const builds = ref(deserializeBuilds(serializedBuilds.value));
  //   // const showShareSheet = ref(false);
  //   // const showFootnotesWhenSharing = ref(true);
  //
  //   watch(
  //     builds,
  //     () => {
  //       window.history.replaceState(
  //         {},
  //         '',
  //         router.resolve({
  //           name: 'builds',
  //           params: { serializedBuilds: builds.value.serialize() },
  //         }).href
  //       );
  //     },
  //     {
  //       deep: true,
  //     }
  //   );
  //
  //   onBeforeRouteUpdate(to => {
  //     // On manual hashchange, flip key to rerender everything.
  //     const newSerializedBuilds = to.params.serializedBuilds as string | undefined;
  //     builds.value = deserializeBuilds(newSerializedBuilds);
  //     key.value = 1 - key.value;
  //   });
  //
  //   return {
  //     key,
  //     builds,
  //     showShareSheet,
  //     showFootnotesWhenSharing,
  //   };
  // },

});

</script>
