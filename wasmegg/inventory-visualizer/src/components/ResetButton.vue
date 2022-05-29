<template>
<button
  class="mt-2 mb-1 w-48 py-2 px-4 flex justify-center border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-800 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
>
  <slot></slot>
</button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
//
export default defineComponent({
  name: "ResetButton",
});
</script>
