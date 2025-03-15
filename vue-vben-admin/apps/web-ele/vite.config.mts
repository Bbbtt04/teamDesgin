import { defineConfig } from '@vben/vite-config';

import ElementPlus from 'unplugin-element-plus/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import AutoImport from 'unplugin-auto-import/vite';

export default defineConfig(async () => {
  return {
    application: {},
    vite: {
      plugins: [
        ElementPlus({
          format: 'esm',
        }),
        Components({
          resolvers: [ElementPlusResolver()],
          dts: 'src/components.d.ts',
        }),
        // 自动导入 Element Plus 相关 API
        AutoImport({
          resolvers: [ElementPlusResolver()],
          imports: ['vue', 'vue-router'],
          dts: 'src/auto-imports.d.ts',
        }),
      ],
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            target: 'http://localhost:5320/api',
            ws: true,
          },
        },
      },
    },
  };
});
