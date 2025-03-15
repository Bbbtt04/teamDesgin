import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:leaf',
      order: 10,
      title: $t('page.field.title'),
    },
    name: 'Field',
    path: '/field',
    children: [
      {
        name: 'FieldManagement',
        path: '/field/management',
        component: () => import('#/views/field/management/index.vue'),
        meta: {
          icon: 'lucide:trees',
          title: $t('page.field.management'),
        },
      },
      {
        name: 'FieldDetail',
        path: '/field/detail/:id',
        component: () => import('#/views/field/detail/index.vue'),
        meta: {
          icon: 'lucide:microscope',
          title: $t('page.field.detail'),
          hideInMenu: true,
        },
      },
    ],
  },
];

export default routes;
