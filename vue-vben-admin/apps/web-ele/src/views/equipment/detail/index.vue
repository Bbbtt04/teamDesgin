<template>
  <div class="equipment-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>设备详情</span>
          <el-button link @click="router.back()">
            返回
          </el-button>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="设备名称">
          {{ equipment?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="设备类型">
          {{ getEquipmentTypeName(equipment?.type) }}
        </el-descriptions-item>
        <el-descriptions-item label="设备型号">
          {{ equipment?.model }}
        </el-descriptions-item>
        <el-descriptions-item label="序列号">
          {{ equipment?.serialNumber }}
        </el-descriptions-item>
        <el-descriptions-item label="所属农场">
          {{ getFieldName(equipment?.fieldId) }}
        </el-descriptions-item>
        <el-descriptions-item label="所属分区" v-if="equipment?.sectionId">
          {{ getSectionName(equipment?.sectionId) }}
        </el-descriptions-item>
        <el-descriptions-item label="设备状态">
          <el-tag :type="getStatusType(equipment?.status)">
            {{ getStatusText(equipment?.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="电池电量" v-if="equipment?.batteryLevel !== undefined">
          <el-progress
            :percentage="equipment?.batteryLevel"
            :color="getBatteryColor(equipment?.batteryLevel)"
          />
        </el-descriptions-item>
        <el-descriptions-item label="制造商">
          {{ equipment?.manufacturer }}
        </el-descriptions-item>
        <el-descriptions-item label="IP地址" v-if="equipment?.ipAddress">
          {{ equipment?.ipAddress }}
        </el-descriptions-item>
        <el-descriptions-item label="安装位置" v-if="equipment?.location">
          <div>纬度: {{ equipment?.location.latitude }}</div>
          <div>经度: {{ equipment?.location.longitude }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="安装时间">
          {{ equipment?.installTime ? formatDateTime(equipment.installTime) : '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="最后上报时间">
          {{ equipment?.lastReportTime ? formatDateTime(equipment.lastReportTime) : '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ equipment?.createTime ? formatDateTime(equipment.createTime) : '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">
          {{ equipment?.updateTime ? formatDateTime(equipment.updateTime) : '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="设备描述" v-if="equipment?.description">
          {{ equipment?.description }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { formatDateTime } from '#/utils/formatTime';
import { getEquipmentById } from '#/api/equipment';
import type { Equipment } from '#/api/equipment/model';
import { EquipmentType, EquipmentStatus } from '#/api/equipment/model';
import type { TagProps } from 'element-plus';

const router = useRouter();
const route = useRoute();
const equipment = ref<Equipment>();

// 获取设备类型名称
const getEquipmentTypeName = (type?: EquipmentType): string => {
  const typeMap: Record<EquipmentType, string> = {
    [EquipmentType.TEMP_HUMIDITY_SENSOR]: '温湿度传感器',
    [EquipmentType.SOIL_MOISTURE_SENSOR]: '土壤湿度传感器',
    [EquipmentType.LIGHT_SENSOR]: '光照传感器',
    [EquipmentType.CO2_SENSOR]: 'CO2传感器',
    [EquipmentType.CAMERA]: '摄像头',
    [EquipmentType.WEATHER_STATION]: '气象站',
    [EquipmentType.IRRIGATION_CONTROLLER]: '灌溉控制器',
    [EquipmentType.OTHER]: '其他设备',
  };
  return type !== undefined ? typeMap[type] : '未知类型';
};

// 获取设备状态类型
const getStatusType = (status?: EquipmentStatus): TagProps['type'] => {
  const statusMap: Record<EquipmentStatus, TagProps['type']> = {
    [EquipmentStatus.ONLINE]: 'success',
    [EquipmentStatus.OFFLINE]: 'info',
    [EquipmentStatus.FAULT]: 'danger',
    [EquipmentStatus.MAINTENANCE]: 'warning',
  };
  return status !== undefined ? statusMap[status] : 'info';
};

// 获取设备状态文本
const getStatusText = (status?: EquipmentStatus): string => {
  const statusMap: Record<EquipmentStatus, string> = {
    [EquipmentStatus.ONLINE]: '在线',
    [EquipmentStatus.OFFLINE]: '离线',
    [EquipmentStatus.FAULT]: '故障',
    [EquipmentStatus.MAINTENANCE]: '维护中',
  };
  return status !== undefined ? statusMap[status] : '未知';
};

// 获取电池颜色
const getBatteryColor = (level?: number): string => {
  if (!level) return '#909399';
  if (level < 20) return '#f56c6c';
  if (level < 60) return '#e6a23c';
  return '#67c23a';
};

// 获取农场名称（临时数据）
const getFieldName = (fieldId?: string): string => {
  const fieldMap: Record<string, string> = {
    '1': '农场1',
    '2': '农场2',
    '3': '农场3',
    '4': '农场4',
    '5': '农场5',
  };
  return fieldId ? fieldMap[fieldId] || '未知农场' : '--';
};

// 获取分区名称（临时数据）
const getSectionName = (sectionId?: string): string => {
  const sectionMap: Record<string, string> = {
    '101': '分区1-1',
    '102': '分区1-2',
    '103': '分区1-3',
    '201': '分区2-1',
    '202': '分区2-2',
    '401': '分区4-1',
    '402': '分区4-2',
    '501': '分区5-1',
  };
  return sectionId ? sectionMap[sectionId] || '未知分区' : '--';
};

// 加载设备详情
const loadEquipmentDetail = async () => {
  try {
    const id = route.params.id as string;
    equipment.value = await getEquipmentById(id);
  } catch (error) {
    console.error('加载设备详情失败:', error);
  }
};

onMounted(() => {
  loadEquipmentDetail();
});
</script>

<style scoped>
.equipment-detail {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
