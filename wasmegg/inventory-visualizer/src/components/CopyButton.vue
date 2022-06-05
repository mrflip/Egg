<template>
  <button class="flex flex-row" v-tippy="{ content: tooltip }" @click="doCopyText">
    <span v-if="party" class="mr-1 w-6 h-6 self-center">🎉</span>
    <copy-icon v-else class="mr-1 w-6 h-6 self-center"></copy-icon>
    <slot></slot>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import copyTextToClipboard from 'copy-text-to-clipboard';
import { ClipboardCopyIcon as CopyIcon } from '@heroicons/vue/solid';

export default defineComponent({
  components: { CopyIcon },
  props: {
    content: {
      type: String,
      required: true,
    },
    tooltip: {
      type: String,
      default: 'Copy',
    },
  },

  data() {
    return { party: false }
  },
  methods: {
    doCopyText() {
      copyTextToClipboard(this.content)
      // console.log(JSON.stringify(this.content))
      this.party = true
      setTimeout(() => { this.party = false }, 1500)
    },
  },

  setup() {
    return {
      copyTextToClipboard,
    };
  },
});

</script>
