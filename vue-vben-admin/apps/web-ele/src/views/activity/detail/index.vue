<template>
  <div class="activity-detail-container">
    <el-card class="detail-card">
      <template #header>
        <div class="card-header">
          <span class="title">农事活动详情</span>
          <div class="actions">
            <el-button @click="handleBack">返回</el-button>
            <el-button type="primary" @click="handleEdit">编辑</el-button>
          </div>
        </div>
      </template>

      <el-skeleton :loading="loading" animated>
        <template #default>
          <el-descriptions title="" :column="2" border size="default">
            <el-descriptions-item label="活动ID">{{ activity.id }}</el-descriptions-item>
            <el-descriptions-item label="活动标题">{{ activity.title }}</el-descriptions-item>
            <el-descriptions-item label="大田">{{ getFieldName(activity.fieldId) }}</el-descriptions-item>
            <el-descriptions-item label="分区" v-if="activity.sectionId">{{ getSectionName(activity.sectionId)
              }}</el-descriptions-item>
            <el-descriptions-item label="活动类型">{{ getActivityTypeName(activity.activityType) }}</el-descriptions-item>
            <el-descriptions-item label="活动状态">
              <el-tag :type="getStatusType(activity.status) as any">{{ getStatusName(activity.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ activity.startTime }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ activity.endTime || '未完成' }}</el-descriptions-item>
            <el-descriptions-item label="执行人">{{ activity.executor }}</el-descriptions-item>
            <el-descriptions-item label="数据来源">{{ getDataSourceName(activity.dataSource) }}</el-descriptions-item>
            <el-descriptions-item label="活动描述" :span="2">{{ activity.description }}</el-descriptions-item>
            <el-descriptions-item label="使用农资" :span="2">
              <el-tag v-for="(item, index) in activity.materials" :key="index" class="material-tag">
                {{ item }}
              </el-tag>
              <span v-if="!activity.materials || activity.materials.length === 0">无</span>
            </el-descriptions-item>
            <el-descriptions-item label="天气信息" v-if="activity.weatherInfo">
              {{ activity.weatherInfo }}
            </el-descriptions-item>
            <el-descriptions-item label="效果描述" v-if="activity.effectDescription">
              {{ activity.effectDescription }}
            </el-descriptions-item>
            <el-descriptions-item label="备注" v-if="activity.remark" :span="2">
              {{ activity.remark }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ activity.createTime }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ activity.updateTime }}</el-descriptions-item>
          </el-descriptions>

          <div v-if="activity.images && activity.images.length > 0" class="images-container">
            <h3>活动图片</h3>
            <div class="images-grid">
              <el-image v-for="(url, index) in activity.images" :key="index" :src="url" fit="cover"
                :preview-src-list="activity.images" class="activity-image" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </el-card>

    <el-dialog v-model="editModalVisible" title="编辑农事活动" width="800px" destroy-on-close>
      <activity-form :form-data="activity" :is-edit="true" @submit="handleFormSubmit"
        @cancel="editModalVisible = false" />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import ActivityForm from '../components/ActivityForm.vue';
import {
  getActivityDetail,
  updateActivity,
  ActivityType,
  ActivityStatus,
  DataSource,
} from '#/api/activity';
import type {
  FarmActivity,
  FieldInfo,
  FieldSection
} from '#/api/activity'
import { getFieldList, getFieldSectionList } from '#/api/activity';
import { formatDateTime } from '#/utils/formatTime';

const router = useRouter();
const route = useRoute();

const id = ref(route.params.id as string);
const loading = ref(true);
const activity = ref({} as FarmActivity);
const editModalVisible = ref(false);

const fieldList = ref<FieldInfo[]>([]);
const sectionList = ref<Record<string, FieldSection[]>>({});

// 加载活动详情
async function loadActivityDetail() {
  try {
    loading.value = true;
    const data = await getActivityDetail(id.value);
    // 格式化时间
    if (data.startTime) {
      data.startTime = formatDateTime(data.startTime);
    }
    if (data.endTime) {
      data.endTime = formatDateTime(data.endTime);
    }
    if (data.createTime) {
      data.createTime = formatDateTime(data.createTime);
    }
    if (data.updateTime) {
      data.updateTime = formatDateTime(data.updateTime);
    }
    activity.value = data;

    // 加载分区信息
    if (data.fieldId) {
      await loadSections(data.fieldId);
    }
  } catch (error) {
    console.error('加载活动详情失败', error);
    ElMessage.error('加载活动详情失败');
  } finally {
    loading.value = false;
  }
}

