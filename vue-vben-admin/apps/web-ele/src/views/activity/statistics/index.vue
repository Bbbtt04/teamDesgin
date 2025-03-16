<template>
  <div class="statistics-container">
    <el-card class="statistics-card">
      <template #header>
        <div class="card-header">
          <span class="title">农事活动统计</span>
          <div class="actions">
            <el-button @click="handleBack">返回</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="大田">
            <el-select v-model="searchForm.fieldId" placeholder="请选择大田" clearable style="width: 180px"
              @change="handleSearch">
              <el-option v-for="item in fieldOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 320px"
              @change="handleSearch" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-skeleton :loading="loading" animated>
        <template #default>
          <!-- 统计卡片 -->
          <el-row :gutter="16" class="stat-cards">
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card total-card">
                <div class="stat-card-content">
                  <div class="stat-card-value">{{ totalActivities }}</div>
                  <div class="stat-card-label">总活动数</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card planned-card">
                <div class="stat-card-content">
                  <div class="stat-card-value">{{ plannedCount }}</div>
                  <div class="stat-card-label">计划中</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card progress-card">
                <div class="stat-card-content">
                  <div class="stat-card-value">{{ inProgressCount }}</div>
                  <div class="stat-card-label">进行中</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="6">
              <el-card shadow="hover" class="stat-card completed-card">
                <div class="stat-card-content">
                  <div class="stat-card-value">{{ completedCount }}</div>
                  <div class="stat-card-label">已完成</div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <!-- 图表区域 -->
          <el-row :gutter="16" class="chart-row">
            <el-col :span="12">
              <el-card class="chart-card" shadow="hover">
                <template #header>
                  <div class="chart-header">活动类型分布</div>
                </template>
                <div class="chart-container" ref="typeChartContainer"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="chart-card" shadow="hover">
                <template #header>
                  <div class="chart-header">活动状态分布</div>
                </template>
                <div class="chart-container" ref="statusChartContainer"></div>
              </el-card>
            </el-col>
          </el-row>

          <el-card class="chart-card" shadow="hover">
            <template #header>
              <div class="chart-header">月度活动统计</div>
            </template>
            <div class="chart-container month-chart" ref="monthChartContainer"></div>
          </el-card>
        </template>
      </el-skeleton>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts/core';
import {
  BarChart,
  PieChart,
  LineChart
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册 ECharts 组件
echarts.use([
  BarChart,
  PieChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer
]);

// 定义枚举
enum ActivityType {
  /** 播种 */
  PLANTING = 0,
  /** 施肥 */
  FERTILIZING = 1,
  /** 灌溉 */
  IRRIGATION = 2,
  /** 除草 */
  WEEDING = 3,
  /** 病虫害防治 */
  PESTCONTROL = 4,
  /** 收获 */
  HARVEST = 5,
  /** 其他 */
  OTHER = 99
}

enum ActivityStatus {
  /** 计划中 */
  PLANNED = 0,
  /** 进行中 */
  INPROGRESS = 1,
  /** 已完成 */
  COMPLETED = 2,
  /** 已取消 */
  CANCELLED = 3
}

// 定义接口
interface FieldInfo {
  id: string;
  name: string;
}

interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

interface StatisticsData {
  totalCount: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byMonth: Record<string, number>;
}

// API函数
async function getFieldList() {
  const response = await fetch('/api/field/list');
  return response.json();
}

async function getActivityStatistics(params: any) {
  const queryParams = new URLSearchParams();
  if (params.fieldId) queryParams.append('fieldId', params.fieldId);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const response = await fetch(`/api/activity/statistics?${queryParams.toString()}`);
  return response.json();
}

const router = useRouter();
const loading = ref(true);

// 图表容器引用
const typeChartContainer = ref<HTMLElement | null>(null);
const statusChartContainer = ref<HTMLElement | null>(null);
const monthChartContainer = ref<HTMLElement | null>(null);

// 图表实例
let typeChart: echarts.ECharts | null = null;
let statusChart: echarts.ECharts | null = null;
let monthChart: echarts.ECharts | null = null;

// 搜索表单
const searchForm = reactive({
  fieldId: undefined as string | undefined,
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined,
});

// 日期范围
const dateRange = ref<string[]>([]);

// 字段选项
const fieldOptions = ref<{ label: string; value: string; }[]>([]);

// 统计数据
const statisticsData = ref<StatisticsData>({
  totalCount: 0,
  byStatus: {},
  byType: {},
  byMonth: {}
});

// 计算属性：总活动数
const totalActivities = computed(() => statisticsData.value.totalCount);

// 计算属性：计划中活动数
const plannedCount = computed(() =>
  statisticsData.value.byStatus[ActivityStatus.PLANNED] || 0
);

// 计算属性：进行中活动数
const inProgressCount = computed(() =>
  statisticsData.value.byStatus[ActivityStatus.INPROGRESS] || 0
);

// 计算属性：已完成活动数
const completedCount = computed(() =>
  statisticsData.value.byStatus[ActivityStatus.COMPLETED] || 0
);

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

// 初始化
onMounted(async () => {
  await loadFields();
  await loadStatistics();
  window.addEventListener('resize', handleResize);
});

// 组件销毁前
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  disposeCharts();
});

// 处理窗口大小变化
function handleResize() {
  typeChart?.resize();
  statusChart?.resize();
  monthChart?.resize();
}

