import { nextTick } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';

import Home from '@/views/Home.vue';
import Contact from '@/views/Contact.vue';
import Donate from '@/views/Donate.vue';
import PrivacyPolicy from '@/views/PrivacyPolicy.vue';
import DevMode from '@/views/DevMode.vue';

declare module 'vue-router' {
  interface RouteMeta {
    title: string;
  }
}

// Always restore scroll position on home.
let homeScrollY = 0;

const router = createRouter({
  routes: [
    {
      name: 'home',
      path: '/',
      component: Home,
      meta: {
        title: "@mrflip's fork of @mk2's public utilities for Egg, Inc.",
      },
    },
    {
      name: 'contact',
      path: '/contact',
      component: Contact,
      meta: {
        title: 'Contact',
      },
    },
    {
      name: 'donate',
      path: '/donate',
      component: Donate,
      meta: {
        title: 'Donate',
      },
    },
    {
      name: 'privacy',
      path: '/privacy',
      component: PrivacyPolicy,
      meta: {
        title: 'Privacy policy',
      },
    },
    {
      name: 'devmode',
      path: '/devmode',
      component: DevMode,
      meta: {
        title: 'Dev mode',
      },
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/',
    },
  ],
  history: createWebHashHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (from.name === 'home') {
      homeScrollY = window.scrollY;
    }
    if (savedPosition) {
      return savedPosition;
    }
    if (to.name === 'home') {
      return { top: homeScrollY };
    }
    return { top: 0 };
  },
});

router.afterEach((to, from, failure) => {
  if (!failure) {
    nextTick(() => {
      document.title = to.meta.title;
    });
  }
});

export default router;
