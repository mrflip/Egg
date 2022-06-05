import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

import PlayerData from '@/components/PlayerData.vue';

const routes: RouteRecordRaw[] = [
  {
    name: 'player-data',
    path: '/i/:dna?',
    component: PlayerData,
    props: true,
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/i/',
  },
];

const router = createRouter({
  routes,
  history: createWebHashHistory(),
});

export default router;
