<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { TabOption } from '@vben/types';

import {
  AnalysisChartCard,
  AnalysisChartsTabs,
  AnalysisOverview,
} from '@vben/common-ui';
import {
  SvgBellIcon,
  SvgCakeIcon,
  SvgCardIcon,
  SvgDownloadIcon,
} from '@vben/icons';

// 导入子组件
import FarmCropTrends from './farm-crop-trends.vue';
import FarmEnvironmentMonitor from './farm-environment-monitor.vue';
import FarmWarningInfo from './farm-warning-info.vue';
import FarmDistribution from './farm-distribution.vue';
import FarmDeviceStatus from './farm-device-status.vue';

// 数据概览项
const overviewItems: AnalysisOverviewItem[] = [
  {
    icon: SvgCardIcon,
    title: '农场数量',
    totalTitle: '总农场数',
    totalValue: 356,
    value: 12,
  },
  {
    icon: SvgCakeIcon,
    title: '作物种类',
    totalTitle: '总作物种类',
    totalValue: 78,
    value: 5,
  },
  {
    icon: SvgDownloadIcon,
    title: '设备数量',
    totalTitle: '总设备数',
    totalValue: 1240,
    value: 38,
  },
  {
    icon: SvgBellIcon,
    title: '预警信息',
    totalTitle: '待处理预警',
    totalValue: 215,
    value: 24,
  },
];

// 图表选项卡
const chartTabs: TabOption[] = [
  {
    label: '作物生长趋势',
    value: 'cropTrends',
  },
  {
    label: '环境监测数据',
    value: 'environment',
  },
];
</script>

<template>
  <div class="p-5">
    <!-- 数据概览 -->
    <AnalysisOverview :items="overviewItems" />

    <!-- 图表选项卡 -->
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #cropTrends>
        <FarmCropTrends />
      </template>
      <template #environment>
        <FarmEnvironmentMonitor />
      </template>
    </AnalysisChartsTabs>

    <!-- 底部图表区域 -->
    <div class="mt-5 w-full md:flex">
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="预警信息">
        <FarmWarningInfo />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="农场分布">
        <FarmDistribution />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="设备状态">
        <FarmDeviceStatus />
      </AnalysisChartCard>
    </div>

    <!-- 快速导航 -->
    <div class="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
      <router-link to="/farm/management" class="rounded-lg bg-primary p-4 text-center text-white hover:bg-primary/90">
        农场管理
      </router-link>
      <router-link to="/crop/management" class="rounded-lg bg-primary p-4 text-center text-white hover:bg-primary/90">
        作物管理
      </router-link>
      <router-link to="/device/management" class="rounded-lg bg-primary p-4 text-center text-white hover:bg-primary/90">
        设备管理
      </router-link>
      <router-link to="/warning/center" class="rounded-lg bg-primary p-4 text-center text-white hover:bg-primary/90">
        预警中心
      </router-link>
    </div>
  </div>
</template>
