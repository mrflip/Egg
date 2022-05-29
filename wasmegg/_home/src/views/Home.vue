<template>
  <h1 class="mb-4 text-center text-h1 leading-6 font-medium text-gray-900">
    <span class="whitespace-nowrap">@mrflip's fork of @mk2's public utilities</span>{{ ' ' }}
    <span class="whitespace-nowrap">for Egg, Inc.</span>
  </h1>

  <div
    class="p-4 w-full items-center justify-center bg-green-50 rounded-lg shadow-inner"
  >
    <p>The only interesting things here are</p>
    <ul>
      <li>A version of the
        <a class="underline" href="/inventory-visualizer">Inventory Visualizer</a>
        with much configuration.
      </li>
      <li>Less Rick, much less Roll (at least, as far as you know).</li>
    </ul>

    <p class="flex">
      This is a fork of @mk2's original code, which they have made
      available for any to use/modify.  It's very unlikely I will keep
      this up to date or make further improvements.
    </p>

    <p>
      Please visit
      <a class="underline" href="https://wasmegg.netlify.app">
        @mk2's original site at https://wasmegg.netlify.app
      </a>
      for the original tools.
    </p>

  </div>

</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import {
  setLocalStorageNoPrefix,
} from 'lib';
import BaseLink from '@/components/BaseLink.vue';
import BaseRouterLink from '@/components/BaseRouterLink.vue';
// import DonorList from '@/components/DonorList.vue';
import EasterEgg from '@/components/EasterEgg.vue';
import ToolDescription from '@/components/ToolDescription.vue';
import V120Badge from '@/components/V120Badge.vue';
import WhatsNew from '@/components/WhatsNew.vue';

const EASTER_EGG_DAY = 7;
const EASTER_EGG_SHOWN_AT_LOCALSTORAGE_KEY = 'easterEggShownAt';

export default defineComponent({
  components: {
    BaseLink,
    BaseRouterLink,
    // DonorList,
    EasterEgg,
    ToolDescription,
    V120Badge,
    WhatsNew,
  },
});
</script>

<style lang="postcss" scoped>
h2 {
  @apply font-medium text-h2 my-2;
}

h3 {
  @apply font-medium text-h3 my-2;
}
</style>
