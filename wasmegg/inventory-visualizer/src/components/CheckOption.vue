<template>

    <div class="flex w-1//6 mx-4 items-center justify-center">
      <div class="flex items-center h-5">
        <input
          id="{{id}}"
          v-model="checkedState"
          name="{{id}}"
          type="checkbox"
          class="focus:ring-0 focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
          :disabled="disabled"
        />
      </div>
      <div class="ml-4 text-sm">
        <label for="{{id}}" class="text-gray-600">
          <slot></slot>
        </label>
      </div>
    </div>
</template>

<script lang="ts">
import lodash from 'lodash';
import { defineComponent } from 'vue';
//
const _ = lodash

export default defineComponent({
  name: "CheckOption",
  props: {
    classes:    { type: String },
    checked:    { type: Boolean },
    disabled:   { type: Boolean },
  },
  emits: ['handleChecked'],
  data() {
    return {
      _: lodash,
      checkedState: this.checked,
    };
  },
});
</script>
