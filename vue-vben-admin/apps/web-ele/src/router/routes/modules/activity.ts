import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:calendar-days',
      order: 15,
      title: $t('page.activity.title'),
    },
    name: 'Activity',
    path: '/activity',
    children: [
      {
        name: 'ActivityManagement',
        path: '/activity',
        component: () => import('#/views/activity/index.vue'),
        meta: {
          icon: 'lucide:list-todo',
          title: $t('page.activity.management'),
        },
      },
      {
        name: 'ActivityDetail',
        path: '/activity/detail/:id',
        component: () => import('#/views/activity/detail/index.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: $t('page.activity.detail'),
          hideInMenu: true,
        },
      },
      {
        name: 'ActivityStatistics',
        path: '/activity/statistics',
        component: () => import('#/views/activity/statistics/index.vue'),
        meta: {
          icon: 'lucide:bar-chart-3',
          title: $t('page.activity.statistics'),
          hideInMenu: false,
        },
      },
    ],
  },
];

export default routes;
