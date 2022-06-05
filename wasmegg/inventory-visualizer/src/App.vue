<template>
  <the-nav-bar />

  <main class="flex-1 w-full mx-auto">
    <h1 class="mx-4 my-4 text-center text-lg leading-6 font-medium uppercase">Artifact sandbox</h1>
    <div class="mt-4">
      <router-view />
    </div>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Visualizer from '@/views/Visualizer.vue';

import TheNavBar from 'ui/components/NavBar.vue';

export default defineComponent({
  components: {
    TheNavBar, Visualizer,
  },
})
</script>