// 加载分区列表
async function loadSections(fieldId: string) {
  if (!fieldId) return;

  try {
    if (!sectionList.value[fieldId]) {
      const sections = await getFieldSectionList(fieldId);
      sectionList.value[fieldId] = sections || [];
    }
  } catch (error) {
    console.error('加载分区列表失败', error);
  }
}

// 获取大田名称
function getFieldName(fieldId: string) {
  const field = fieldList.value.find(item => item.id === fieldId);
  return field ? field.name : '未知';
}

// 获取分区名称
function getSectionName(sectionId: string) {
  if (!activity.value.fieldId || !sectionList.value[activity.value.fieldId]) {
    return '未知';
  }
  const section = sectionList.value[activity.value.fieldId].find((item: FieldSection) => item.id === sectionId);
  return section ? section.name : '未知';
}

// 获取活动类型名称
function getActivityTypeName(type: ActivityType) {
  const typeMap = {
    [ActivityType.PLANTING]: '播种',
    [ActivityType.FERTILIZING]: '施肥',
    [ActivityType.IRRIGATION]: '灌溉',
    [ActivityType.WEEDING]: '除草',
    [ActivityType.PESTCONTROL]: '病虫害防治',
    [ActivityType.HARVEST]: '收获',
    [ActivityType.OTHER]: '其他'
  };
  return typeMap[type] || '未知';
}

// 获取状态名称
function getStatusName(status: ActivityStatus) {
  const statusMap = {
    [ActivityStatus.PLANNED]: '计划中',
    [ActivityStatus.INPROGRESS]: '进行中',
    [ActivityStatus.COMPLETED]: '已完成',
    [ActivityStatus.CANCELLED]: '已取消'
  };
  return statusMap[status] || '未知';
}

// 获取状态类型（标签颜色）
function getStatusType(status: ActivityStatus) {
  const statusTypeMap = {
    [ActivityStatus.PLANNED]: 'info',
    [ActivityStatus.INPROGRESS]: 'warning',
    [ActivityStatus.COMPLETED]: 'success',
    [ActivityStatus.CANCELLED]: 'danger'
  };
  return statusTypeMap[status] || 'info';
}

// 获取数据来源名称
function getDataSourceName(source: DataSource) {
  const sourceMap = {
    [DataSource.MANUAL]: '手动录入',
    [DataSource.DEVICE]: '设备采集',
    [DataSource.SYSTEM]: '系统生成'
  };
  return sourceMap[source] || '未知';
}

// 返回列表页
function handleBack() {
  router.push('/activity');
}

// 编辑活动
function handleEdit() {
  editModalVisible.value = true;
}

// 提交表单
async function handleFormSubmit(formData: Partial<FarmActivity>) {
  try {
    await updateActivity(id.value, formData);
    ElMessage.success('更新成功');
    editModalVisible.value = false;
    // 重新加载活动详情
    await loadActivityDetail();
  } catch (error) {
    console.error('更新失败', error);
    ElMessage.error('更新失败');
  }
}

onMounted(async () => {
  // await loadFields();
  await loadActivityDetail();
});
</script>

<style scoped>
.activity-detail-container {
  padding: 16px;
}

.detail-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.material-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}

.images-container {
  margin-top: 24px;
}

.images-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.activity-image {
  width: 160px;
  height: 120px;
  border-radius: 4px;
  object-fit: cover;
}
</style>

<style>
/* 图片预览工具栏样式覆盖 */
.el-image-viewer__actions {
  background-color: rgba(0, 0, 0, 0.7) !important; /* 工具栏背景色 */
  padding: 12px 0 !important; /* 工具栏内边距 */
  border-radius: 8px !important; /* 圆角 */
}

.el-image-viewer__btn {
  /* 工具栏按钮 */
  color: #fff !important; /* 按钮颜色 */
  font-size: 20px !important; /* 按钮大小 */
  margin: 0 8px !important; /* 按钮间距 */
  opacity: 0.9 !important; /* 按钮透明度 */
  transition: all 0.3s !important; /* 过渡效果 */
}

.el-image-viewer__prev, .el-image-viewer__next {
  /* 上一张/下一张按钮 */
  background-color: rgba(0, 0, 0, 0.7) !important; /* 按钮背景 */
  border-radius: 50% !important; /* 圆形按钮 */
  width: 44px !important; /* 调整按钮宽度 */
  height: 44px !important; /* 调整按钮高度 */
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.el-image-viewer__prev:hover, .el-image-viewer__next:hover {
  background-color: rgba(0, 0, 0, 0.9) !important; /* 悬停时背景色 */
}
</style>
