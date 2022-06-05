<template>
  <h1 class="mx-4 mt-4 mb-2 text-center text-lg leading-6 font-medium text-gray-900">
    Inventory visualizer
  </h1>

  <code>{{ params }}</code>
  <code>urldna {{ urldna }}</code>

  <div v-if="!assetsLoaded && assetLoadingError === null" class="app-loading">
    Loading requisite assets...
  </div>

  <div v-else-if="assetLoadingError !== null">
    <p class="max-w-lg mx-auto text-center text-base text-red-500 mt-4">{{ assetLoadingError }}</p>
    <p class="max-w-lg mx-auto text-center text-base">Maybe try refreshing the page.</p>
  </div>

  <div v-else class="max-w-5xl 2xl:max-w-7xl w-full px-4 pb-6 xl:px-0 mx-auto">
    <the-player-id-form :player-id="playerId" @submit="submitPlayerId" />

    <base-error-boundary v-if="playerId" :key="`${playerId}:${refreshId}`">
      <div
        class="w-max max-w-full px-3 py-2 text-center text-xs text-green-800 bg-green-50 rounded-md shadow-sm mx-auto my-4"
      >
        Get detailed mission and inventory stats at
        <a
          :href="`/rockets-tracker/?playerId=${playerId}`"
          target="_blank"
          class="text-green-700 hover:text-green-900 underline"
          >Rockets tracker</a
        >.
      </div>

      <suspense>
        <template #default>
          <player-data
            :player-id="playerId"
            @dna-change="updateURL"
            :urldna="urldna"
          />
        </template>
        <template #fallback>
          <base-loading />
        </template>
      </suspense>
    </base-error-boundary>

    <template v-else>
      <div class="text-sm mt-4 mx-4 2xl:mx-0">
        This tool generates one single image of your artifact inventory; say goodbye to stitching
        together pages after pages of screenshots.
      </div>
    </template>
  </div>
  <div class="h-[200px] flex flex-col items-center justify-end"><span class="flex">v:2022-6-04-b</span></div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, toRefs, watch } from 'vue';
import { onBeforeRouteUpdate, useRouter, RouteLocationNormalized } from 'vue-router';
import CryptoJS from 'crypto-js'

import { getSavedPlayerID, savePlayerID } from 'lib';
import { loadAllIcons } from '@/lib';

import BaseErrorBoundary from 'ui/components/BaseErrorBoundary.vue';
import BaseLoading from 'ui/components/BaseLoading.vue';
import ThePlayerIdForm from 'ui/components/PlayerIdForm.vue';
import PlayerData from '@/components/PlayerData.vue';

// const UrlSafeBase64 = { // aka RFC4648
//   parse(str: string) {
//     const b64 = str.replaceAll(/-/g, '+').replaceAll(/_/g, '/')
//     return CryptoJS.enc.Base64.parse(b64)
//   },
//   stringify(wordarr: any) {
//     const b64 = CryptoJS.enc.Base64.stringify(wordarr)
//     return b64.replace(/=+$/, '').replaceAll(/\+/g, '-').replaceAll(/\//g, '_')
//   },
// }

export default defineComponent({
  components: { BaseErrorBoundary, BaseLoading, ThePlayerIdForm, PlayerData },
  props: {
    urldna: { type: String as PropType<string | undefined>,  default: undefined },
  },
  data() {
    const assetLoadingError: (Error | null) = null as (Error | null)
    const playerId  = new URLSearchParams(window.location.search).get('playerId') || getSavedPlayerID() || ''
    const refreshId = Date.now()
    return {
      assetsLoaded: false,
      assetLoadingError,
      playerId,
      refreshId,
      // @ts-ignore
      params:   this.$route.params,
    }
  },

  async beforeRouteUpdate(newRoute: RouteLocationNormalized) {
    //          this.params = { newParams, oldParams }
    // this.params = { newParams: newRoute.params, old: oldRoute.params }
    const { urldna } = newRoute.params
    console.log(urldna, this.urldna)
    return true
  },

  computed: {
    // playerIdMash() {
    //   const mashC  = CryptoJS.AES.encrypt(this.playerId, "Secret Passphrase")
    //   const mash = mashC.ciphertext.toString(UrlSafeBase64)
    //   window.CryptoJS = CryptoJS
    //   return { mash, l1: mash.length, l4: this.playerId.length }
    // },
  },

  async mounted() {
    try {
      await loadAllIcons()
      this.assetsLoaded = true
    } catch (err) {
      this.assetLoadingError = (err instanceof Error) ? err : new Error(`${err}`)
    }
  },

  methods: {
    submitPlayerId(id: string) {
      this.playerId = id;
      this.refreshId = Date.now();
      savePlayerID(id);
    },
    updateURL(ev: { dna: string }) {
      if (! ev.dna) { return }
      // @ts-ignore
      this.$router.replace({ name: 'visualizer', params: { urldna: ev.dna } })

    },
  },

})
</script>
