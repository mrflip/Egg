<template>
<div class="flex items-center justify-start">
  <div class="flex items-center h-5">
    <input
      :id="id"
      :name="id"
      type="checkbox"
      :checked="checked"
      class="focus:ring-0 focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
      :disabled="disabled"
    />
  </div>
  <div class="ml-4 text-sm">
    <label :for="id" class="text-gray-600">
      <slot></slot>
    </label>
  </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
//
export default defineComponent({
  name: "CheckOption",
  props: {
    id:         { type: String, required: true },
    classes:    { type: String, default: '' },
    checked:    { type: Boolean, default: false },
    disabled:   { type: Boolean, default: false },
  },
});
</script>
