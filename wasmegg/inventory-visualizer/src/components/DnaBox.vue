<template>
  <code class="text-xs p-2 pl-3 my-2 md:ml-2 w-[16rem] xs:w-[24rem] sm:w-[30rem] overflow-clip">
    <slot></slot>
  </code>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
//
export default defineComponent({
  name: "DnaBox",
});
</script>
