import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'FarmDashboard',
    path: '/farm-dashboard',
    component: () => import('#/views/dashboard/farm/index.vue'),
    meta: {
      icon: 'lucide:sprout',
      title: $t('page.dashboard.farm'),
      order: 2,
    },
  },
  {
    name: 'Workspace',
    path: '/workspace',
    component: () => import('#/views/dashboard/workspace/index.vue'),
    meta: {
      icon: 'carbon:workspace',
      title: $t('page.dashboard.workspace'),
      order: 1,
    },
  },
];

export default routes;
