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
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 0,
      left: 'center',
      data: ['正常运行', '离线设备', '故障设备', '待维护']
    },
    series: [
      {
        name: '设备状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 968, name: '正常运行', itemStyle: { color: '#67C23A' } },
          { value: 134, name: '离线设备', itemStyle: { color: '#909399' } },
          { value: 75, name: '故障设备', itemStyle: { color: '#F56C6C' } },
          { value: 63, name: '待维护', itemStyle: { color: '#E6A23C' } }
        ]
      }
    ]
  });
});

// 根据传感器类型分类数据
const sensorTypeData = ref([
  { type: '温度传感器', count: 320, healthy: 298 },
  { type: '湿度传感器', count: 280, healthy: 265 },
  { type: '光照传感器', count: 210, healthy: 195 },
  { type: '二氧化碳传感器', count: 180, healthy: 172 },
  { type: '灌溉设备', count: 150, healthy: 142 },
  { type: '气象站', count: 50, healthy: 48 },
  { type: '摄像设备', count: 50, healthy: 48 },
]);
</script>

<template>
  <div>
    <EchartsUI ref="chartRef" />
    <div class="mt-4 h-44 overflow-y-auto px-2">
      <div class="mb-2 flex items-center justify-between text-sm">
        <span class="font-medium">设备类型</span>
        <span class="font-medium">健康状态</span>
      </div>
      <div
        v-for="item in sensorTypeData"
        :key="item.type"
        class="mb-2 flex items-center justify-between border-b border-gray-100 pb-2 text-sm"
      >
        <span>{{ item.type }}</span>
        <div class="flex items-center">
          <div class="mr-2 h-2 w-24 rounded-full bg-gray-200">
            <div
              class="h-2 rounded-full bg-green-500"
              :style="{ width: `${(item.healthy / item.count) * 100}%` }"
            ></div>
          </div>
          <span>{{ item.healthy }}/{{ item.count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
