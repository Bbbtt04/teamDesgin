import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/monitor',
    name: 'Monitor',
    component: () => import('#/views/equipment/statistics/index.vue'),
    meta: {
      title: '大田监控',
      icon: 'ep:monitor',
      // hideInMenu: true,
      noBasicLayout: true,
    },
  },
];

export default routes;
