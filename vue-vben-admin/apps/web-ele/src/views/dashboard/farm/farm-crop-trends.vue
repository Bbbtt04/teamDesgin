<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderEcharts({
    grid: {
      bottom: 0,
      containLabel: true,
      left: '1%',
      right: '1%',
      top: '2 %',
    },
    legend: {
      bottom: 0,
      data: ['水稻', '小麦', '玉米', '蔬菜'],
    },
    series: [
      {
        areaStyle: {},
        data: [
          15, 22, 35, 48, 62, 75, 85, 92, 95, 89, 78, 65
        ],
        itemStyle: {
          color: '#5ab1ef',
        },
        name: '水稻',
        smooth: true,
        type: 'line',
      },
      {
        areaStyle: {},
        data: [
          10, 18, 28, 40, 55, 70, 80, 88, 85, 75, 60, 45
        ],
        itemStyle: {
          color: '#019680',
        },
        name: '小麦',
        smooth: true,
        type: 'line',
      },
      {
        areaStyle: {},
        data: [
          5, 12, 25, 42, 60, 72, 82, 90, 86, 72, 55, 35
        ],
        itemStyle: {
          color: '#f7b851',
        },
        name: '玉米',
        smooth: true,
        type: 'line',
      },
      {
        areaStyle: {},
        data: [
          8, 20, 38, 55, 68, 78, 83, 80, 72, 58, 42, 30
        ],
        itemStyle: {
          color: '#e46cbb',
        },
        name: '蔬菜',
        smooth: true,
        type: 'line',
      }
    ],
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: '#019680',
          width: 1,
        },
      },
      trigger: 'axis',
    },
    xAxis: {
      axisTick: {
        show: false,
      },
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      splitLine: {
        lineStyle: {
          type: 'solid',
          width: 1,
        },
        show: true,
      },
      type: 'category',
    },
    yAxis: [
      {
        axisTick: {
          show: false,
        },
        max: 100,
        name: '生长指数(%)',
        splitArea: {
          show: true,
        },
        splitNumber: 4,
        type: 'value',
      },
    ],
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
