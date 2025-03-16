<script lang="ts" setup>
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import ActivityForm from './components/ActivityForm.vue';
import {
  getActivityList,
  deleteActivity,
  exportActivities,
  ActivityType,
  ActivityStatus,
  DataSource,
} from '#/api/activity';
import type { ActivityQueryParams, FarmActivity, FieldInfo } from '#/api/activity'
import { getFieldList, getFieldSectionList } from '#/api/activity';
import { formatDateTime } from '#/utils/formatTime';

const router = useRouter();
const loading = ref(false);
const formModalVisible = ref(false);
const isEdit = ref(false);
const currentActivity = ref<Partial<FarmActivity>>({});

// 活动列表数据
const activityList = ref<FarmActivity[]>([]);

// 表单标题
const formModalTitle = computed(() => isEdit.value ? '编辑农事活动' : '新增农事活动');

// 分页参数
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});

// 搜索表单
const searchForm = reactive<Partial<ActivityQueryParams>>({
  fieldId: undefined,
  sectionId: undefined,
  activityType: undefined,
  status: undefined,
  startDate: undefined,
  endDate: undefined
});

// 日期范围选择器
const dateRange = ref<[string, string] | null>(null);

// 字段选项
const fieldOptions = ref<{ label: string; value: string; }[]>([]);
const sectionOptions = ref<{ label: string; value: string; }[]>([]);

// 活动类型选项
const activityTypeOptions = computed(() => {
  return [
    { label: '播种', value: ActivityType.PLANTING },
    { label: '施肥', value: ActivityType.FERTILIZING },
    { label: '灌溉', value: ActivityType.IRRIGATION },
    { label: '除草', value: ActivityType.WEEDING },
    { label: '病虫害防治', value: ActivityType.PESTCONTROL },
    { label: '收获', value: ActivityType.HARVEST },
    { label: '其他', value: ActivityType.OTHER },
  ];
});

// 活动状态选项
const activityStatusOptions = computed(() => {
  return [
    { label: '计划中', value: ActivityStatus.PLANNED },
    { label: '进行中', value: ActivityStatus.INPROGRESS },
    { label: '已完成', value: ActivityStatus.COMPLETED },
    { label: '已取消', value: ActivityStatus.CANCELLED },
  ];
});

// 监听日期变化
watch(dateRange, (value) => {
  if (value && value.length === 2) {
    searchForm.startDate = value[0];
    searchForm.endDate = value[1];
  } else {
    searchForm.startDate = undefined;
    searchForm.endDate = undefined;
  }
});

// 监听字段变化
watch(() => searchForm.fieldId, async (value) => {
  searchForm.sectionId = undefined;
  if (value) {
    await loadSections(value);
  } else {
    sectionOptions.value = [];
  }
});

// 初始化
onMounted(async () => {
  await loadFields();
  await loadData();
});

