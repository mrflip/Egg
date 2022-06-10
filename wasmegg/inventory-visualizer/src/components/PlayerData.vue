<template>

  <template v-if="true && loaded">
    <inventory-canvas
      :inventory="inventory"
      :artifacts="artifacts"
      :aspects="selaspects"
      :stones="stones"
      :show-ticks="options.showTicks"
      :smush-stoned="options.smushStoned"
      :transpose="options.transpose"
      :silly-sizes="options.sillySizes"
      :per-col="clampedPerCol"
      @imageURLChange="(val) => { imageURL = val }"
      @loadingChange="(val) => { loading = val }"
    />
  </template>

  <div class="flex flex-row 2xl:px-24 mt-2 max-w-[1024px] m-auto items-center justify-around" :class="loading ? 'opacity-50' : null">
    <div class="hidden sm:flex w-full items-center justify-center">
      <select id="bookmarks" :value="bookmark" class="flex my-1" name="bookmarks" @change="handleBookmarkChange">
        <template v-for="bkInfo of bookmarkProps" :key="bkInfo.id">
          <option :value="bkInfo.id" :id="bkInfo.id">{{ bkInfo.label }}</option>
        </template>
      </select>
      <icon-button
        class="mx-2"
        @click="() => adoptNewDNA({ dna: savedDNA[bookmark] })"
        :disabled="(! canLoadDNA(savedDNA[bookmark])) || (savedDNA[bookmark] === dna)"
      >
        <replace-icon class="w-6 h-6" />
        <span class="hidden sm:flex ml-1">Load</span>
      </icon-button>
    </div>

    <div class="flex w-full flex-row items-center justify-center">
      <input
        id="perCol"
        :value.number="options.perCol"
        name="perCol"
        type="number"
        :disabled="loading"
        class="w-12 xs:w-16 md:w-20 max-h-32 self-center"
        @input="options.perCol = ($event.target as any).value"
      />
      <div class="ml-2 text-sm">
        <label for="perCol" class="text-gray-600">
          Items per {{ options.transpose ? 'row' : 'column' }}; <br />
          blank = squarish
        </label>
      </div>
    </div>

    <div class="flex w-1/3 xs:w-full min-w-[150px] my-2 flex-col xs:flex-row items-center justify-center">
      <a
        :href="imageURL"
        download="inventory.png"
        class="inline-flex text-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        Download<span class="hidden xs:inline">&nbsp;Image</span>
      </a>
    </div>
  </div>

  <tabs
    :options="{ useUrlFragment: false, defaultTabHash: 'grouping_tab' }"
    class="max-w-[1024px] m-auto"
    nav-class="tab-nav border-b-2 flex 2xl:px-32 flex-row mt-4 mb-2 md:items-stretch items-center justify-around"
    nav-item-class="tabs-nav grow flex py-2"
    nav-item-link-class="tabs-tab-nav flex w-full justify-center text-center"
    nav-item-active-class="tab-is-active bg-gray-200"
    nav-item-disabled-class="bg-red"
    panels-wrapper-class="min-h-[400px] tabs-panels"
  >
    <tab id="options_tab" name="Options" class="mb-4 flex flex-col items-center justify-start Aspects ordering" :selected="true">

      <div class="flex w-full justify-center items-center flex-col xs:flex-row">
        <div class="flex flex-wrap md:w-2/3 justify-around">
          <div class="flex flex-col w-52 justify-start">
            <check-option id="transpose"   class="w-full mb-1" :checked="options.transpose" @change="updateTranspose">Swap Rows / Columns</check-option>
            <check-option id="smushStoned" class="w-full"      :checked="options.smushStoned" @change="updateSmushStoned">Combine Similar Artifacts</check-option>
          </div>
          <div class="flex flex-col items-start justify-start">
            <check-option id="sillySizes" class="w-full mb-1" :checked="options.sillySizes" @change="updateSillySizes">Allow Silly Sizes</check-option>
            <check-option id="showTicks"  class="w-full " :checked="options.showTicks" @change="updateShowTicks">Show Tickmarks</check-option>
          </div>
        </div>
        <div class="flex flex-row md:w-2/5 flex-wrap ml-2 items-center justify-between">
          <reset-button class="              w-[7rem]" @click="resetAllMaybe">Reset {{ bookmarkProps['ArA']?.label }}</reset-button>
          <reset-button class="bg-purple-200 w-[7rem]" @click="() => randomizeAxis('aspects')">I Feel Lucky!</reset-button>
        </div>
      </div>

      <div class="flex flex-col py-4 justify-center itens-center">
        <div class="flex flex-col justify-start m-auto">

          <div class="flex flex-col md:flex-row items-center py-2">
            <copy-button :content="dna" tooltip="Copy DNA to clipboard" class="order-last md:order-first">
              <span >Copy DNA:</span>
            </copy-button>
            <dna-box class="bg-blue-100">{{ dna }}</dna-box>
          </div>

          <div class="flex flex-col md:flex-row items-center">
            <icon-button
              class="w-40 justify-center order-last md:order-first"
              @click="() => adoptNewDNA({ dna: injectableDNA })"
              :disabled="(! canLoadDNA(injectableDNA))"
              type="submit"
            >
              <replace-icon class="w-6 h-6 mr-1" />
              <span v-if="injectableDNA && (injectableDNA !== dna) && (! canLoadDNA(injectableDNA))">
                (invalid DNA)
              </span>
              <span v-else-if="(! injectableDNA) || (injectableDNA === dna)">Paste <i>New</i> DNA:</span>
              <span v-else>Replace Current</span>
            </icon-button>
            <div
              v-if="dnaLoadMsg"
              class="text-xs font-mono p-2 my-2 md:ml-2 bg-green-50 w-[16rem] xs:w-[24rem] sm:w-[30rem] text-center"
            >
              {{ dnaLoadMsg }}&nbsp;
            </div>
            <input v-else
              id="dna-in"
              name="DNA"
              class="text-xs font-mono p-2 my-2 md:ml-2 bg-violet-50 w-[16rem] xs:w-[24rem] sm:w-[30rem] text-center"
              :value="injectableDNA"
              @input="updateInjectableDNA(($event.target as any).value)"
              @keyup.enter="() => adoptNewDNA({ dna: injectableDNA })"
            />
          </div>

          <template v-for="[id, dnaN] of Object.entries(savedDNA)" :key="id">
            <div class="flex py-2 md:flex-nowrap flex-wrap md:flex-row items-center justify-center contents-between">
              <input
                :id="`${id}-name`"
                :name="id"
                class="p-2 text-sm w-[16rem] xs:w-[24rem] sm:w-64 md:w-40 order-3 md:order-first bg-violet-50"
                :value="slotNames[id]"
                @input="updateSlotName(id, ($event.target as any).value)"
              />
              <dna-box class="bg-amber-50 order-2">{{ dnaN }}</dna-box>
              <div class="flex order-5 mt-2 sm:mt-0">
                <icon-button
                  class="w-24 md:w-20 mx-4 xs:mx-8 sm:mx-4 md:mx-2"
                  @click="() => adoptNewDNA({ dna: dnaN })"
                  :disabled="(! canLoadDNA(dnaN)) || (dnaN === dna)"
                >
                <replace-icon class="w-6 h-6 mr-1" />
                <span v-if="dnaN === dna">Current</span>
                <span v-else>Load</span>
              </icon-button>
              <icon-button class="w-24 md:w-20 mx-4 xs:mx-8 sm:mx-0"
                :disabled="dnaN === dna"
                @click="() => saveCurrDNA(id, dnaN)">
                <bookmark-icon class="w-6 h-6 mr-1" />
                <span>Save</span>
              </icon-button>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div>
        <p class="mt-2 sm:max-w-[320px] w-full text-left text-sm text-gray-500">
          If the download button doesn't work, you may also right click / long press on the image
          above to use your browser's image saving function.
        </p>
      </div>
    </tab>

    <tab
      id="grouping_tab"
      name="Groups"
      class="p-2 mb-4 flex flex-col items-start justify-around Aspects ordering"
      :selected="false"
    >

      <div class="flex flex-row w-full items-start justify-around">

        <div class="flex w-full items-center justify-center flex-col">
          <h3 class="hidden md:flex mb-2 font-bold m-2 text-center">Groups</h3>
          <drag-orderer item-classes="w-60" :layout-order="selaspects" group="aspects" direction="vert" @update-order="updateAspectsLayout">
            <template #listItem="{element}">
              <div class="h-7 w-7 relative rounded-full isolate bg-epic">
                <img v-if="element.rarity" class="absolute h-9 w-8 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" :src="`https://eggincassets.tcl.sh/256/egginc-extras/glow/${element.rarity}-13.png`" />
                <img v-if="element.img" class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
                <span v-else class="absolute p-1 z-10 text-xl">{{ element.glyph }}</span>
              </div>
              <span class="m-1">{{ element?.name }}</span>
            </template>
          </drag-orderer>
          <reset-button @click="() => resetAxis('aspects')">Reset Sorting</reset-button>
          <reset-button class="bg-purple-200" @click="() => randomizeAxis('aspects')">I Feel Lucky!</reset-button>
          <div class="flex w-full justify-center items-center">
            <check-option id="fancy" class="mt-2 mr-4" :checked="options.fancy" @change="updateFancy">Fancy Groupings</check-option>
          </div>
        </div>

        <div class="hidden md:flex w-full mx-2 items-center content-center justify-center flex-col">
          <h3 class="mb-2 font-bold m-2 text-center">Artifact Ordering</h3>
          <drag-orderer item-classes="w-60 max-h-10 mb-0.5 items-center" group="artifacts" :layout-order="artifacts" direction="vert" @update-order="updateArtifactsLayout">
            <template #listItem="{element}">
              <div class="h-6 w-6 mx-0.5 relative rounded-full isolate">
                <img class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
              </div>
              <span class="ml-1">{{ element?.name }}</span>
            </template>
          </drag-orderer>
          <reset-button @click="() => resetAxis('artifacts')">Reset Artifacts</reset-button>
        </div>

        <div class="hidden md:flex w-full items-center justify-center flex-col">
          <h3 class="mb-2 font-bold m-2 text-center">Stones Ordering</h3>
          <drag-orderer item-classes="w-60 stone" :layout-order="stones" group="stones" direction="vert" @update-order="updateStonesLayout">
            <template #listItem="{element}">
              <div class="h-8 w-8 relative isolate">
                <img class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
              </div>
              <span class="m-1">{{ element?.name }}</span>
            </template>
          </drag-orderer>
          <div class="h-full flex flex-col justify-end">
            <reset-button @click="() => resetAxis('stones')">Reset Stones</reset-button>
          </div>
        </div>
      </div>

      <how-this-works :options="options" :artifacts="artifacts" :aspects="aspects" :selaspects="selaspects" :stones="stones" />

    </tab>

    <tab id="artifact_tab" name="Artifacts" class="p-2 mb-4 flex flex-col items-center Artifacts ordering">
      <drag-orderer item-classes="w-60 max-h-10 mb-1 items-center" group="artifacts" :layout-order="artifacts" direction="vert" @update-order="updateArtifactsLayout">
        <template #listItem="{element}">
          <div class="h-7 w-7 relative rounded-full isolate">
            <img class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
          </div>
          <span class="m-1 ml-1.5">{{ element?.name }}</span>
        </template>
      </drag-orderer>
      <reset-button @click="() => resetAxis('artifacts')">Reset Artifacts</reset-button>
    </tab>

    <tab id="stone_tab" name="Stones" class="p-2 mb-4 flex flex-col items-center Stones ordering">
      <drag-orderer item-classes="w-60 stone" :layout-order="stones" group="stones" direction="vert" @update-order="updateStonesLayout">
        <template #listItem="{element}">
          <div class="h-8 w-8 relative isolate">
            <img class="absolute top-0 left-0 h-full w-full z-10" :src="element.img" />
          </div>
          <span class="m-1">{{ element?.name }}</span>
        </template>
      </drag-orderer>
      <div class="h-full flex flex-col justify-end">
        <reset-button @click="() => resetAxis('stones')">Reset Stones</reset-button>
      </div>
    </tab>

    <tab id="huh_tab" name="Wha? 🤔" class="p-2 mb-4 flex flex-col items-center Stones ordering">
      <how-this-works :options="options" :artifacts="artifacts" :aspects="aspects" :selaspects="selaspects" :stones="stones" />
    </tab>

  </tabs>

