import {
  createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw
} from 'vue-router';
import { defaultDNA, DEFAULT_BOOKMARK } from './lib/dna'

import Visualizer from '@/views/Visualizer.vue';

console.log(createWebHistory === createWebHashHistory)
// const BASE_ROUTE = '/inventory-visualizer/v/'
const BASE_ROUTE = '/v/'

const routes: RouteRecordRaw[] = [
  {
    name: 'visualizer',
    path: BASE_ROUTE + ':urldna?/:bookmark?',
    component: Visualizer,
    props: true,
  },
  {
    path: '/:catchAll(.*)',
    redirect: BASE_ROUTE + defaultDNA() + '/' + DEFAULT_BOOKMARK + '/',
  },
];

const router = createRouter({
  routes,
  // history: createWebHistory(),
  history: createWebHashHistory(),
});

export default router;
