<template>
  <div class="flex flex-col w-full items-center justify-center">
    <div class="text-left mt-2 px-2 max-w-[600px] lg:max-w-[800px]">
      <h3 class="mb-2 font-bold m-2 text-center">How this works</h3>
      <p>
        To organize your inventory we
        {{ options?.smushStoned ? 'first combine all items with the same stoning into a square. Then we' : '' }}
      </p>
      <ul class="pl-4">
        <li class="list-disc">{{ examples[0]?.desc }};      </li>
        <li class="list-disc">then {{ examples[1]?.desc }}, </li>
        <li class="list-disc">then {{ examples[2]?.desc }}, </li>
        <li class="list-disc">then {{ examples[3]?.desc }}, </li>
        <li class="list-disc">then {{ examples[4]?.desc }}, </li>
      </ul>
      <p class="mb-2">
        and so forth. You can change that in the 'Groups' tab.
      </p>
      <p class="mt-2 mb-2">
        When it comes time to sort by Family, we will use the order
        you choose in the "Artifacts" tab: the way it is now puts the
        {{ firstArtifact }} first and the {{ lastArtifact }} last.
        Similarly, the "Stones" widget is set to choose the
        {{ firstStone }} first for stones and fragments
        and when sorting by mounted stone.
      </p>
      <p v-if="examples.slice(4).some(({ id }) => (id === 'byStoning'))">
        But if you, say, moved '{{ aspects?.byStoning?.name }}' to the top, it would first {{ aspects?.byStoning?.desc }}.
      </p>
      <p v-else-if="examples.slice(4).some(({ id }) => (id === 'byFamily'))">
        But if you, say, moved '{{ aspects?.byFamily?.name }}' to the top, it would first {{ aspects?.byFamily?.desc }}.
      </p>
      <p v-else>
        But if you, say, moved '{{ _.last(examples)?.name }}' to the top, it would first {{ _.last(examples).desc }}.
      </p>
      <p class="mt-2">
        Or -- instead of reading blah blah blah, click the "I'm Feeling
        Lucky!" button and play around with what comes out. (The button
        probably isn't a rickroll, you'll have to weigh the risks.)
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash'
import { defineComponent } from 'vue';
//
export default defineComponent({
  name: "HowThisWorks",
  props: {
    options:    { type: Object, required: true },
    aspects:    { type: Object, required: true },
    artifacts:  { type: Object, required: true },
    selaspects: { type: Object, required: true },
    stones:     { type: Object, required: true },
  },
  data() {
    return { _ } // eslint-disable-line vue/no-reserved-keys
  },
  computed: {
    examples() {
      return _.sortBy(this.selaspects, 'weight')
    },
    firstArtifact() { return _.first(_.sortBy(this.artifacts, 'weight'))?.name },
    lastArtifact()  { return _.last(_.sortBy(this.artifacts, 'weight'))?.name },
    firstStone()    { return _.first(_.sortBy(this.stones, 'weight'))?.name },
  },
});

// {{ options.fancy ? '' : 'had `fancy groupings` on and' }}
</script>