</template>

<script lang="ts">
import _ from 'lodash'
import { defineComponent } from 'vue';
import {
  Inventory, requestFirstContact, UserBackupEmptyError,
} from 'lib';
import {
  defaultAxisOrder, Orderables, BOOKMARK_PROPS, DEFAULT_BOOKMARK,
  dnaStr, vivifyDNA, resetAxis, DnaStr, Bookmarker,
  loadSavedDNA, validateDNA, saveDNA, defaultDNA,
  storeSlotNames, loadSlotNames, SlotProps,
  VisualizerConfigAxis, LayoutAxis, PlayerDataOptions,
} from '@/lib'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {Tabs, Tab} from 'vue3-tabs-component'

import InventoryCanvas from '@/components/InventoryCanvas.vue';
import DragOrderer     from '@/components/DragOrderer.vue';
import ResetButton     from '@/components/ResetButton.vue';
import CheckOption     from '@/components/CheckOption.vue'
import CopyButton      from '@/components/CopyButton.vue'
import HowThisWorks    from '@/components/HowThisWorks.vue'
import DnaBox          from '@/components/DnaBox.vue'
import IconButton      from '@/components/IconButton.vue'
import {
  SaveIcon, InformationCircleIcon as HelpIcon,
  ArrowCircleRightIcon as ReplaceIcon,
  BookmarkIcon,
} from "@heroicons/vue/outline"

