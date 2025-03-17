import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/system',
    name: 'System',
    meta: {
      title: '系统管理',
      icon: 'ep:setting',
      order: 100,
    },
    children: [
      {
        path: '/system/role',
        name: 'SystemRole',
        component: () => import('#/views/system/role/index.vue'),
        meta: {
          title: '权限管理',
          icon: 'ep:user-filled',
        },
      },
    ],
  },
];

export default routes;
