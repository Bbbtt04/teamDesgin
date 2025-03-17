<script lang="ts" setup>
import type {
  WorkbenchProjectItem,
  WorkbenchQuickNavItem,
  WorkbenchTodoItem,
  WorkbenchTrendItem,
} from '@vben/common-ui';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import {
  WorkbenchHeader,
  WorkbenchQuickNav,
  WorkbenchTodo,
  WorkbenchTrends,
} from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

const userStore = useUserStore();

const quickNavItems: WorkbenchQuickNavItem[] = [
  {
    color: '#1fdaca',
    icon: 'ep:monitor',
    title: '监控大屏',
    url: '/monitor',
  },
  {
    color: '#3fb27f',
    icon: 'ep:cpu',
    title: '设备管理',
    url: '/equipment',
  },
  {
    color: '#e18525',
    icon: 'ep:map-location',
    title: '农田管理',
    url: '/field',
  },
  {
    color: '#4daf1bc9',
    icon: 'ep:data-analysis',
    title: '数据分析',
    url: '/farm-dashboard',
  },
  {
    color: '#bf0c2c',
    icon: 'ep:warning',
    title: '告警管理',
    url: '/alert',
  },
  {
    color: '#00d8ff',
    icon: 'ep:setting',
    title: '系统设置',
    url: '/system',
  },
];

const todoItems = ref<WorkbenchTodoItem[]>([
  {
    completed: false,
    content: `检查1号田块土壤湿度传感器数据异常情况，可能需要设备维护。`,
    date: '2024-07-30 11:00:00',
    title: '设备异常检查',
  },
  {
    completed: true,
    content: `完成2号田块自动灌溉系统的季度维护工作。`,
    date: '2024-07-30 11:00:00',
    title: '设备维护',
  },
  {
    completed: false,
    content: `查看3号田块温湿度数据，评估是否需要进行灌溉。`,
    date: '2024-07-30 11:00:00',
    title: '灌溉评估',
  },
  {
    completed: false,
    content: `检查气象站预警信息，准备防雨防风措施。`,
    date: '2024-07-30 11:00:00',
    title: '天气预警',
  },
  {
    completed: false,
    content: `更新设备巡检记录，完成月度设备状态报告。`,
    date: '2024-07-30 11:00:00',
    title: '设备巡检',
  },
]);
const trendItems: WorkbenchTrendItem[] = [
  {
    avatar: 'svg:avatar-1',
    content: `在 <a>1号田</a> 更换了 <a>土壤传感器</a>`,
    date: '刚刚',
    title: '张工',
  },
  {
    avatar: 'svg:avatar-2',
    content: `完成了 <a>2号田</a> 的灌溉系统维护`,
    date: '1个小时前',
    title: '李工',
  },
  {
    avatar: 'svg:avatar-3',
    content: `处理了 <a>3号田温度传感器</a> 告警`,
    date: '1天前',
    title: '王工',
  },
  {
    avatar: 'svg:avatar-4',
    content: `更新了 <a>气象站</a> 固件`,
    date: '2天前',
    title: '赵工',
  },
  {
    avatar: 'svg:avatar-1',
    content: `完成了 <a>4号田</a> 的设备巡检`,
    date: '3天前',
    title: '刘工',
  },
  {
    avatar: 'svg:avatar-2',
    content: `处理了 <a>自动灌溉系统</a> 故障`,
    date: '1周前',
    title: '孙工',
  },
  {
    avatar: 'svg:avatar-3',
    content: `更新了 <a>设备维护手册</a>`,
    date: '1周前',
    title: '技术部',
  },
];

const router = useRouter();

// 这是一个示例方法，实际项目中需要根据实际情况进行调整
// This is a sample method, adjust according to the actual project requirements
function navTo(nav: WorkbenchProjectItem | WorkbenchQuickNavItem) {
  if (nav.url?.startsWith('http')) {
    openWindow(nav.url);
    return;
  }
  if (nav.url?.startsWith('/')) {
    router.push(nav.url).catch((error) => {
      console.error('Navigation failed:', error);
    });
  } else {
    console.warn(`Unknown URL for navigation item: ${nav.title} -> ${nav.url}`);
  }
}
</script>

<template>
  <div class="p-5">
    <WorkbenchHeader
      :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
    >
      <template #title>
        您好, {{ userStore.userInfo?.realName }}, 欢迎使用智慧农业管理系统！
      </template>
      <template #description>
        今日天气：晴，温度：20℃ - 32℃，适合进行田间管理工作
      </template>
    </WorkbenchHeader>

    <div class="mt-5 flex flex-col lg:flex-row">
      <div class="mr-4 w-full lg:w-3/5">
        <WorkbenchTrends :items="trendItems" class="mt-5" title="农场动态" />
      </div>
      <div class="w-full lg:w-2/5">
        <WorkbenchQuickNav
          :items="quickNavItems"
          class="mt-5 lg:mt-0"
          title="快捷导航"
          @click="navTo"
        />
        <WorkbenchTodo :items="todoItems" class="mt-5" title="待办事项" />
        <!-- <AnalysisChartCard class="mt-5" title="访问来源">
          <AnalyticsVisitsSource />
        </AnalysisChartCard> -->
      </div>
    </div>
  </div>
</template>
