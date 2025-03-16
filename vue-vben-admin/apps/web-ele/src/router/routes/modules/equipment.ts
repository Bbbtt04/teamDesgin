import type { RouteRecordRaw } from 'vue-router';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ep:monitor',
      order: 20,
      title: $t('page.equipment.title'),
    },
    name: 'Equipment',
    path: '/equipment',
    children: [
      {
        name: 'EquipmentManagement',
        path: '/equipment/management',
        component: () => import('#/views/equipment/index.vue'),
        meta: {
          icon: 'ep:list',
          title: $t('page.equipment.management'),
        },
      },
      {
        name: 'EquipmentDetail',
        path: '/equipment/detail/:id',
        component: () => import('#/views/equipment/detail/index.vue'),
        meta: {
          icon: 'ep:document',
          title: $t('page.equipment.detail'),
          hideInMenu: true,
        },
      },
    ],
  },
];

export default routes;
  // {
      //   name: 'EquipmentStatistics',
      //   path: '/equipment/statistics',
      //   component: () => import('#/views/equipment/statistics/index.vue'),
      //   meta: {
      //     icon: 'ep:data-line',
      //     title: $t('page.equipment.statistics'),
      //     hideInMenu: false,
      //   },
