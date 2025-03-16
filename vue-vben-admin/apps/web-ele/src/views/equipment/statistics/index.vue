<template>
  <div class="monitor-container dark-bg">
    <!-- 顶部标题 -->
    <div class="monitor-header">
      <h1 class="main-title">大田作物智能化生产与高效管理系统</h1>
      <div class="header-right">
        <span class="time">{{ currentTime }}</span>
      </div>
    </div>

    <!-- 左侧数据 -->
    <div class="left-panel">
      <div class="data-card">
        <div class="card-title">设备总数</div>
        <div class="card-value">{{ statistics.totalCount }}</div>
        <div class="card-unit">台</div>
      </div>
      <div class="data-card">
        <div class="card-title">在线设备</div>
        <div class="card-value">{{ statistics.onlineCount }}</div>
        <div class="card-unit">台</div>
      </div>
      <div class="data-card">
        <div class="card-title">设备在线率</div>
        <div class="card-value">{{ formatPercent(statistics.onlineRate) }}</div>
        <div class="card-unit">%</div>
      </div>
      <div class="data-card">
        <div class="card-title">告警设备</div>
        <div class="card-value">{{ statistics.faultCount }}</div>
        <div class="card-unit">台</div>
      </div>
    </div>

    <!-- 中间地图 -->
    <div class="center-map">
      <div class="map-container">
        <div class="map-title">设备分布图</div>
        <div class="map-overlay">
          <div class="field-area" v-for="field in fields" :key="field.id" @click="handleFieldClick(field)">
            <div class="field-name">{{ field.name }}</div>
            <div class="field-stats">
              <span class="online">在线: {{ field.onlineCount }}</span>
              <span class="total">总数: {{ field.totalCount }}</span>
            </div>
            <div class="device-points">
              <div
                v-for="point in field.points"
                :key="point.id"
                class="device-point"
                :class="getStatusClass(point.status)"
                :style="{ top: point.y + '%', left: point.x + '%' }"
                @mouseenter="showDeviceInfo(point)"
                @mouseleave="hideDeviceInfo"
              >
                <div class="point-tooltip" v-if="activePoint === point.id">
                  <div>设备名称: {{ point.name }}</div>
                  <div>设备类型: {{ getDeviceTypeName(point.type) }}</div>
                  <div>状态: {{ getStatusText(point.status) }}</div>
                  <div>电量: {{ point.battery }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧面板 -->
    <div class="right-panel">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-title">设备类型分布</span>
        </div>
        <div class="stat-content">
          <el-progress
            v-for="(count, type) in statistics.byType"
            :key="type"
            :percentage="(count / statistics.totalCount) * 100"
            :color="getTypeColor(type)"
            :format="() => `${getDeviceTypeName(type)}: ${count}台`"
            :stroke-width="15"
          />
        </div>
      </div>

      <!-- 设备状态分布 -->
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">设备状态分布</span>
        </div>
        <div class="chart-content">
          <el-progress
            v-for="(count, status) in statistics.byStatus"
            :key="status"
            :percentage="(count / statistics.totalCount) * 100"
            :color="getStatusColor(status)"
            :format="() => `${getStatusText(status)}: ${count}台`"
            :stroke-width="15"
          />
        </div>
      </div>

      <!-- 电池状态统计 -->
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">电池状态统计</span>
        </div>
        <div class="chart-content">
          <el-progress
            v-for="(count, level) in statistics.batteryStats"
            :key="level"
            :percentage="(count / statistics.totalCount) * 100"
            :color="getBatteryColor(level)"
            :format="() => getBatteryLabel(level) + ': ' + count + '台'"
            :stroke-width="15"
          />
        </div>
      </div>
    </div>

    <!-- 底部面板 -->
    <div class="bottom-panel">
      <div class="bottom-card">
        <div class="card-header">实时告警</div>
        <el-table :data="alerts" style="width: 100%" size="small">
          <el-table-column prop="time" label="时间" width="160">
            <template #default="{ row }">{{ formatDateTime(row.time) }}</template>
          </el-table-column>
          <el-table-column prop="deviceName" label="设备名称" width="150" />
          <el-table-column prop="type" label="告警类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getAlertType(row.type)">{{ getAlertTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="message" label="告警信息" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { formatDateTime } from '#/utils/formatTime';
import { EquipmentType, EquipmentStatus } from '#/api/equipment/model';
import type { TagProps } from 'element-plus';

// 当前时间
const currentTime = ref(formatDateTime(new Date()));
const timer = setInterval(() => {
  currentTime.value = formatDateTime(new Date());
}, 1000);

onUnmounted(() => {
  clearInterval(timer);
});

// 统计数据
const statistics = ref({
  totalCount: 68,
  onlineCount: 45,
  faultCount: 5,
  onlineRate: 0.662,
  byType: {
    [EquipmentType.TEMP_HUMIDITY_SENSOR]: 20,
    [EquipmentType.SOIL_MOISTURE_SENSOR]: 15,
    [EquipmentType.LIGHT_SENSOR]: 10,
    [EquipmentType.CO2_SENSOR]: 8,
    [EquipmentType.CAMERA]: 12,
    [EquipmentType.WEATHER_STATION]: 5,
    [EquipmentType.IRRIGATION_CONTROLLER]: 7,
    [EquipmentType.OTHER]: 1,
  },
  byStatus: {
    [EquipmentStatus.ONLINE]: 45,
    [EquipmentStatus.OFFLINE]: 15,
    [EquipmentStatus.FAULT]: 5,
    [EquipmentStatus.MAINTENANCE]: 3,
  },
  batteryStats: {
    low: 8,
    medium: 25,
    high: 20,
    noData: 15,
  },
});

// 设备数据类型定义
interface DeviceData {
  temperature?: number;
  humidity?: number;
  moisture?: number;
  ph?: number;
  windSpeed?: number;
  rainfall?: number;
  valve?: 'open' | 'closed';
  flow?: number;
  co2?: number;
  intensity?: number;
  status?: string;
}

interface DevicePoint {
  id: number;
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  battery: number;
  x: number;
  y: number;
  data: DeviceData;
}

interface Field {
  id: number;
  name: string;
  onlineCount: number;
  totalCount: number;
  area: string;
  crop: string;
  points: DevicePoint[];
}

// 田块数据
const fields = ref([
  {
    id: 1,
    name: '1号田',
    onlineCount: 15,
    totalCount: 20,
    area: '2000㎡',
    crop: '水稻',
    points: [
      { id: 1, name: '温湿度传感器-A1', type: EquipmentType.TEMP_HUMIDITY_SENSOR, status: EquipmentStatus.ONLINE, battery: 85, x: 20, y: 30, data: { temperature: 25.6, humidity: 65 } },
      { id: 2, name: '土壤传感器-B1', type: EquipmentType.SOIL_MOISTURE_SENSOR, status: EquipmentStatus.OFFLINE, battery: 15, x: 40, y: 50, data: { moisture: 45, ph: 6.5 } },
      { id: 3, name: '气象站-A2', type: EquipmentType.WEATHER_STATION, status: EquipmentStatus.ONLINE, battery: 95, x: 60, y: 20, data: { windSpeed: 3.2, rainfall: 0 } },
    ],
  },
  {
    id: 2,
    name: '2号田',
    onlineCount: 12,
    totalCount: 18,
    area: '1800㎡',
    crop: '玉米',
    points: [
      { id: 4, name: '气象站-C1', type: EquipmentType.WEATHER_STATION, status: EquipmentStatus.ONLINE, battery: 90, x: 30, y: 40, data: { windSpeed: 2.8, rainfall: 0 } },
      { id: 5, name: '灌溉控制器-D1', type: EquipmentType.IRRIGATION_CONTROLLER, status: EquipmentStatus.FAULT, battery: 45, x: 50, y: 60, data: { valve: 'closed', flow: 0 } },
      { id: 6, name: '土壤传感器-B2', type: EquipmentType.SOIL_MOISTURE_SENSOR, status: EquipmentStatus.ONLINE, battery: 75, x: 70, y: 30, data: { moisture: 38, ph: 6.8 } },
    ],
  },
  {
    id: 3,
    name: '3号田',
    onlineCount: 18,
    totalCount: 22,
    area: '2500㎡',
    crop: '小麦',
    points: [
      { id: 7, name: '温湿度传感器-A3', type: EquipmentType.TEMP_HUMIDITY_SENSOR, status: EquipmentStatus.ONLINE, battery: 88, x: 25, y: 35, data: { temperature: 24.8, humidity: 62 } },
      { id: 8, name: 'CO2传感器-E1', type: EquipmentType.CO2_SENSOR, status: EquipmentStatus.ONLINE, battery: 92, x: 45, y: 55, data: { co2: 450 } },
      { id: 9, name: '光照传感器-F1', type: EquipmentType.LIGHT_SENSOR, status: EquipmentStatus.ONLINE, battery: 78, x: 65, y: 45, data: { intensity: 85000 } },
      { id: 10, name: '摄像头-G1', type: EquipmentType.CAMERA, status: EquipmentStatus.MAINTENANCE, battery: 0, x: 85, y: 25, data: { status: 'maintaining' } },
    ],
  },
  {
    id: 4,
    name: '4号田',
    onlineCount: 8,
    totalCount: 12,
    area: '1500㎡',
    crop: '大豆',
    points: [
      { id: 11, name: '温湿度传感器-A4', type: EquipmentType.TEMP_HUMIDITY_SENSOR, status: EquipmentStatus.ONLINE, battery: 82, x: 35, y: 45, data: { temperature: 25.2, humidity: 58 } },
      { id: 12, name: '土壤传感器-B3', type: EquipmentType.SOIL_MOISTURE_SENSOR, status: EquipmentStatus.ONLINE, battery: 65, x: 55, y: 65, data: { moisture: 42, ph: 6.7 } },
    ],
  },
]);

// 告警数据
const alerts = ref([
  {
    id: '1',
    time: new Date().toISOString(),
    deviceName: '土壤传感器-B1',
    type: 'offline',
    message: '设备离线超过30分钟',
  },
  {
    id: '2',
    time: new Date().toISOString(),
    deviceName: '灌溉控制器-D1',
    type: 'fault',
    message: '设备数据异常',
  },
]);

// 当前激活的设备点位
const activePoint = ref<number | null>(null);

// 显示设备信息
const showDeviceInfo = (point: any) => {
  activePoint.value = point.id;
  // 根据设备类型显示不同的数据
  const data = point.data;
  switch (point.type) {
    case EquipmentType.TEMP_HUMIDITY_SENSOR:
      console.log(`温度: ${data.temperature}°C, 湿度: ${data.humidity}%`);
      break;
    case EquipmentType.SOIL_MOISTURE_SENSOR:
      console.log(`土壤湿度: ${data.moisture}%, pH值: ${data.ph}`);
      break;
    case EquipmentType.WEATHER_STATION:
      console.log(`风速: ${data.windSpeed}m/s, 降雨量: ${data.rainfall}mm`);
      break;
    // ... 其他设备类型
  }
};

// 隐藏设备信息
const hideDeviceInfo = () => {
  activePoint.value = null;
};

// 格式化百分比
const formatPercent = (value: number) => {
  return (value * 100).toFixed(1);
};

// 获取设备类型名称
const getDeviceTypeName = (type: EquipmentType) => {
  const names: Record<EquipmentType, string> = {
    [EquipmentType.TEMP_HUMIDITY_SENSOR]: '温湿度传感器',
    [EquipmentType.SOIL_MOISTURE_SENSOR]: '土壤传感器',
    [EquipmentType.LIGHT_SENSOR]: '光照传感器',
    [EquipmentType.CO2_SENSOR]: 'CO2传感器',
    [EquipmentType.CAMERA]: '摄像头',
    [EquipmentType.WEATHER_STATION]: '气象站',
    [EquipmentType.IRRIGATION_CONTROLLER]: '灌溉控制器',
    [EquipmentType.OTHER]: '其他设备',
  };
  return names[type] || '未知设备';
};

// 获取设备类型颜色
const getTypeColor = (type: EquipmentType) => {
  const colors: Record<EquipmentType, string> = {
    [EquipmentType.TEMP_HUMIDITY_SENSOR]: '#409EFF',
    [EquipmentType.SOIL_MOISTURE_SENSOR]: '#67C23A',
    [EquipmentType.LIGHT_SENSOR]: '#E6A23C',
    [EquipmentType.CO2_SENSOR]: '#F56C6C',
    [EquipmentType.CAMERA]: '#909399',
    [EquipmentType.WEATHER_STATION]: '#9B59B6',
    [EquipmentType.IRRIGATION_CONTROLLER]: '#3498DB',
    [EquipmentType.OTHER]: '#95A5A6',
  };
  return colors[type] || '#909399';
};

// 获取状态文本
const getStatusText = (status: EquipmentStatus) => {
  const texts: Record<EquipmentStatus, string> = {
    [EquipmentStatus.ONLINE]: '在线',
    [EquipmentStatus.OFFLINE]: '离线',
    [EquipmentStatus.FAULT]: '故障',
    [EquipmentStatus.MAINTENANCE]: '维护中',
  };
  return texts[status] || '未知状态';
};

// 获取状态颜色
const getStatusColor = (status: EquipmentStatus) => {
  const colors: Record<EquipmentStatus, string> = {
    [EquipmentStatus.ONLINE]: '#67C23A',
    [EquipmentStatus.OFFLINE]: '#909399',
    [EquipmentStatus.FAULT]: '#F56C6C',
    [EquipmentStatus.MAINTENANCE]: '#E6A23C',
  };
  return colors[status] || '#909399';
};

// 获取电池状态标签
const getBatteryLabel = (level: string) => {
  const labels = {
    low: '电量不足',
    medium: '电量正常',
    high: '电量充足',
    noData: '无电池数据',
  };
  return labels[level as keyof typeof labels] || '未知状态';
};

// 获取电池状态颜色
const getBatteryColor = (level: string) => {
  const colors = {
    low: '#F56C6C',
    medium: '#E6A23C',
    high: '#67C23A',
    noData: '#909399',
  };
  return colors[level as keyof typeof colors] || '#909399';
};

// 获取告警类型样式
const getAlertType = (type: string): TagProps['type'] => {
  const types: Record<string, TagProps['type']> = {
    offline: 'info',
    battery: 'warning',
    fault: 'danger',
  };
  return types[type] || 'info';
};

// 获取告警类型文本
const getAlertTypeText = (type: string) => {
  const texts = {
    offline: '离线告警',
    battery: '电量告警',
    fault: '故障告警',
  };
  return texts[type as keyof typeof texts] || '未知告警';
};

// 获取状态样式类
const getStatusClass = (status: EquipmentStatus) => {
  const classes: Record<EquipmentStatus, string> = {
    [EquipmentStatus.ONLINE]: 'online',
    [EquipmentStatus.OFFLINE]: 'offline',
    [EquipmentStatus.FAULT]: 'fault',
    [EquipmentStatus.MAINTENANCE]: 'maintenance',
  };
  return classes[status] || '';
};

// 点击田块
const handleFieldClick = (field: any) => {
  console.log(`选中田块: ${field.name}, 种植作物: ${field.crop}, 面积: ${field.area}`);
};

// 处理设备告警
const handleAlert = (alert: any) => {
  console.log('处理告警:', alert);
  // 这里可以添加处理告警的逻辑
};

// 定时更新数据
let dataUpdateTimer: ReturnType<typeof setInterval>;
onMounted(() => {
  // 每30秒更新一次数据
  dataUpdateTimer = setInterval(() => {
    updateDeviceData();
  }, 30000);
});

onUnmounted(() => {
  clearInterval(timer);
  clearInterval(dataUpdateTimer);
});

// 更新设备数据
const updateDeviceData = () => {
  fields.value.forEach(field => {
    field.points.forEach(point => {
      if (point.status === EquipmentStatus.ONLINE) {
        const data = point.data;
        switch (point.type) {
          case EquipmentType.TEMP_HUMIDITY_SENSOR:
            if ('temperature' in data && 'humidity' in data) {
              data.temperature = +(20 + Math.random() * 10).toFixed(1);
              data.humidity = +(50 + Math.random() * 30).toFixed(1);
            }
            break;
          case EquipmentType.SOIL_MOISTURE_SENSOR:
            if ('moisture' in data) {
              data.moisture = +(30 + Math.random() * 20).toFixed(1);
            }
            break;
          // ... 其他设备类型
        }
      }
    });
  });
};
</script>

<style lang="less" scoped>
.monitor-container {
  width: 100%;
  height: 100vh;
  padding: 20px;
  background-color: #001529;
  color: #fff;
  overflow: hidden;
  position: relative;
  display: grid;
  grid-template-columns: 25% 50% 25%;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
}

.monitor-header {
  grid-column: 1 / -1;
  text-align: center;
  padding: 20px 0;

  .main-title {
    font-size: 32px;
    color: #00ffff;
    margin: 0;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  }

  .header-right {
    position: absolute;
    right: 20px;
    top: 20px;
    font-size: 16px;
  }
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .data-card {
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid rgba(0, 255, 255, 0.3);
    padding: 20px;
    border-radius: 4px;

    .card-title {
      font-size: 16px;
      color: #00ffff;
      margin-bottom: 10px;
    }

    .card-value {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .card-unit {
      font-size: 14px;
      color: #7eb9ff;
    }
  }
}

.center-map {
  position: relative;
  height: 100%;

  .map-container {
    width: 100%;
    height: 100%;
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 4px;
    position: relative;
    padding: 20px;

    .map-title {
      position: absolute;
      top: 20px;
      left: 20px;
      font-size: 18px;
      color: #00ffff;
    }
  }

  .field-area {
    position: relative;
    border: 1px dashed rgba(0, 255, 255, 0.3);
    border-radius: 8px;
    padding: 10px;
    margin: 10px;

    .field-name {
      position: absolute;
      top: -10px;
      left: 10px;
      background: #001529;
      padding: 0 10px;
      color: #00ffff;
    }

    .field-stats {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size: 12px;
      color: #7eb9ff;

      span {
        margin-left: 10px;
      }

      .online {
        color: #67C23A;
      }
    }
  }

  .device-point {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s;

    &.online {
      background: #67C23A;
      box-shadow: 0 0 10px rgba(103, 194, 58, 0.5);
    }

    &.offline {
      background: #909399;
      box-shadow: 0 0 10px rgba(144, 147, 153, 0.5);
    }

    &.fault {
      background: #F56C6C;
      box-shadow: 0 0 10px rgba(245, 108, 108, 0.5);
    }

    &:hover {
      transform: scale(1.5);
    }

    .point-tooltip {
      position: absolute;
      top: -80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10;

      &::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 5px 5px 0;
        border-style: solid;
        border-color: rgba(0, 0, 0, 0.8) transparent transparent;
      }
    }
  }
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .stat-card, .chart-card {
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid rgba(0, 255, 255, 0.3);
    padding: 20px;
    border-radius: 4px;

    .chart-header {
      margin-bottom: 20px;
      font-size: 16px;
      color: #00ffff;
    }

    :deep(.el-progress) {
      margin-bottom: 15px;

      .el-progress__text {
        color: #fff;
      }
    }
  }
}

.bottom-panel {
  grid-column: 1 / -1;

  .bottom-card {
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid rgba(0, 255, 255, 0.3);
    padding: 20px;
    border-radius: 4px;

    .card-header {
      font-size: 18px;
      color: #00ffff;
      margin-bottom: 15px;
    }

    :deep(.el-table) {
      background-color: transparent;
      color: #fff;

      th {
        background-color: rgba(0, 255, 255, 0.1);
        color: #00ffff;
        border-bottom: 1px solid rgba(0, 255, 255, 0.3);
      }

      td {
        background-color: transparent;
        border-bottom: 1px solid rgba(0, 255, 255, 0.1);
      }
    }
  }
}
</style>
