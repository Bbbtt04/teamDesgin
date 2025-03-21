<script lang="ts" setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getAlertList,
  processAlert,
  ignoreAlert as ignoreAlertApi,
  assignAlert as assignAlertApi,
  type AlertInfo,
  type AlertQueryParams,
  AlertStatus,
  AlertLevel,
} from '#/api/alert';
import { getUserList,   type UserInfo } from '#/api/user';
import CreateAlert from './components/CreateAlert.vue';

// 表格数据
const alertList = ref<AlertInfo[]>([]);
const loading = ref(false);
const total = ref(0);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

// 搜索表单
const searchForm = reactive<AlertQueryParams>({
  keyword: '',
  status: -1,
  level: -1,
  assigneeId: '',
  dateRange: [],
});

// 告警状态选项
const statusOptions = [
  { label: '全部', value: -1 },
  { label: '未处理', value: 0 },
  { label: '已处理', value: 1 },
  { label: '已忽略', value: 2 },
];

// 告警级别选项
const levelOptions = [
  { label: '全部', value: -1 },
  { label: '一般', value: 0 },
  { label: '重要', value: 1 },
  { label: '紧急', value: 2 },
];

// 用户列表
const userList = ref<UserInfo[]>([]);
const assignDialogVisible = ref(false);
const currentAlertId = ref('');
const selectedAssigneeId = ref('');

// 创建告警对话框
const createAlertVisible = ref(false);

