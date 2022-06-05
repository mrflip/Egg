import {
  createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw
} from 'vue-router';

import Visualizer from '@/views/Visualizer.vue';

console.log(createWebHistory === createWebHashHistory)
// const BASE_ROUTE = '/inventory-visualizer/v/'
const BASE_ROUTE = '/v/'

const routes: RouteRecordRaw[] = [
  {
    name: 'visualizer',
    path: BASE_ROUTE + ':urldna?',
    component: Visualizer,
    props: true,
  },
  {
    path: '/:catchAll(.*)',
    redirect: BASE_ROUTE,
  },
];

const router = createRouter({
  routes,
  // history: createWebHistory(),
  history: createWebHashHistory(),
});

export default router;
