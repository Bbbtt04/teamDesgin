<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getLogList,
  exportLogs,
  deleteLogs,
  clearLogs,
  type LogInfo,
  type LogQueryParams,
  OperationType,
  OperationStatus,
} from '#/api/log';

// 表格数据
const logList = ref<LogInfo[]>([]);
const loading = ref(false);
const total = ref(0);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

// 搜索表单
const searchForm = reactive<LogQueryParams>({
  username: '',
  operationType: undefined,
  status: undefined,
  module: '',
  dateRange: [],
});

// 操作类型选项
const operationTypeOptions = [
  { label: '查询', value: OperationType.QUERY },
  { label: '创建', value: OperationType.CREATE },
  { label: '更新', value: OperationType.UPDATE },
  { label: '删除', value: OperationType.DELETE },
  { label: '导出', value: OperationType.EXPORT },
  { label: '处理', value: OperationType.PROCESS },
  { label: '忽略', value: OperationType.IGNORE },
  { label: '登录', value: OperationType.LOGIN },
  { label: '登出', value: OperationType.LOGOUT },
];

// 操作状态选项
const operationStatusOptions = [
  { label: '成功', value: OperationStatus.SUCCESS },
  { label: '失败', value: OperationStatus.FAIL },
];

// 生成模拟数据
function generateMockLogs(count: number): LogInfo[] {
  const modules = ['用户管理', '角色管理', '设备管理', '告警管理', '日志管理'];
  const descriptions = [
    '查询列表',
    '创建记录',
    '更新记录',
    '删除记录',
    '导出数据',
    '处理告警',
    '忽略告警',
    '用户登录',
    '用户登出',
  ];
  const usernames = ['admin', 'user1', 'user2', 'user3', 'user4'];

  return Array.from({ length: count }, (_, index) => ({
    id: `log_${index + 1}`,
    username: usernames[Math.floor(Math.random() * usernames.length)] || 'unknown',
    operationType: Object.values(OperationType)[
      Math.floor(Math.random() * Object.values(OperationType).length)
    ] as OperationType,
    module: modules[Math.floor(Math.random() * modules.length)] || '未知模块',
    description: descriptions[Math.floor(Math.random() * descriptions.length)] || '未知操作',
    requestUrl: '/api/xxx',
    requestMethod: 'POST',
    requestParams: '{"page":1,"pageSize":10}',
    responseData: '{"code":0,"message":"success"}',
    status: Math.random() > 0.1 ? OperationStatus.SUCCESS : OperationStatus.FAIL,
    errorMessage: Math.random() > 0.1 ? undefined : '操作失败',
    ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
    browser: 'Chrome',
    os: 'Windows 10',
    createTime: new Date(
      Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
    ).toISOString(),
  }));
}

// 模拟数据
const mockLogs = generateMockLogs(100);

// 获取日志列表
async function fetchLogList() {
  loading.value = true;
  try {
    const params: LogQueryParams = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm,
    };

    // 筛选数据
    let filteredLogs = [...mockLogs];

    if (params.username && params.username.trim()) {
      filteredLogs = filteredLogs.filter((log) =>
        log.username.toLowerCase().includes(params.username!.toLowerCase())
      );
    }

    if (params.operationType) {
      filteredLogs = filteredLogs.filter((log) => log.operationType === params.operationType);
    }

    if (params.status) {
      filteredLogs = filteredLogs.filter((log) => log.status === params.status);
    }

    if (params.module && params.module.trim()) {
      filteredLogs = filteredLogs.filter((log) =>
        log.module.toLowerCase().includes(params.module!.toLowerCase())
      );
    }

    if (params.startTime && params.endTime) {
      const start = new Date(params.startTime).getTime();
      const end = new Date(params.endTime).getTime();
      filteredLogs = filteredLogs.filter((log) => {
        const time = new Date(log.createTime).getTime();
        return time >= start && time <= end;
      });
    }

    // 排序：按创建时间倒序
    filteredLogs.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());

    // 分页
    const start = ((params.page || 1) - 1) * (params.pageSize || 10);
    const end = start + (params.pageSize || 10);
    const items = filteredLogs.slice(start, end);

    logList.value = items;
    total.value = filteredLogs.length;
  } catch (error) {
    console.error('获取日志列表失败', error);
    ElMessage.error('获取日志列表失败');
  } finally {
    loading.value = false;
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1;
  fetchLogList();
}

