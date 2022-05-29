<template>
  <template v-if="inventoryIsEmpty">
    <p class="max-w-lg mx-auto text-center">Looks like you don't have any artifacts :(</p>
  </template>
  <template v-else>

    <template v-if="loading">
      <div class="min-h-[500px]">
        <p class="max-w-lg 2xl:max-w-2xl mx-auto text-center text-sm text-gray-500">
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
        <div class="overflow-auto">
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

    <tickety-boo v-if="showTicks" :grid-info="gridInfo" />

    <div class="flex flex-col 2xl:px-24 md:flex-row items-center justify-between mt-4" :class="loading ? 'opacity-50' : null">

      <div class="flex md:w-3/5 w-full flex-row items-center justify-center">

        <div class="flex flex-col w-full my-2 px-2 items-center justify-center md:justify-start">
          <slot></slot>
        </div>

        <div class="flex flex-col w-full my-1 items-center justify-center">

          <check-option id="showTicks" class="w-full ml-2 mb-2" :checked="showTicks" @change="updateShowTicks">Show Tickmarks</check-option>
          <check-option id="transpose" class="w-full ml-2 mb-2" :checked="transpose" @change="updateTranspose">Switch Rows and Columns</check-option>
          <div class="flex w-full">
            <input
            id="itemsPerCol"
            :value.number="itemsPerColNum"
            name="itemsPerCol"
            type="number"
            :disabled="loading"
            class="mr-2 w-20"
            @input="itemsPerCol = ($event.target as any).value"
          />
          <div class="ml-2 w-32 text-sm">
            <label for="itemsPerCol" class="text-gray-600">
              Items per {{ transpose ? 'row' : 'column' }}<br />
              (blank for squarish)</label>
          </div>
          </div>
        </div>
      </div>

      <div class="flex md:w-2/5 w-full px-2 my-2 md:flex-col flex-row items-center justify-center">
        <a
          :href="imageURL"
          download="inventory.png"
          class="inline-flex text-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Download Image
        </a>
        <p class="mt-2 ml-6 md:w-full w-1/2 text-left text-xs text-gray-500">
          If the download button doesn't work, you may also right click / long press on the image
          above to use your browser's image saving function.
        </p>
      </div>

    </div>

  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, PropType, ref, toRefs, watch, Ref } from 'vue';
import * as _ from "lodash";

import { getLocalStorage, Inventory, setLocalStorage } from 'lib';
import { drawInventory, generateInventoryGrid, LayoutOrderables } from '@/lib';
import CheckOption from '@/components/CheckOption.vue'
import TicketyBoo  from '@/components/TicketyBoo.vue'

const props = defineProps({
  inventory: {
    type: Object as PropType<Inventory>,
    required: true,
  },
  layoutOrder: {
    type: Object as PropType<LayoutOrderables>,
    required: true,
  },
  bookmark: {
    type: String,
    required: true,
  },
});
const { inventory, layoutOrder, bookmark } = toRefs(props);

const LOCALSTORAGE_KEYS = {
  itemsPerCol: 'itemsPerColStorageKey',
  showTicks: 'showTicksStorageKey',
  transpose: 'transposeStorageKey',
}
type StorableType = keyof (typeof LOCALSTORAGE_KEYS);

function getStorageKey(base: StorableType): string {
  return `${LOCALSTORAGE_KEYS[base]}${bookmark.value}`
}

function loadVal(base: StorableType): string | undefined {
  const key = getStorageKey(base)
  return getLocalStorage(key)
}

function storeVal(base: StorableType, val: string) {
  const key = getStorageKey(base)
  // console.log('store', base, key, getLocalStorage(key), val)
  setLocalStorage(key, val)
}

const loadShowTicks = (): boolean => (loadVal('showTicks') === 'true')
const showTicks: Ref<boolean> = ref(loadShowTicks())
watch(showTicks, () => storeVal('showTicks', String(showTicks.value === true)))
//
const loadTranspose = (): boolean => (loadVal('transpose') === 'true');
const transpose: Ref<boolean> = ref(loadTranspose())
watch(transpose, () => storeVal('transpose', String(transpose.value === true)))
//
const loadItemsPerCol = (): string => (loadVal('itemsPerCol') ?? '')
const itemsPerCol: Ref<string> = ref(loadItemsPerCol());
watch(itemsPerCol, () => storeVal('itemsPerCol', String(limitItemsPerCol(itemsPerCol.value))))
const itemsPerColNum = computed(() => limitItemsPerCol(itemsPerCol.value));

watch(bookmark, () => {
  showTicks.value = loadShowTicks()
  transpose.value = loadTranspose()
  itemsPerCol.value = loadItemsPerCol()
})

const grid = computed(() => generateInventoryGrid(inventory.value as Inventory, {
  layoutOrder: layoutOrder.value,
  transpose: transpose.value,
}));

const inventoryIsEmpty = computed(() => grid.value.length === 0);
const limitItemsPerCol = (val: number | string) => (Number(val) > 0 ? _.clamp(Number(val), 1, 100) : '');

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
  imageURL.value = '';
  blockedByFirefoxPrivacyResistFingerprinting.value = true;
  error.value = null;
  try {
    const result = await drawInventory(
      canvasRef.value!,
      grid.value.slice(0, 30000),
      Number(itemsPerCol.value),
      transpose.value,
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
  } catch (err) {
    error.value = err instanceof Error ? err : new Error(`${err}`);
  }
  loading.value = false;
};

onMounted(regenerate);
const regenerateDebounced = _.debounce(regenerate, 1000)
watch(grid, regenerateDebounced, { deep: true })
watch(itemsPerCol, regenerateDebounced, { deep: true })

function updateShowTicks(event: Event) { showTicks.value = (<HTMLInputElement>event.target)?.checked || false }

function updateTranspose(event: Event) { transpose.value = (<HTMLInputElement>event.target)?.checked || false }

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
