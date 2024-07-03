<template>
  <template v-if="inventoryIsEmpty">
    <p class="max-w-lg mx-auto text-center">Looks like you don't have any artifacts :(</p>
  </template>
  <template v-else>
    <div class="flex flex-col max-w-4xl w-full mx-auto">

      <template v-if="loading">
        <div class="placeholder">
          <p class="max-w-4xl mx-auto text-center text-sm text-gray-500">
            Generating image, this might take a while...<br />
            Note that this tool may not work in all browsers.
          </p>
        </div>
      </template>
      <template v-else>
        <template v-if="error !== null">
          <p class="max-w-lg mx-auto text-center text-sm text-red-500">{{ error }}</p>
          <p class="max-w-lg mx-auto text-center text-sm text-gray-500">Maybe try another browser?</p>
        </template>
        <div v-else class="space-y-2 imagebox">
          <p v-if="blockedByFirefoxPrivacyResistFingerprinting" class="text-xs text-red-500">
            Oops! Canvas to image functionality might have been sabotaged by your browser! Ignore this
            if the image looks normal. Otherwise, if you're using Firefox, you might have the
            <code>privacy.resistFingerprinting</code> setting turned on. Please check your browser
            address bar and look for a picture icon which you can click and grant "Extract canvas
            data" permission to this site. Reload after granting the permission.
          </p>
          <div class="overflow-auto imagebox">
            <img
              :src="imageURL"
              :width="(limWidth ?? 0) / 2"
              :height="(limHeight ?? 0) / 2"
              class="block mx-auto max-w-full"
            />
          </div>
        </div>
      </template>

      <canvas ref="canvasRef" class="hidden"></canvas>

      <tickety-boo v-if="showTicks" :grid-info="gridInfo" :box-max="boxMax"/>

    </div>
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, toRefs, watch, Ref, defineEmits } from 'vue';
import * as _ from "lodash";

import { getLocalStorage, Inventory, setLocalStorage } from 'lib';
import { drawInventory, generateInventoryGrid, Orderables } from '@/lib';
import TicketyBoo  from '@/components/TicketyBoo.vue'

const emit = defineEmits(['imageURLChange', 'loadingChange'])

const props = defineProps({
  inventory: {
    type: Object as PropType<Inventory>,
    required: true,
  },
  aspects:     { type: Object as PropType<Orderables>, required: true },
  artifacts:   { type: Object as PropType<Orderables>, required: true },
  stones:      { type: Object as PropType<Orderables>, required: true },
  showTicks:   { type: Boolean, required: true },
  sillySizes:  { type: Boolean, required: true },
  smushStoned: { type: Boolean, required: true },
  transpose:   { type: Boolean, required: true },
  perCol:      { type: String,  required: true },
  boxMax:      { type: Number, default: 1280 },
});

const {
  inventory, aspects, artifacts, stones, showTicks, sillySizes, smushStoned, transpose, perCol, boxMax,
} = toRefs(props);

const grid = computed(() => generateInventoryGrid(
  inventory.value as Inventory, {
    layoutOrder: { aspects: aspects.value, artifacts: artifacts.value, stones: stones.value },
    transpose: transpose.value,
    smushStoned: smushStoned.value,
}));

watch(sillySizes, () => {
  const { actualPerCol = 100, actualPerRow = 100 } = gridInfo.value
  const squarish = Math.sqrt(grid.value?.length || 20)
  // if ((! sillySizes.value) && (
    // ((actualPerRow > 2 * squarish) || (actualPerCol > 2 * squarish)))) {
  // itemsPerCol.value = ''
  // }
})

const inventoryIsEmpty = computed(() => grid.value.length === 0);

const canvasRef = ref<HTMLCanvasElement | null>(null);
const loading = ref(false);
const imageURL = ref('');
const width = ref(0);
const height = ref(0);
const gridInfo = ref({ actualPerCol: 0, actualPerRow: 0, width, height, totalWidthPx: 1024 })
const blockedByFirefoxPrivacyResistFingerprinting = ref(false);
const error = ref<Error | null>(null);

const regenerate = async () => {
  loading.value = true;
  emit('loadingChange', true)
  imageURL.value = '';
  blockedByFirefoxPrivacyResistFingerprinting.value = true;
  error.value = null;
  try {
    const result = await drawInventory(
      canvasRef.value! as HTMLCanvasElement,
      grid.value, // .slice(0, 300),
      Number(perCol.value),
      transpose.value,
      sillySizes.value,
    );
    imageURL.value = result.url;
    width.value = result.width;
    height.value = result.height;
    gridInfo.value = result;
    blockedByFirefoxPrivacyResistFingerprinting.value =
      result.blockedByFirefoxPrivacyResistFingerprinting;
    if (await imageIsEmpty(imageURL.value)) {
      error.value = new Error('unknown error occurred, generated canvas is empty');
    }
    emit('imageURLChange', imageURL.value)
  } catch (err) {
    error.value = err instanceof Error ? err : new Error(`${err}`);
  }
  loading.value = false;
  emit('loadingChange', false)
};

onMounted(regenerate);
const regenerateDebounced = _.debounce(regenerate, 1000)
const regenerateLonger    = _.debounce(regenerate, 2000)
watch(grid, regenerateLonger, { deep: true })
watch(perCol, regenerateDebounced, { deep: true })

async function imageIsEmpty(url: string): Promise<boolean> {
  const image = new Image();
  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = url;
    });
  } catch (err) {
    console.warn(`failed to load image into HTMLImageElement: ${err}`);
    return false;
  }
  return image.naturalWidth === 0 || image.naturalHeight === 0;
}

const limWidth = computed(() => _.min([width.value, boxMax.value * 2]))

const limHeight = computed(() => _.min([height.value, boxMax.value * 2]))

const placeholderSizing = computed(() => {
  const { height, width } = gridInfo.value
  const tothfrac = height / width || 0.5
  return {
    xxs: `${Math.floor((380-32) * tothfrac)}px`,
    xs:  `${Math.floor((550-32) * tothfrac)}px`,
    sm:  `${Math.floor((640-32) * tothfrac)}px`,
    md:  `${Math.floor((768-32) * tothfrac)}px`,
    lg:  `${Math.floor((1024-32) * tothfrac)}px`,
    xl:  `${Math.floor((1280-32) * tothfrac)}px`,
  }
})

</script>
<style>
  .placeholder { height: v-bind('placeholderSizing.xxs') }
  @media screen and (min-width:  500px) {
    .placeholder { background: #eeeeff; height: v-bind('placeholderSizing.xs') }
  }
  @media screen and (min-width:  640px) {
    .placeholder { background: #eeeeff; height: v-bind('placeholderSizing.sm') }
  }
  @media screen and (min-width:  768px) {
    .placeholder { background: #eeeeff; height: v-bind('placeholderSizing.md') }
  }
  @media screen and (min-width: 1024px) {
    .placeholder { background: #eeeeff; height: v-bind('placeholderSizing.lg') }
  }
  @media screen and (min-width: 1536px) {
    .placeholder { background: #eeeeff; height: v-bind('placeholderSizing.xl') }
  }
</style>
