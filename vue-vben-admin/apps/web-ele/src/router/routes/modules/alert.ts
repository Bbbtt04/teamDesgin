import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:bell-ring',
      order: 16,
      title: $t('page.alert.title'),
    },
    name: 'Alert',
    path: '/alert',
    children: [
      {
        name: 'AlertManagement',
        path: '/alert',
        component: () => import('#/views/alert/index.vue'),
        meta: {
          icon: 'lucide:bell',
          title: $t('page.alert.management'),
        },
      },

    ],
  },
];

export default routes;
// {
//   name: 'AlertHistory',
//   path: '/alert/history',
//   component: () => import('#/views/alert/history/index.vue'),
//   meta: {
//     icon: 'lucide:history',
//     title: $t('page.alert.history'),
//   },
// },
// {
//   name: 'AlertSettings',
//   path: '/alert/settings',
//   component: () => import('#/views/alert/settings/index.vue'),
//   meta: {
//     icon: 'lucide:settings',
//     title: $t('page.alert.settings'),
//   },
// },
