<template>
  <div class="equipment-container">
    <el-card class="equipment-card">
      <template #header>
        <div class="card-header">
          <span class="title">农机设备管理</span>
          <div class="actions">
            <el-button type="primary" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              添加设备
            </el-button>
          </div>
        </div>
      </template>

      <div class="search-form">
        <el-form :model="searchForm" inline>
          <el-form-item label="设备名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入设备名称"
              clearable
              style="width: 180px"
            />
          </el-form-item>
          <el-form-item label="设备类型">
            <el-select
              v-model="searchForm.type"
              placeholder="请选择设备类型"
              clearable
              style="width: 180px"
            >
              <el-option
                v-for="(label, value) in typeMap"
                :key="value"
                :label="label"
                :value="Number(value)"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="设备状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择设备状态"
              clearable
              style="width: 180px"
            >
              <el-option
                v-for="(item, value) in statusMap"
                :key="value"
                :label="item.text"
                :value="Number(value)"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="所属农场">
            <el-select
              v-model="searchForm.fieldId"
              placeholder="请选择农场"
              clearable
              style="width: 180px"
            >
              <el-option
                v-for="item in fieldOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table
        v-loading="loading"
        :data="equipmentList"
        border
        style="width: 100%"
      >
        <el-table-column type="index" width="60" label="序号" />
        <el-table-column prop="name" label="设备名称" width="180" />
        <el-table-column label="设备类型" width="150">
          <template #default="{ row }">
            {{ typeMap[row.type as EquipmentType] || '未知类型' }}
          </template>
        </el-table-column>
        <el-table-column prop="model" label="型号" width="120" />
        <el-table-column prop="serialNumber" label="序列号" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status as EquipmentStatus)">
              {{ getStatusText(row.status as EquipmentStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="电池电量" width="120">
          <template #default="{ row }">
            <div v-if="row.batteryLevel !== undefined">
              <el-progress
                :percentage="row.batteryLevel"
                :color="getBatteryColor(row.batteryLevel)"
              />
            </div>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="最后上报时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.lastReportTime) }}
          </template>
        </el-table-column>
        <el-table-column label="安装时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.installTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="190">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm
              title="确定要删除此设备吗？"
              width="200px"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button link type="danger">删除</el-button>
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
      <equipment-modal
        :form-data="currentEquipment"
        :is-edit="isEdit"
        @submit="handleFormSubmit"
        @cancel="formModalVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { getEquipmentList, deleteEquipment } from '#/api/equipment';
import { formatDateTime } from '#/utils/formatTime';
import { EquipmentStatus, EquipmentType } from '#/api/equipment/model';
import type { Equipment } from '#/api/equipment/model';
import type { TagProps } from 'element-plus';
import EquipmentModal from './components/EquipmentModal.vue';

const router = useRouter();
const loading = ref(false);
const formModalVisible = ref(false);
const isEdit = ref(false);
const currentEquipment = ref<Partial<Equipment>>({});

// 设备列表数据
const equipmentList = ref<Equipment[]>([]);

// 表单标题
const formModalTitle = computed(() => isEdit.value ? '编辑设备' : '新增设备');

// 分页参数
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
});

// 搜索表单
const searchForm = reactive({
  name: '',
  type: undefined as EquipmentType | undefined,
  status: undefined as EquipmentStatus | undefined,
  fieldId: undefined as string | undefined
});

// 设备状态映射
const statusMap: Record<EquipmentStatus, { type: TagProps['type']; text: string }> = {
  [EquipmentStatus.ONLINE]: { type: 'success', text: '在线' },
  [EquipmentStatus.OFFLINE]: { type: 'info', text: '离线' },
  [EquipmentStatus.FAULT]: { type: 'danger', text: '故障' },
  [EquipmentStatus.MAINTENANCE]: { type: 'warning', text: '维护中' },
};

// 设备类型映射
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

// 农场选项（需要替换为实际的API调用）
const fieldOptions = ref([
  { label: '农场1', value: '1' },
  { label: '农场2', value: '2' },
  { label: '农场3', value: '3' },
]);

// 获取设备状态类型
const getStatusType = (status: EquipmentStatus): TagProps['type'] => {
  return statusMap[status]?.type || 'info';
};

// 获取设备状态文本
const getStatusText = (status: EquipmentStatus): string => {
  return statusMap[status]?.text || '未知';
};

// 获取电池颜色
const getBatteryColor = (level: number): string => {
  if (level < 20) return '#f56c6c';
  if (level < 60) return '#e6a23c';
  return '#67c23a';
};

// 加载设备列表数据
async function loadData() {
  try {
    loading.value = true;
    const { current, pageSize } = pagination;
    const params = {
      page: current,
      pageSize,
      ...searchForm
    };
    const data = await getEquipmentList(params);
    equipmentList.value = data.items || [];
    pagination.total = data.total || 0;
  } catch (error) {
    console.error('加载设备列表失败', error);
    ElMessage.error('加载设备列表失败');
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
  searchForm.name = '';
  searchForm.type = undefined;
  searchForm.status = undefined;
  searchForm.fieldId = undefined;
  pagination.current = 1;
  loadData();
}

// 新增
function handleCreate() {
  isEdit.value = false;
  currentEquipment.value = {};
  formModalVisible.value = true;
}

// 查看详情
function handleView(row: Equipment) {
  router.push(`/equipment/detail/${row.id}`);
}

// 编辑
function handleEdit(row: Equipment) {
  isEdit.value = true;
  currentEquipment.value = { ...row };
  formModalVisible.value = true;
}

// 删除
async function handleDelete(id: string) {
  try {
    await deleteEquipment(id);
    ElMessage.success('删除成功');
    loadData();
  } catch (error) {
    console.error('删除失败', error);
    ElMessage.error('删除失败');
  }
}

// 表单提交
function handleFormSubmit() {
  formModalVisible.value = false;
  ElMessage.success(isEdit.value ? '编辑成功' : '新增成功');
  loadData();
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

// 初始化加载数据
loadData();
</script>

<style lang="less" scoped>
.equipment-container {
  padding: 16px;
}

.equipment-card {
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