// 重置搜索
function resetSearch() {
  searchForm.username = '';
  searchForm.operationType = undefined;
  searchForm.status = undefined;
  searchForm.module = '';
  searchForm.dateRange = [];
  handleSearch();
}

// 导出日志
async function handleExport() {
  try {
    loading.value = true;
    const params: LogQueryParams = { ...searchForm };
    if (searchForm.dateRange?.length === 2) {
      params.startTime = searchForm.dateRange[0];
      params.endTime = searchForm.dateRange[1];
    }

    // 生成CSV数据
    const headers = [
      '用户名',
      '操作类型',
      '模块',
      '操作描述',
      '状态',
      'IP地址',
      '浏览器',
      '操作系统',
      '操作时间',
    ].join(',');

    const rows = mockLogs
      .map(
        (log) =>
          `${log.username},${log.operationType},${log.module},${log.description},${log.status},${log.ip},${log.browser},${log.os},${new Date(
            log.createTime
          ).toLocaleString()}`
      )
      .join('\n');

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `操作日志_${new Date().toLocaleString()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败', error);
    ElMessage.error('导出失败');
  } finally {
    loading.value = false;
  }
}

// 删除日志
async function handleDelete(ids: string[]) {
  try {
    await ElMessageBox.confirm('确认删除选中的日志记录?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 从模拟数据中删除
    ids.forEach((id) => {
      const index = mockLogs.findIndex((log) => log.id === id);
      if (index !== -1) {
        mockLogs.splice(index, 1);
      }
    });

    ElMessage.success('删除成功');
    fetchLogList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败', error);
      ElMessage.error('删除失败');
    }
  }
}

// 清空日志
async function handleClear() {
  try {
    await ElMessageBox.confirm('确认清空所有日志记录?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 清空模拟数据
    mockLogs.length = 0;
    ElMessage.success('清空成功');
    fetchLogList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空失败', error);
      ElMessage.error('清空失败');
    }
  }
}

// 页码变化
function handlePageChange(page: number) {
  currentPage.value = page;
  fetchLogList();
}

// 页大小变化
function handleSizeChange(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  fetchLogList();
}

// 获取操作类型文本
function getOperationTypeText(type: OperationType) {
  const option = operationTypeOptions.find(item => item.value === type);
  return option?.label || type;
}

// 获取操作状态样式
function getOperationStatusType(status: OperationStatus) {
  return status === OperationStatus.SUCCESS ? 'success' : 'danger';
}

onMounted(() => {
  fetchLogList();
});
</script>

<template>
  <div class="log-management">
    <!-- 搜索区域 -->
    <el-card class="mb-4">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select
            v-model="searchForm.operationType"
            placeholder="请选择操作类型"
            clearable
          >
            <el-option
              v-for="item in operationTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择操作状态"
            clearable
          >
            <el-option
              v-for="item in operationStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="模块">
          <el-input
            v-model="searchForm.module"
            placeholder="请输入模块名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card>
      <div class="mb-4">
        <el-button type="primary" @click="handleExport">导出</el-button>
        <el-button type="danger" @click="handleClear">清空</el-button>
      </div>

      <el-table
        :data="logList"
        border
        stripe
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" width="50" label="序号" />
        <el-table-column prop="username" label="用户名" min-width="100" />
        <el-table-column prop="module" label="模块" min-width="100" />
        <el-table-column prop="operationType" label="操作类型" width="100">
          <template #default="scope">
            {{ getOperationTypeText(scope.row.operationType) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="操作描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="getOperationStatusType(scope.row.status)">
              {{ scope.row.status === OperationStatus.SUCCESS ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP地址" width="120" />
        <el-table-column prop="createTime" label="操作时间" width="160">
          <template #default="scope">
            {{ scope.row.createTime ? new Date(scope.row.createTime).toLocaleString() : '' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button
              type="danger"
              link
              @click="handleDelete([scope.row.id])"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-if="total > 0"
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.log-management {
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.el-table) {
  margin-top: 0;
}

:deep(.el-select) {
  width: 180px;
}

:deep(.el-input) {
  width: 180px;
}

:deep(.el-date-editor) {
  width: 240px;
}
</style>
