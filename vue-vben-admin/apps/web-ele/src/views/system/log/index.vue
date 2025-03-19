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
  startTime: '',
  endTime: '',
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

// 获取日志列表
async function fetchLogList() {
  loading.value = true;
  try {
    const params: LogQueryParams = {
      page: currentPage.value,
      pageSize: pageSize.value,
      ...searchForm,
    };

    const res = await getLogList(params);
    if (res.data) {
      logList.value = res.data.items;
      total.value = res.data.total;
    }
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
  searchForm.startTime = '';
  searchForm.endTime = '';
  handleSearch();
}

// 导出日志
async function handleExport() {
  try {
    loading.value = true;
    const params: LogQueryParams = { ...searchForm };
    const res = await exportLogs(params);
    
    // 创建下载链接
    const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `操作日志_${new Date().toLocaleString()}.xlsx`;
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

    await deleteLogs(ids);
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

    await clearLogs();
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
            @change="(val) => {
              if (val) {
                searchForm.startTime = val[0];
                searchForm.endTime = val[1];
              } else {
                searchForm.startTime = '';
                searchForm.endTime = '';
              }
            }"
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
