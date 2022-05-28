<template>
  <template v-if="inventoryIsEmpty">
    <p class="max-w-lg mx-auto text-center">Looks like you don't have any artifact :(</p>
  </template>
  <template v-else>

    <template v-if="loading">
      <div class="min-h-[500px]">
      <p class="max-w-lg mx-auto text-center text-sm text-gray-500">
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
      <div v-else class="space-y-2">
        <p v-if="blockedByFirefoxPrivacyResistFingerprinting" class="text-xs text-red-500">
          Oops! Canvas to image functionality might have been sabotaged by your browser! Ignore this
          if the image looks normal. Otherwise, if you're using Firefox, you might have the
          <code>privacy.resistFingerprinting</code> setting turned on. Please check your browser
          address bar and look for a picture icon which you can click and grant "Extract canvas
          data" permission to this site. Reload after granting the permission.
        </p>
        <div class="overflow-scroll">
          <img
            :src="imageURL"
            :width="width / 2"
            :height="height / 2"
            class="block mx-auto max-w-full"
          />
        </div>
      </div>
    </template>

    <canvas ref="canvasRef" class="hidden"></canvas>

    <tickety-boo :gridInfo="gridInfo" v-if="showTicks" />

    <div class="flex items-center justify-around my-4" :class="loading ? 'opacity-50' : null">

      <div class="flex w-1//6 items-center justify-center">
          <div class="flex items-center h-5">
            <input
              id="fragmentsWithStones"
              v-model="fragmentsWithStones"
              name="fragmentsWithStones"
              type="checkbox"
              class="focus:ring-0 focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
              :disabled="loading"
            />
          </div>
          <div class="ml-4 text-sm">
            <label for="fragmentsWithStones" class="text-gray-600">Combine Stones<br>with Fragments</label>
          </div>
      </div>

      <div class="flex w-1/3 items-center justify-center">
        <input
          id="itemsPerCol"
          :value.number="itemsPerColNum"
          @input="itemsPerCol = ($event.target as any).value"
          name="itemsPerCol"
          type="number"
          :disabled="loading"
          class="m-2 w-20"
        />
        <div class="ml-2 text-sm">
          <label for="itemsPerCol" class="text-gray-600">
            Items per {{ transpose ? 'row' : 'column' }}<br />
            (blank for squarish)</label>
        </div>
      </div>

      <div class="flex w-1/2 py-1 items-center justify-center">
        <a
          :href="imageURL"
          download="inventory.png"
          class="inline-flex text-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Download Image
        </a>
        <p class="w-[26em] ml-4 text-left text-xs text-gray-500">
          If the download button doesn't work, you may also right click / long press on the image
          above to use your browser's image saving function.
        </p>
      </div>
    </div>

  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, toRefs, watch } from 'vue';
import * as _ from "lodash";

import { getLocalStorage, Inventory, setLocalStorage } from 'lib';
import { drawInventory, generateInventoryGrid, LayoutOrderables } from '@/lib';
import TicketyBoo from '@/components/TicketyBoo.vue'

const props = defineProps({
  inventory: {
    type: Object as PropType<Inventory>,
    required: true,
  },
  layoutOrder: {
    type: Object as PropType<LayoutOrderables>,
    required: true,
  },
  showTicks: {
    type: Boolean,
    default: false,
  },
  transpose: {
    type: Boolean,
    default: false,
  },
});
const { inventory, layoutOrder } = toRefs(props);

const FRAGMENTS_WITH_STONES_LOCALSTORAGE_KEY = 'fragmentsWithStones';
const fragmentsWithStones = ref((getLocalStorage(FRAGMENTS_WITH_STONES_LOCALSTORAGE_KEY) ?? 'true') === 'true');
watch(fragmentsWithStones, () =>
  setLocalStorage(FRAGMENTS_WITH_STONES_LOCALSTORAGE_KEY, fragmentsWithStones.value)
);
const TRANSPOSE_LOCALSTORAGE_KEY = 'transposeImage';
const transpose = ref(getLocalStorage(TRANSPOSE_LOCALSTORAGE_KEY) === 'true');
watch(transpose, () =>
  setLocalStorage(TRANSPOSE_LOCALSTORAGE_KEY, transpose.value)
);

const ITEMS_PER_COL_LOCALSTORAGE_KEY = 'itemsPerCol';
const itemsPerCol = ref(getLocalStorage(ITEMS_PER_COL_LOCALSTORAGE_KEY) || '');
watch(itemsPerCol, () =>
  setLocalStorage(ITEMS_PER_COL_LOCALSTORAGE_KEY, limitItemsPerCol(itemsPerCol.value))
);

const itemsPerColNum = computed(() => limitItemsPerCol(itemsPerCol.value));
//
const grid = computed(() => generateInventoryGrid(inventory.value as Inventory, {
  fragmentsWithStones: fragmentsWithStones.value,
  forceItemsPerCol: Number(itemsPerCol.value),
  layoutOrder: layoutOrder.value,
  transpose: transpose.value,
 })
);

const inventoryIsEmpty = computed(() => grid.value.length === 0);
const limitItemsPerCol = (val: number | string) => (Number(val) > 0 ? _.clamp(Number(val), 1, 200) : '');

const canvasRef = ref<HTMLCanvasElement | null>(null);
const loading = ref(false);
const imageURL = ref('');
const width = ref(0);
const height = ref(0);
const gridInfo = ref({ actualPerCol: 0, actualPerRow: 0, width, height })
const blockedByFirefoxPrivacyResistFingerprinting = ref(false);
const error = ref<Error | null>(null);

const regenerate = async () => {
  loading.value = true;
  imageURL.value = '';
  blockedByFirefoxPrivacyResistFingerprinting.value = true;
  error.value = null;
  try {
    const result = await drawInventory(canvasRef.value!, grid.value, Number(itemsPerCol.value), transpose.value);
    imageURL.value = result.url;
    width.value = result.width;
    height.value = result.height;
    gridInfo.value = result;
    blockedByFirefoxPrivacyResistFingerprinting.value =
      result.blockedByFirefoxPrivacyResistFingerprinting;
    if (await imageIsEmpty(imageURL.value)) {
      error.value = new Error('unknown error occurred, generated canvas is empty');
    }
  } catch (err) {
    error.value = err instanceof Error ? err : new Error(`${err}`);
  }
  loading.value = false;
};

onMounted(regenerate);
const regenerateDebounced = _.debounce(regenerate, 1000)
watch(grid, regenerateDebounced, { deep: true })

async function imageIsEmpty(url: string): Promise<boolean> {
  const image = new Image();
  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = url;
    });
  } catch (err) {
    console.log(`failed to load image into HTMLImageElement: ${err}`);
    return false;
  }
  return image.naturalWidth === 0 || image.naturalHeight === 0;
}

</script>
