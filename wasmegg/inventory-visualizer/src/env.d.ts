/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// declare module "*.vue" {
//   import Vue from 'vue';
//   export default Vue;
// }

// declare module 'vue/types/vue' {
//   interface Vue {
//     $router: VueRouter
//     $route:  VueRouter.Route
//   }
// }