// 销毁图表
function disposeCharts() {
  typeChart?.dispose();
  statusChart?.dispose();
  monthChart?.dispose();
  typeChart = null;
  statusChart = null;
  monthChart = null;
}

// 加载大田列表
async function loadFields() {
  try {
    const result = await getFieldList();
    fieldOptions.value = (result.data?.items || []).map((item: FieldInfo) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (error) {
    console.error('加载大田列表失败', error);
  }
}

// 加载统计数据
async function loadStatistics() {
  try {
    loading.value = true;
    console.log('查询参数:', searchForm);
    const response = await getActivityStatistics(searchForm);
    console.log('统计数据返回:', response);

    // 确保所有必需的属性都存在
    // 根据API返回结构获取数据
    let data;
    if (response.data) {
      // 标准API响应格式
      data = response.data;
    } else if (response.code === 0 && response.data) {
      // 另一种API响应格式
      data = response.data;
    } else {
      // 直接返回的数据
      data = response;
    }

    console.log('处理后的数据:', data);

    statisticsData.value = {
      totalCount: data.totalCount || 0,
      byStatus: data.byStatus || {},
      byType: data.byType || {},
      byMonth: data.byMonth || {}
    };

    // 初始化图表
    setTimeout(() => {
      initializeCharts();
    }, 100);
  } catch (error) {
    console.error('加载统计数据失败', error);
    ElMessage.error('加载统计数据失败');
  } finally {
    loading.value = false;
  }
}

// 查询
function handleSearch() {
  loadStatistics();
}

// 重置
function handleReset() {
  searchForm.fieldId = undefined;
  dateRange.value = [];
  searchForm.startDate = undefined;
  searchForm.endDate = undefined;
  loadStatistics();
}

// 返回
function handleBack() {
  router.replace('/activity');
}

// 初始化图表
function initializeCharts() {
  initTypeChart();
  initStatusChart();
  initMonthChart();
}

// 初始化活动类型图表
function initTypeChart() {
  if (!typeChartContainer.value) return;

  // 销毁旧图表
  if (typeChart) {
    typeChart.dispose();
  }

  // 创建新图表
  typeChart = echarts.init(typeChartContainer.value);

  const { byType } = statisticsData.value;
  if (!byType || Object.keys(byType).length === 0) {
    console.log('没有类型数据');
    return;
  }

  // 将对象转换为数组
  const typeData = [];
  for (const [type, count] of Object.entries(byType)) {
    typeData.push({
      name: getActivityTypeName(Number(type)),
      value: count
    });
  }

  console.log('类型图表数据:', typeData);

  // 设置图表配置
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      top: '5%',
      left: 'center',
      data: typeData.map(item => item.name)
    },
    series: [
      {
        name: '活动类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
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
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: typeData
      }
    ]
  };

  // 渲染图表
  typeChart.setOption(option);
}

// 初始化活动状态图表
function initStatusChart() {
  if (!statusChartContainer.value) return;

  // 销毁旧图表
  if (statusChart) {
    statusChart.dispose();
  }

  // 创建新图表
  statusChart = echarts.init(statusChartContainer.value);

  const { byStatus } = statisticsData.value;
  if (!byStatus || Object.keys(byStatus).length === 0) {
    console.log('没有状态数据');
    return;
  }

  // 将对象转换为数组
  const statusData = [];
  for (const [status, count] of Object.entries(byStatus)) {
    statusData.push({
      name: getStatusName(Number(status)),
      value: count
    });
  }

  console.log('状态图表数据:', statusData);

  // 设置图表配置
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      top: '5%',
      left: 'center',
      data: statusData.map(item => item.name)
    },
    series: [
      {
        name: '活动状态',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
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
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: statusData
      }
    ]
  };

  // 渲染图表
  statusChart.setOption(option);
}

// 初始化月度活动图表
function initMonthChart() {
  if (!monthChartContainer.value) return;

  // 销毁旧图表
  if (monthChart) {
    monthChart.dispose();
  }

  // 创建新图表
  monthChart = echarts.init(monthChartContainer.value);

  const { byMonth } = statisticsData.value;
  if (!byMonth || Object.keys(byMonth).length === 0) {
    console.log('没有月度数据');
    return;
  }

  // 将对象转换为数组
  const months = Object.keys(byMonth).sort();
  const values = months.map(month => byMonth[month]);

  console.log('月度图表数据:', { months, values });

  // 设置图表配置
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months,
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '活动数量',
        type: 'bar',
        barWidth: '60%',
        data: values
      }
    ]
  };

  // 渲染图表
  monthChart.setOption(option);
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
</script>

<style scoped>
.statistics-container {
  padding: 16px;
}

.statistics-card {
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
  margin-bottom: 24px;
}

.stat-cards {
  margin-bottom: 24px;
}

.stat-card {
  height: 100px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.stat-card-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-card-label {
  font-size: 14px;
  color: #606266;
}

.total-card .stat-card-value {
  color: #409EFF;
}

.planned-card .stat-card-value {
  color: #909399;
}

.progress-card .stat-card-value {
  color: #E6A23C;
}

.completed-card .stat-card-value {
  color: #67C23A;
}

.chart-row {
  margin-bottom: 24px;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  font-size: 16px;
  font-weight: bold;
}

.chart-container {
  height: 300px;
}

.month-chart {
  height: 400px;
}
</style>
