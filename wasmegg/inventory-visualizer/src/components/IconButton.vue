<template>
  <button
    class="inline-flex py-1.5 px-2 text-center items-center disabled:bg-gray-100 disabled:text-gray-400 border border-transparent text-sm font-medium rounded-md bg-amber-100 hover:bg-lime-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-400"
    click="() => adoptInjectableDNA(dnaN)"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
//
export default defineComponent({
  name: "IconButton",
});
</script>