// 加载大田列表
async function loadFields() {
  try {
    const result = await getFieldList();
    fieldOptions.value = (result.items || []).map((item: FieldInfo) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (error) {
    console.error('加载大田列表失败', error);
  }
}

// 加载分区列表
async function loadSections(fieldId: string) {
  if (!fieldId) {
    sectionOptions.value = [];
    return;
  }

  try {
    const sections = await getFieldSectionList(fieldId);
    sectionOptions.value = (sections || []).map((item) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (error) {
    console.error('加载分区列表失败', error);
  }
}

// 加载活动列表数据
async function loadData() {
  try {
    loading.value = true;
    const { current, pageSize } = pagination;
    const params = {
      page: current,
      pageSize,
      ...searchForm
    };
    const data = await getActivityList(params);
    activityList.value = data.items || [];
    pagination.total = data.total || 0;
  } catch (error) {
    console.error('加载活动列表失败', error);
    ElMessage.error('加载活动列表失败');
  } finally {
    loading.value = false;
  }
}

// 查询
function handleSearch() {
  pagination.current = 1;
  loadData();
}

// 重置
function handleReset() {
  searchForm.fieldId = undefined;
  searchForm.sectionId = undefined;
  searchForm.activityType = undefined;
  searchForm.status = undefined;
  dateRange.value = null;
  searchForm.startDate = undefined;
  searchForm.endDate = undefined;
  pagination.current = 1;
  loadData();
}

// 查看详情
function handleView(row: FarmActivity) {
  router.push(`/activity/detail/${row.id}`);
}

// 新增
function handleAdd() {
  isEdit.value = false;
  currentActivity.value = {};
  formModalVisible.value = true;
}

// 编辑
function handleEdit(row: FarmActivity) {
  isEdit.value = true;
  currentActivity.value = { ...row };
  formModalVisible.value = true;
}

// 删除
async function handleDelete(id: string) {
  try {
    await deleteActivity(id);
    ElMessage.success('删除成功');
    loadData();
  } catch (error) {
    console.error('删除失败', error);
    ElMessage.error('删除失败');
  }
}

// 导出
async function handleExport() {
  try {
    loading.value = true;
    await exportActivities(searchForm);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败', error);
    ElMessage.error('导出失败');
  } finally {
    loading.value = false;
  }
}

// 跳转到统计页面
function toStatistics() {
  router.push('/activity/statistics');
}

// 表单提交
function handleFormSubmit() {
  formModalVisible.value = false;
  ElMessage.success(isEdit.value ? '编辑成功' : '新增成功');
  loadData();
}

// 字段变化
function handleFieldChange(value: string) {
  searchForm.sectionId = undefined;
  if (value) {
    loadSections(value);
  } else {
    sectionOptions.value = [];
  }
}

// 分页大小变化
function handleSizeChange(size: number) {
  pagination.pageSize = size;
  loadData();
}

// 页码变化
function handleCurrentChange(page: number) {
  pagination.current = page;
  loadData();
}

// 获取大田名称
function getFieldName(fieldId: string) {
  const field = fieldOptions.value.find(item => item.value === fieldId);
  return field ? field.label : '未知';
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
  return statusTypeMap[status] as any;
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

// 格式化时间
function formatTime(time: string) {
  if (!time) return '';
  return formatDateTime(time);
}
</script>

<template>
  <div class="activity-container">
    <el-card class="activity-card">
      <template #header>
        <div class="card-header">
          <span class="title">农事活动管理</span>
          <div class="actions">
            <el-button type="primary" @click="handleAdd">新增活动</el-button>
          </div>
        </div>
      </template>

      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="大田">
            <el-select
              v-model="searchForm.fieldId"
              placeholder="请选择大田"
              clearable
              style="width: 180px"
              @change="handleFieldChange"
            >
              <el-option
                v-for="item in fieldOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="分区">
            <el-select
              v-model="searchForm.sectionId"
              placeholder="请选择分区"
              clearable
              style="width: 180px"
              :disabled="!searchForm.fieldId"
            >
              <el-option
                v-for="item in sectionOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="活动类型">
            <el-select
              v-model="searchForm.activityType"
              placeholder="请选择活动类型"
              clearable
              style="width: 180px"
            >
              <el-option
                v-for="item in activityTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="活动状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择活动状态"
              clearable
              style="width: 180px"
            >
              <el-option
                v-for="item in activityStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 320px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="handleExport">导出</el-button>
            <el-button @click="toStatistics">统计分析</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table
        v-loading="loading"
        :data="activityList"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="活动标题" width="180" />
        <el-table-column label="大田" width="120">
          <template #default="{ row }">
            {{ getFieldName(row.fieldId) }}
          </template>
        </el-table-column>
        <el-table-column label="活动类型" width="120">
          <template #default="{ row }">
            {{ getActivityTypeName(row.activityType) }}
          </template>
        </el-table-column>
        <el-table-column label="开始时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="结束时间" width="160">
          <template #default="{ row }">
            {{ row.endTime ? formatTime(row.endTime) : '未完成' }}
          </template>
        </el-table-column>
        <el-table-column prop="executor" label="执行人" width="120" />
        <el-table-column label="活动状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="数据来源" width="120">
          <template #default="{ row }">
            {{ getDataSourceName(row.dataSource) }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="190">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm
              title="确定要删除此活动吗？"
              width="200px"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:currentPage="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="formModalVisible"
      :title="formModalTitle"
      width="800px"
      destroy-on-close
    >
      <activity-form
        :form-data="currentActivity"
        :is-edit="isEdit"
        @submit="handleFormSubmit"
        @cancel="formModalVisible = false"
      />
    </el-dialog>
  </div>
</template>

<style scoped>
.activity-container {
  padding: 16px;
}

.activity-card {
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

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
