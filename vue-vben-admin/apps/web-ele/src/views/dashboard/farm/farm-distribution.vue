<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderEcharts({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      bottom: 0,
      left: 'center',
      data: ['华东地区', '华南地区', '华北地区', '西南地区', '西北地区', '东北地区', '中部地区']
    },
    series: [
      {
        name: '农场分布',
        type: 'pie',
        radius: '60%',
        center: ['50%', '45%'],
        data: [
          { value: 85, name: '华东地区' },
          { value: 72, name: '华南地区' },
          { value: 65, name: '华北地区' },
          { value: 48, name: '西南地区' },
          { value: 32, name: '西北地区' },
          { value: 28, name: '东北地区' },
          { value: 26, name: '中部地区' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b}: {c}'
        },
        labelLine: {
          show: true
        }
      }
    ]
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
