<script lang="ts" setup>
import { ref } from 'vue';

// 预警信息类型
type WarningLevel = 'high' | 'medium' | 'low';

interface WarningInfo {
  id: string;
  content: string;
  date: string;
  farmName: string;
  level: WarningLevel;
}

// 示例预警数据
const warningList = ref<WarningInfo[]>([
  {
    id: 'w001',
    content: '温室1号温度过高',
    date: '2023-10-12 08:23',
    farmName: '东湖农场',
    level: 'high',
  },
  {
    id: 'w002',
    content: '灌溉系统水压异常',
    date: '2023-10-12 07:15',
    farmName: '南山农场',
    level: 'medium',
  },
  {
    id: 'w003',
    content: '湿度传感器故障',
    date: '2023-10-12 06:45',
    farmName: '西岭农场',
    level: 'medium',
  },
  {
    id: 'w004',
    content: '检测到水稻区域疑似病虫害',
    date: '2023-10-11 21:30',
    farmName: '东湖农场',
    level: 'high',
  },
  {
    id: 'w005',
    content: '气象预警：明日可能有强降雨',
    date: '2023-10-11 18:20',
    farmName: '全局',
    level: 'medium',
  },
  {
    id: 'w006',
    content: '土壤养分低于正常值',
    date: '2023-10-11 16:10',
    farmName: '北郊农场',
    level: 'low',
  },
]);

// 获取预警级别对应的样式
const getLevelClass = (level: WarningLevel): string => {
  switch (level) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    default:
      return '';
  }
};

// 获取预警级别文本
const getLevelText = (level: WarningLevel): string => {
  switch (level) {
    case 'high':
      return '高';
    case 'medium':
      return '中';
    case 'low':
      return '低';
    default:
      return '';
  }
};
</script>

<template>
  <div class="h-80 overflow-y-auto">
    <div v-if="warningList.length === 0" class="flex h-full items-center justify-center">
      <p class="text-gray-500">暂无预警信息</p>
    </div>
    <ul v-else class="space-y-2">
      <li
        v-for="item in warningList"
        :key="item.id"
        class="rounded-md border border-gray-200 p-2 hover:bg-gray-50"
      >
        <div class="flex items-center justify-between">
          <span :class="getLevelClass(item.level)" class="rounded-full px-2 py-0.5 text-xs font-medium">
            {{ getLevelText(item.level) }}级
          </span>
          <span class="text-xs text-gray-500">{{ item.date }}</span>
        </div>
        <p class="mt-1 font-medium">{{ item.content }}</p>
        <p class="mt-1 text-sm text-gray-600">农场: {{ item.farmName }}</p>
      </li>
    </ul>
    <div class="mt-4 flex justify-center">
      <router-link to="/warning/center" class="text-sm text-primary hover:underline">
        查看全部预警
      </router-link>
    </div>
  </div>
</template>