async function fetchArtifactsDb(playerId: string) {
  const userinfo = await requestFirstContact(playerId);
  if (!userinfo.backup || !userinfo.backup.game) {
    throw new UserBackupEmptyError(playerId);
  }
  const backup = userinfo.backup;
  if (!backup.settings) {
    throw new Error(`${playerId}: settings not found in backup`);
  }
  const artifactsDb = backup.artifactsDb;
  if (!artifactsDb) {
    throw new Error(`${playerId}: no artifacts database in backup`);
  }
  return artifactsDb
}

const ALWAYS_GRAIN = 2
const FANCY_GRAIN  = 3

interface LayoutOrderableComponent {
  artifacts: Orderables, aspects: Orderables, stones: Orderables,
}

function randomizeAxis(comp: LayoutOrderableComponent, axis: LayoutAxis) {
  const shuff1 = _.shuffle(_.values(_.groupBy(defaultAxisOrder(axis), 'area')))
  const shuff2 = _.flatten(_.map(shuff1, _.shuffle))
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const newOrder = _.mapKeys(_.map(shuff2, (ob, idx) => ({ ...ob, weight: idx + 1 })), 'id')
  comp[axis] = newOrder
}

function selectAspects(aspects: Orderables, options: PlayerDataOptions) {
  return _.pickBy(aspects, ({ grain }) => {
    if (grain === ALWAYS_GRAIN) { return true }
    if (grain === FANCY_GRAIN) { return (options.fancy) }
    return (! options.fancy)
  })
}