// 获取告警列表
async function fetchAlertList() {
  loading.value = true;
  try {
    const params: AlertQueryParams = {
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchForm.keyword,
      status: searchForm.status === -1 ? undefined : (searchForm.status as AlertStatus),
      level: searchForm.level === -1 ? undefined : (searchForm.level as AlertLevel),
      assigneeId: searchForm.assigneeId || undefined,
    };

    if (searchForm.dateRange?.length === 2) {
      params.startTime = searchForm.dateRange[0];
      params.endTime = searchForm.dateRange[1];
    }

    const res = await getAlertList(params);
    alertList.value = res.items;
    total.value = res.total;
  } catch (error) {
    console.error('获取告警列表失败', error);
    ElMessage.error('获取告警列表失败');
  } finally {
    loading.value = false;
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1;
  fetchAlertList();
}

// 重置搜索
function resetSearch() {
  searchForm.keyword = '';
  searchForm.status = -1;
  searchForm.level = -1;
  searchForm.assigneeId = '';
  searchForm.dateRange = [];
  handleSearch();
}

// 获取用户列表
async function fetchUserList() {
  try {
    const res = await getUserList();
    userList.value = res.items;
  } catch (error) {
    console.error('获取用户列表失败', error);
    ElMessage.error('获取用户列表失败');
  }
}

// 打开指派对话框
function openAssignDialog(id: string) {
  currentAlertId.value = id;
  selectedAssigneeId.value = '';
  fetchUserList();
  assignDialogVisible.value = true;
}

// 指派告警
async function assignAlert() {
  if (!selectedAssigneeId.value) {
    ElMessage.warning('请选择指派人');
    return;
  }

  try {
    await assignAlertApi({
      id: currentAlertId.value,
      assigneeId: selectedAssigneeId.value,
    });
    ElMessage.success('指派成功');
    assignDialogVisible.value = false;
    fetchAlertList();
  } catch (error) {
    console.error('指派告警失败', error);
    ElMessage.error('指派告警失败');
  }
}

// 处理告警
async function handleAlert(id: string) {
  try {
    await ElMessageBox.confirm('确认处理该告警?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await processAlert(id);
    ElMessage.success('处理成功');
    fetchAlertList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('处理失败');
    }
  }
}

// 忽略告警
async function ignoreAlert(id: string) {
  try {
    await ElMessageBox.confirm('确认忽略该告警?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await ignoreAlertApi(id);
    ElMessage.success('已忽略');
    fetchAlertList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败');
    }
  }
}

// 页码变化
function handlePageChange(page: number) {
  currentPage.value = page;
  fetchAlertList();
}

// 页大小变化
function handleSizeChange(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  fetchAlertList();
}

// 获取告警级别样式
function getAlertLevelType(level: AlertLevel) {
  switch (level) {
    case AlertLevel.NORMAL:
      return 'info';
    case AlertLevel.IMPORTANT:
      return 'warning';
    case AlertLevel.URGENT:
      return 'danger';
    default:
      return 'info';
  }
}

// 获取告警级别文本
function getAlertLevelText(level: AlertLevel) {
  switch (level) {
    case AlertLevel.NORMAL:
      return '一般';
    case AlertLevel.IMPORTANT:
      return '重要';
    case AlertLevel.URGENT:
      return '紧急';
    default:
      return '未知';
  }
}

// 处理创建成功
function handleCreateSuccess() {
  fetchAlertList();
}

onMounted(() => {
  fetchAlertList();
  fetchUserList();
});
</script>

<template>
  <div class="alert-management">
    <!-- 搜索区域 -->
    <el-card class="mb-4">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="告警内容/设备名称/指派人"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部"
            class="!w-[180px]"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="级别">
          <el-select
            v-model="searchForm.level"
            placeholder="全部"
            class="!w-[180px]"
          >
            <el-option
              v-for="item in levelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="指派人">
          <el-select
            v-model="searchForm.assigneeId"
            placeholder="全部"
            clearable
            class="!w-[180px]"
          >
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.realName"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
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
        <el-button type="primary" @click="createAlertVisible = true">
          创建告警
        </el-button>
      </div>

      <el-table
        :data="alertList"
        border
        stripe
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column type="index" width="50" label="序号" />
        <el-table-column prop="title" label="告警标题" min-width="120" show-overflow-tooltip />
        <el-table-column prop="content" label="告警内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="设备名称" min-width="120">
          <template #default="scope">
            {{ scope.row.equipment?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="大田" width="120">
          <template #default="scope">
            {{ scope.row.field?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="分区" width="120">
          <template #default="scope">
            {{ scope.row.section?.name || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="指派人" width="120">
          <template #default="scope">
            <div v-if="scope.row.assignee" class="flex items-center">
              <el-avatar :size="24" class="mr-2">{{ scope.row.assignee.realName?.charAt(0) || '?' }}</el-avatar>
              <span>{{ scope.row.assignee.realName }}</span>
            </div>
            <span v-else class="text-gray">未指派</span>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="告警级别" width="100">
          <template #default="scope">
            <el-tag
              :type="getAlertLevelType(scope.row.level)"
              effect="light"
            >
              {{ getAlertLevelText(scope.row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === AlertStatus.PENDING ? 'danger' : scope.row.status === AlertStatus.PROCESSED ? 'success' : 'info'"
            >
              {{ scope.row.status === AlertStatus.PENDING ? '未处理' : scope.row.status === AlertStatus.PROCESSED ? '已处理' : '已忽略' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="告警时间" width="160">
          <template #default="scope">
            {{ scope.row.createdAt ? new Date(scope.row.createdAt).toLocaleString() : '' }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="160">
          <template #default="scope">
            {{ scope.row.updatedAt ? new Date(scope.row.updatedAt).toLocaleString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <template v-if="scope.row.status === AlertStatus.PENDING">
              <el-button
                type="primary"
                link
                @click="handleAlert(scope.row.id)"
              >
                处理
              </el-button>
              <el-button
                type="warning"
                link
                @click="openAssignDialog(scope.row.id)"
              >
                指派
              </el-button>
              <el-button
                type="info"
                link
                @click="ignoreAlert(scope.row.id)"
              >
                忽略
              </el-button>
            </template>
            <template v-else>
              <span class="text-gray">已处理</span>
            </template>
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

    <!-- 创建告警对话框 -->
    <create-alert
      v-model:visible="createAlertVisible"
      @success="handleCreateSuccess"
    />

    <!-- 指派告警对话框 -->
    <el-dialog
      v-model="assignDialogVisible"
      title="指派告警"
      width="500px"
    >
      <el-form>
        <el-form-item label="指派给" required>
          <el-select v-model="selectedAssigneeId" placeholder="请选择指派人" style="width: 100%">
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.realName"
              :value="user.id"
            >
              <div class="flex items-center">
                <el-avatar :size="24" class="mr-2">{{ user.realName.charAt(0) }}</el-avatar>
                <span>{{ user.realName }}</span>
                <span class="text-gray ml-2">({{ user.department }})</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="assignAlert">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.alert-management {
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

.text-gray {
  color: #909399;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.mr-2 {
  margin-right: 8px;
}

.ml-2 {
  margin-left: 8px;
}
</style>
