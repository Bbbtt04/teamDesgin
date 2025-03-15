<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderEcharts({
    grid: {
      bottom: 30,
      containLabel: true,
      left: '3%',
      right: '3%',
      top: '5%',
    },
    legend: {
      bottom: 0,
      data: ['温度', '湿度', '光照', '二氧化碳'],
    },
    series: [
      {
        data: [
          14, 16, 20, 23, 26, 28, 32, 30, 26, 22, 18, 15
        ],
        itemStyle: {
          color: '#f56c6c',
        },
        name: '温度',
        smooth: true,
        type: 'line',
      },
      {
        data: [
          55, 60, 65, 70, 75, 80, 85, 80, 75, 70, 65, 60
        ],
        itemStyle: {
          color: '#409eff',
        },
        name: '湿度',
        smooth: true,
        type: 'line',
        yAxisIndex: 1,
      },
      {
        data: [
          2000, 5000, 8000, 12000, 16000, 18000, 20000, 18000, 15000, 10000, 6000, 3000
        ],
        itemStyle: {
          color: '#e6a23c',
        },
        name: '光照',
        smooth: true,
        type: 'line',
        yAxisIndex: 2,
      },
      {
        data: [
          400, 420, 450, 480, 500, 520, 550, 530, 500, 470, 440, 410
        ],
        itemStyle: {
          color: '#67c23a',
        },
        name: '二氧化碳',
        smooth: true,
        type: 'line',
        yAxisIndex: 3,
      }
    ],
    tooltip: {
      axisPointer: {
        type: 'cross',
      },
      trigger: 'axis',
    },
    xAxis: {
      axisTick: {
        show: false,
      },
      boundaryGap: false,
      data: ['6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '0:00', '2:00', '4:00'],
      type: 'category',
    },
    yAxis: [
      {
        axisTick: {
          show: false,
        },
        max: 40,
        min: 10,
        name: '温度(°C)',
        position: 'left',
        splitLine: {
          show: true,
        },
        type: 'value',
      },
      {
        axisTick: {
          show: false,
        },
        max: 100,
        min: 50,
        name: '湿度(%)',
        offset: 40,
        position: 'left',
        splitLine: {
          show: false,
        },
        type: 'value',
      },
      {
        axisTick: {
          show: false,
        },
        max: 25000,
        min: 1000,
        name: '光照(lux)',
        position: 'right',
        splitLine: {
          show: false,
        },
        type: 'value',
      },
      {
        axisTick: {
          show: false,
        },
        max: 600,
        min: 300,
        name: 'CO₂(ppm)',
        offset: 40,
        position: 'right',
        splitLine: {
          show: false,
        },
        type: 'value',
      }
    ],
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