export default defineComponent({
  components: {
    BookmarkIcon, CheckOption, CopyButton, DnaBox, DragOrderer,
    HowThisWorks, IconButton, InventoryCanvas, ReplaceIcon,
    ResetButton, SaveIcon, Tab, Tabs,
  },
  props: {
    playerId:   { type: String, required: true },
    urldna:     { type: String, required: false, default: '' },
    bookmark:   { type: String, required: false, default: DEFAULT_BOOKMARK },
  },
  emits: ['dnaChange', 'adoptNewDNA', 'bookmarkChange'],
  data() {
    // I don't know how to make ts happy most of the time
    const inventory: any = null // eslint-disable-line @typescript-eslint/no-explicit-any
    const savedDNA  = loadSavedDNA()
    const res       = vivifyDNA(this.urldna)
    const artifacts = res.artifacts
    const aspects   = res.aspects
    const stones    = res.stones
    const options   = res.options
    const vivified  = res
    const injectableDNA = '' // this.dnaStr()
    const slotNames = loadSlotNames()
    return {
      inventory,
      loaded:           false,
      artifacts,
      aspects,
      stones,
      options,
      console,
      bookmarkProps:    BOOKMARK_PROPS,
      slotNames,
      injectableDNA,
      vivified:          {},
      dnaLoadMsg:       '',
      savedDNA,
      imageURL:         '',
      loading:          true,
      _, // eslint-disable-line vue/no-reserved-keys
    }
  },

  computed: {
    selaspects()    { return selectAspects(this.aspects, this.options) },
    dna() {
      return this.dnaStr()
    },
    clampedPerCol() {
      const clampedPerCol = Number(this.options.perCol)
      if (clampedPerCol > 0) {
        if (this.options.sillySizes) { return String(clampedPerCol) }
        return String(_.clamp(clampedPerCol, 1, 100))
      }
      return ''
    }
  },

  async mounted() {
    await this.fetchArtifactsDb()
  },

  methods: {
    updateShowTicks(event: Event) {
      this.options.showTicks = (<HTMLInputElement>event.target)?.checked || false
    },
    updateSillySizes(event: Event) {
      this.options.sillySizes = (<HTMLInputElement>event.target)?.checked || false
    },
    updateTranspose(event: Event) {
      this.options.transpose = (<HTMLInputElement>event.target)?.checked || false
    },
    updateSmushStoned(event: Event) {
      this.options.smushStoned = (<HTMLInputElement>event.target)?.checked || false
    },
    updateFancy(event: Event) {
      this.options.fancy = (<HTMLInputElement>event.target)?.checked || false
      this.aspects = { ...this.aspects }
    },
    updateAspectsLayout(orderables: Orderables) {
      const full = defaultAxisOrder('aspects')
      const aspects = _.mapValues(full, (aspect) => {
        const weight = orderables[aspect.id]?.weight || (100 + aspect.weight)
        return { ...aspect, weight }
      })
      this.aspects = aspects
    },
    updateArtifactsLayout(orderables: Orderables) {
      this.artifacts = orderables
    },
    //
    updateStonesLayout(orderables: Orderables) {
      this.stones = orderables
    },
    //
    resetAllMaybe() {
      if (confirm('are you sure?')) {
        this.adoptNewDNA({ dna: defaultDNA() })
      }
    },
    randomizeAxis(axis: LayoutAxis) { randomizeAxis(this, axis) },
    resetAxis(axis: LayoutAxis) { resetAxis(this, axis) },
    handleBookmarkChange(ev: Event) {
      const bookmark: Bookmarker = ((<HTMLInputElement>ev?.target)?.value || DEFAULT_BOOKMARK) as Bookmarker
      this.$emit('bookmarkChange', bookmark)
    },
    async fetchArtifactsDb() {
      const artifactsDb = await fetchArtifactsDb(this.playerId)
      this.inventory    = new Inventory(artifactsDb) // eslint-disable-line @typescript-eslint/no-explicit-any
      this.loaded       = true
    },
    updateSlotName(id: string, name: string) {
      this.slotNames[id as Bookmarker] = name
      storeSlotNames(this.slotNames)
    },
    updateInjectableDNA(valIn: string) {
      const val = String(valIn).replace(/\W+/g, '').slice(0, 80)
      this.injectableDNA = val
    },
    canLoadDNA(val: DnaStr) {
      return (val !== this.dna) && validateDNA(val)
    },
    adoptNewDNA(info: { dna: DnaStr }) {
      this.$emit('adoptNewDNA', info)
    },
    injectDNA(injectableDNA: string) {
      try {
        const res      = vivifyDNA(injectableDNA)
        this.options   = res.options
        this.artifacts = res.artifacts
        this.aspects   = res.aspects
        this.stones    = res.stones
        this.vivified  = res
        this.injectableDNA = '' // this.dnaStr()
        this.dnaLoadMsg = "New DNA loaded!"
      } catch (err) {
        console.error(err)
        this.dnaLoadMsg = "Could not load DNA, sorry!"
      } finally {
        setTimeout(() => { this.dnaLoadMsg = '' }, 5000)
      }
    },
    saveCurrDNA(toBookmark: Bookmarker | string, old: DnaStr) {
      const effYouTS = toBookmark as Bookmarker // it isn't tracing the type through the v-for
      this.injectableDNA = old
      const result = saveDNA(this.dna, effYouTS)
      this.savedDNA[effYouTS] = this.dna
    },
    dnaStr() {
      return dnaStr(this.options, { artifacts: this.artifacts, aspects: this.aspects, stones: this.stones })
    },
  },

  watch: {
    dna(val, old) {
      this.$emit('dnaChange', { dna: this.dna })
    },
    urldna(val, old) {
      if (validateDNA(val) && (val !== this.dna)) {
        this.injectDNA(val)
      }
    },
  },
})
// Axoemfqstklrynibgzadpv_Gerlciagnzvsfxuyot_Sdcplsqxthu_Otf_P12
// Atoemfqscklrynibguadpv_Gerlciagnzvsfxuyot_Sdcplsqxthu_Otf_P
</script>
<style>
  .DragOrderer li.byLegendary  { background: #FFFFC4; }
  .DragOrderer li.byEpic       { background: #F7DAF7; }
  .DragOrderer li.byRare       { background: #C0FFFF; }
  .DragOrderer li.byRarity     { background: #E3FCF8; }
  .DragOrderer li.byNonLegend  { background: #E3FCF8; }
  .DragOrderer li.byUncommon   { background: #E3FCF8; }
  .DragOrderer li.byCommonArt  { background: #E9E9E9; }
  .DragOrderer li.byArtifact   { background: #E3FCF8; }
  .DragOrderer li.byFamily     { background: #EAF7D9; }
  .DragOrderer li.byType       { background: #E9E9E9; }
  .DragOrderer li.byLevel      { background: #F7F7D9; }
  .DragOrderer li.byStoning    { background: #F3ECE8; }
  .DragOrderer li.byStoningLvl { background: #F3ECE8; }
  .DragOrderer li.byStone      { background: #F2F7ED; }
  .DragOrderer li.byFragment   { background: #F2F7ED; }
  .DragOrderer li.byAnyStone   { background: #F2F7ED; }
  .DragOrderer li.byIngredient { background: #F2F7ED; }
  .DragOrderer li.byRarity     { background: #E3FCF8; }
  .DragOrderer .stone          { background: #F2F7ED; }
  .Artifacts li                { background: #E9E9E9; }
  .ordering  h4                { margin-bottom: 0.25rem; }

  img.GlowingEffect {
    height: 140%;
    width: 140%;
  }

</style>
