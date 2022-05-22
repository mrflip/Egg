<template>
  <template v-if="inventoryIsEmpty">
    <p class="max-w-lg mx-auto text-center">Looks like you don't have any artifact :(</p>
  </template>
  <template v-else>

    <div class="flex justify-center mb-3" :class="loading ? 'opacity-50' : null">
      <div class="space-y-0.5">
        <div class="relative flex items-start">
          <div class="flex items-center h-5">
            <input
              id="rarerItemsFirst"
              v-model="rarerItemsFirst"
              name="rarerItemsFirst"
              type="checkbox"
              class="focus:ring-0 focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
              :disabled="loading"
            />
          </div>
          <div class="ml-2 text-sm">
            <label for="rarerItemsFirst" class="text-gray-600">Rarer items first</label>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-center mb-3" :class="loading ? 'opacity-50' : null">
      <div class="space-y-0.5">
        <div class="relative flex items-start">
          <div class="flex items-center h-5">
            <input
              id="transpose"
              v-model="transpose"
              name="transpose"
              type="checkbox"
              class="focus:ring-0 focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
              :disabled="loading"
            />
          </div>
          <div class="ml-2 text-sm">
            <label for="transpose" class="text-gray-600">Horizonal first</label>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-center mb-3" :class="loading ? 'opacity-50' : null">
      <div>
        <div class="flex items-center h-10">
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
            <label for="itemsPerCol" class="text-gray-600">Items per column (blank for squarish)</label>
          </div>
        </div>
      </div>
    </div>

    <template v-if="loading">
      <p class="max-w-lg mx-auto text-center text-sm text-gray-500">
        Generating image, this might take a while...<br />
        Note that this tool may not work in all browsers.
      </p>
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
        <div class="flex items-center justify-center">
          <a
            :href="imageURL"
            download="inventory.png"
            class="inline-flex items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Download Image
          </a>
        </div>
        <p class="max-w-lg mx-auto text-center text-xs text-gray-500">
          If the download button doesn't work, you may also right click / long press on the image
          below to use your browser's image saving function.
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

    <div class="flex justify-center my-3" :class="loading ? 'opacity-50' : null">
      <div>
        <div class="flex items-center h-16">
          <div class="ml-1 text-sm"><label for="artifactLayoutLeg" class="text-gray-600">
              Sort Order By Type<br/>Lower = Lefter
          </label></div>
          <div class="flex-col ml-2">
            <input class="mx-2 my-1 w-20 border"  id="artifactLayoutLeg" v-model="artifactLayoutLeg" name="artifactLayoutLeg" :disabled="loading" type="number" />
            <div   class="text-sm text-center"><label for="artifactLayoutLeg" class="text-gray-600">Legendary</label></div>
          </div>
          <div class="flex-col ml-2">
            <input class="mx-2 my-1 w-20 border"  id="artifactLayoutEpic" v-model="artifactLayoutEpic" name="artifactLayoutEpic" :disabled="loading" type="number" />
            <div   class="text-sm text-center"><label for="artifactLayoutEpic" class="text-gray-600">Epic</label></div>
          </div>
          <div class="flex-col ml-2">
            <input class="mx-2 my-1 w-20 border" id="artifactLayoutRare" v-model="artifactLayoutRare" name="artifactLayoutRare" :disabled="loading" type="number" />
            <div   class="text-sm text-center"><label for="artifactLayoutRare" class="text-gray-600">Rare</label></div>
          </div>
          <div class="flex-col ml-2">
            <input class="mx-2 my-1 w-20 border" id="artifactLayoutCommon" v-model="artifactLayoutCommon" name="artifactLayoutCommon" :disabled="loading" type="number" />
            <div   class="text-sm text-center"><label for="artifactLayoutCommon" class="text-gray-600">Common</label></div>
          </div>
        </div>
      </div>
    </div>

  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, toRefs, watch } from 'vue';
import * as _ from "lodash";

import { getLocalStorage, Inventory, setLocalStorage } from 'lib';
import { drawInventory, generateInventoryGrid } from '@/lib';

const props = defineProps({
  inventory: {
    type: Object as PropType<Inventory>,
    required: true,
  },
});
const { inventory } = toRefs(props);

const RARER_ITEMS_FIRST_LOCALSTORAGE_KEY = 'rarerItemsFirst';
const rarerItemsFirst = ref(getLocalStorage(RARER_ITEMS_FIRST_LOCALSTORAGE_KEY) === 'true');
watch(rarerItemsFirst, () =>
  setLocalStorage(RARER_ITEMS_FIRST_LOCALSTORAGE_KEY, rarerItemsFirst.value)
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

const ARTIFACT_LAYOUT_LEG_LOCALSTORAGE_KEY = 'artifactLayoutLeg';
const artifactLayoutLeg = ref(getLocalStorage(ARTIFACT_LAYOUT_LEG_LOCALSTORAGE_KEY) || 10);
watch(artifactLayoutLeg, () =>
  setLocalStorage(ARTIFACT_LAYOUT_LEG_LOCALSTORAGE_KEY, Math.floor(Number(artifactLayoutLeg.value)))
);

const ARTIFACT_LAYOUT_EPIC_LOCALSTORAGE_KEY = 'artifactLayoutEpic';
const artifactLayoutEpic = ref(getLocalStorage(ARTIFACT_LAYOUT_EPIC_LOCALSTORAGE_KEY) || 20);
watch(artifactLayoutEpic, () =>
  setLocalStorage(ARTIFACT_LAYOUT_EPIC_LOCALSTORAGE_KEY, Number(artifactLayoutEpic.value))
);

const ARTIFACT_LAYOUT_RARE_LOCALSTORAGE_KEY = 'artifactLayoutRare';
const artifactLayoutRare = ref(getLocalStorage(ARTIFACT_LAYOUT_RARE_LOCALSTORAGE_KEY) || 30);
watch(artifactLayoutRare, () =>
  setLocalStorage(ARTIFACT_LAYOUT_RARE_LOCALSTORAGE_KEY, Math.floor(Number(artifactLayoutRare.value)))
);

const ARTIFACT_LAYOUT_COMMON_LOCALSTORAGE_KEY = 'artifactLayoutCommon';
const artifactLayoutCommon = ref(getLocalStorage(ARTIFACT_LAYOUT_COMMON_LOCALSTORAGE_KEY) || 100);
watch(artifactLayoutCommon, () =>
  setLocalStorage(ARTIFACT_LAYOUT_COMMON_LOCALSTORAGE_KEY, Math.floor(Number(artifactLayoutCommon.value)))
);

const itemsPerColNum = computed(() => limitItemsPerCol(itemsPerCol.value));
//
const grid = computed(() =>
  generateInventoryGrid(inventory.value as Inventory, {
    rarerItemsFirst: rarerItemsFirst.value,
    forceItemsPerCol: Number(itemsPerCol.value),
    artifactLayoutLeg:    Number(artifactLayoutLeg.value),
    artifactLayoutEpic:   Number(artifactLayoutEpic.value),
    artifactLayoutRare:   Number(artifactLayoutRare.value),
    artifactLayoutCommon: Number(artifactLayoutCommon.value),
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
