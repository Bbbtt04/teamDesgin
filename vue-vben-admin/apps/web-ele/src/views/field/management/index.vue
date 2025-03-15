<script lang="ts" setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormRules, FormInstance } from 'element-plus';

// 导入API
import { getFieldList, createField, updateField, deleteField } from '#/api/farm';
import type { FieldInfo } from '#/api/farm';

const router = useRouter();

// 表格数据
const fieldList = ref<FieldInfo[]>([]);
const loading = ref(false);
const total = ref(0);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

// 搜索表单
const searchForm = ref({
  name: '',
  status: -1,
});

// 新增/编辑对话框
const dialogVisible = ref(false);
const dialogTitle = ref('新增大田');
const isEdit = ref(false);
const formRef = ref<FormInstance | null>(null);
const fieldForm = ref({
  id: '',
  name: '',
  address: '',
  manager: '',
  area: 0,
  areaUnit: '亩',
  status: 1,
  remark: '',
});

// 表单验证规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入大田名称', trigger: 'blur' }],
  address: [{ required: true, message: '请输入大田地址', trigger: 'blur' }],
  manager: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  area: [
    { required: true, message: '请输入面积', trigger: 'blur' },
    { type: 'number', message: '面积必须为数字', trigger: 'blur' },
  ],
};

// 状态选项
const statusOptions = [
  { label: '全部', value: -1 },
  { label: '正常', value: 1 },
  { label: '停用', value: 0 },
];

// 面积单位选项
const areaUnitOptions = [
  { label: '亩', value: '亩' },
  { label: '公顷', value: '公顷' },
  { label: '平方米', value: '平方米' },
];

// 获取大田列表
async function fetchFieldList() {
  loading.value = true;
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      name: searchForm.value.name,
    };

    // 只有当状态不为 -1 时才传递状态参数
    if (searchForm.value.status !== -1) {
      params.status = searchForm.value.status;
    }

    const res = await getFieldList(params);
    // 确保返回的数据符合预期格式
    console.log('Field list response:', res);
    fieldList.value = Array.isArray(res.items) ? res.items : [];
    total.value = res.total || 0;
  } catch (error) {
    console.error('获取大田列表失败', error);
    ElMessage.error('获取大田列表失败');
    fieldList.value = []; // 确保错误时也有空数组
  } finally {
    loading.value = false;
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1;
  fetchFieldList();
}

// 重置搜索
function resetSearch() {
  searchForm.value = {
    name: '',
    status: -1,
  };
  handleSearch();
}

// 新增
function handleAdd() {
  isEdit.value = false;
  dialogTitle.value = '新增大田';
  fieldForm.value = {
    id: '',
    name: '',
    address: '',
    manager: '',
    area: 0,
    areaUnit: '亩',
    status: 1,
    remark: '',
  };
  dialogVisible.value = true;
}

// 编辑
function handleEdit(row: FieldInfo) {
  isEdit.value = true;
  dialogTitle.value = '编辑大田';
  fieldForm.value = {
    id: row.id,
    name: row.name,
    address: row.address,
    manager: row.manager,
    area: row.area,
    areaUnit: row.areaUnit,
    status: row.status,
    remark: row.remark || '',
  };
  dialogVisible.value = true;
}

// 查看详情
function handleDetail(id: string) {
  router.push(`/field/detail/${id}`);
}

// 提交表单
async function submitForm() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    if (isEdit.value) {
      await updateField(fieldForm.value as any);
      ElMessage.success('更新成功');
    } else {
      await createField(fieldForm.value as any);
      ElMessage.success('新增成功');
    }

    dialogVisible.value = false;
    fetchFieldList();
  } catch (error) {
    console.error('提交表单失败', error);
    ElMessage.error('提交失败，请检查表单');
  }
}

// 删除
async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确认删除该大田信息?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });

    console.log('正在删除大田，ID:', id);
    const res = await deleteField(id);
    console.log('删除大田结果:', res);

    ElMessage.success('删除成功');
    fetchFieldList();
  } catch (error) {
    console.error('删除失败', error);
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
}

// 页码变化
function handlePageChange(page: number) {
  currentPage.value = page;
  fetchFieldList();
}

// 页大小变化
function handleSizeChange(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  fetchFieldList();
}

// 监听状态值变化
watch(() => searchForm.value.status, (newVal) => {
  console.log('状态值变化:', newVal);
  // 在变化时刷新列表
  fetchFieldList();
});

onMounted(async () => {
  // 确保初始状态值为 -1
  searchForm.value.status = -1;

  // 等待下一个DOM更新周期，确保选择框正确渲染
  await nextTick();

  // 获取数据
  fetchFieldList();
});
</script>

<template>
  <div class="field-management">
    <!-- 搜索区域 -->
    <el-card class="mb-4">
      <el-form :model="searchForm" inline>
        <el-form-item label="大田名称">
          <el-input v-model="searchForm.name" placeholder="请输入大田名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            :teleported="true"
            value-key="value"
            default-first-option
            popper-class="status-select-dropdown"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="success" @click="handleAdd">新增大田</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card>
      <el-table :data="fieldList" border stripe v-loading="loading" empty-text="暂无数据">
        <el-table-column type="index" width="50" label="序号" />
        <el-table-column prop="name" label="大田名称" min-width="120" />
        <el-table-column prop="address" label="地址" min-width="150" show-overflow-tooltip />
        <el-table-column prop="manager" label="负责人" width="100" />
        <el-table-column label="面积" width="120">
          <template #default="scope">
            {{ scope?.row?.area || 0 }} {{ scope?.row?.areaUnit || '亩' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag v-if="scope?.row" :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="scope">
            {{ scope?.row?.createTime ? new Date(scope.row.createTime).toLocaleString() : '' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
              <el-button type="primary" link @click="handleDetail(scope.row.id)">查看</el-button>
              <el-button type="primary" link @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
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

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="fieldForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="大田名称" prop="name">
          <el-input v-model="fieldForm.name" placeholder="请输入大田名称" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="fieldForm.address" placeholder="请输入大田地址" />
        </el-form-item>
        <el-form-item label="负责人" prop="manager">
          <el-input v-model="fieldForm.manager" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="面积" prop="area">
          <el-input-number v-model="fieldForm.area" :min="0" />
          <el-select v-model="fieldForm.areaUnit" class="ml-2">
            <el-option
              v-for="item in areaUnitOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="fieldForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="fieldForm.remark"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.field-management {
  padding: 20px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
:deep(.el-select) {
  width: 120px;
}

/* 添加全局样式确保下拉菜单样式正确 */
</style>

<style>

</style>
