<template>
  <h1 class="mb-4 text-center text-h1 leading-6 font-medium text-gray-900">Contact</h1>

  <div
    class="p-4 w-full items-center justify-center bg-green-50 rounded-lg shadow-inner"
    >
    <p>
      This is a fork of @mk2's original code, which they have made available for any to use/modify.
    </p>

    <p>
      Please visit
      <a href="https://wasmegg.netlify.app/#/contact">
        @mk2's original site at https://wasmegg.netlify.app/#/contact for more info.
      </a>
    </p>
  </div>

  <p><base-router-link :to="{ name: 'home' }">Back to home page</base-router-link></p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import discordWordmarkUrl from '@/icons/discord-wordmark.svg';
import BaseLink from '@/components/BaseLink.vue';
import BaseRouterLink from '@/components/BaseRouterLink.vue';

export default defineComponent({
  components: {
    BaseLink,
    BaseRouterLink,
  },
  setup() {
    return {
      discordWordmarkUrl,
    };
  },
});
</script>

<style lang="postcss" scoped>
p {
  @apply my-4;
}
</style>
