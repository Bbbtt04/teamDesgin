<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormRules, FormInstance } from 'element-plus';
import { ArrowLeftBold } from '@element-plus/icons-vue';

// 导入API
import { getFieldDetail, getFieldSectionList, createFieldSection, updateFieldSection, deleteFieldSection } from '#/api/farm';
import type { FieldInfo, FieldSection } from '#/api/farm';

const route = useRoute();
const router = useRouter();
const fieldId = ref(route.params.id as string);

// 大田详情
const fieldInfo = ref<FieldInfo | null>(null);
const loading = ref(false);

// 分区数据
const sectionList = ref<FieldSection[]>([]);
const sectionLoading = ref(false);

// 新增/编辑分区对话框
const dialogVisible = ref(false);
const dialogTitle = ref('新增分区');
const isEdit = ref(false);
const formRef = ref<FormInstance | null>(null);
const sectionForm = ref({
  id: '',
  fieldId: '',
  name: '',
  area: 0,
  areaUnit: '亩',
  cropType: '',
  status: 1,
  remark: '',
});

// 表单验证规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入分区名称', trigger: 'blur' }],
  area: [
    { required: true, message: '请输入面积', trigger: 'blur' },
    { type: 'number', message: '面积必须为数字', trigger: 'blur' },
  ],
};

// 状态选项
const statusOptions = [
  { label: '正常', value: 1 },
  { label: '停用', value: 0 },
];

// 面积单位选项
const areaUnitOptions = [
  { label: '亩', value: '亩' },
  { label: '公顷', value: '公顷' },
  { label: '平方米', value: '平方米' },
];

// 获取大田详情
async function fetchFieldDetail() {
  loading.value = true;
  try {
    const res = await getFieldDetail(fieldId.value);
    console.log('Field detail response:', res);
    console.log('Field detail type:', typeof res);
    console.log('Field detail properties:', Object.keys(res || {}));

    fieldInfo.value = res;

    if (!fieldInfo.value) {
      ElMessage.warning('未找到大田详情数据');
    }
  } catch (error) {
    console.error('获取大田详情失败', error);
    ElMessage.error('获取大田详情失败');
    fieldInfo.value = null;
  } finally {
    loading.value = false;
  }
}

// 获取分区列表
async function fetchSectionList() {
  sectionLoading.value = true;
  try {
    const res = await getFieldSectionList(fieldId.value);
    console.log('Section list response:', res);
    sectionList.value = Array.isArray(res) ? res : [];
  } catch (error) {
    console.error('获取分区列表失败', error);
    ElMessage.error('获取分区列表失败');
    sectionList.value = []; // 确保错误时也有空数组
  } finally {
    sectionLoading.value = false;
  }
}

// 返回列表
function goBack() {
  router.push('/field/management');
}

// 新增分区
function handleAddSection() {
  isEdit.value = false;
  dialogTitle.value = '新增分区';
  sectionForm.value = {
    id: '',
    fieldId: fieldId.value,
    name: '',
    area: 0,
    areaUnit: '亩',
    cropType: '',
    status: 1,
    remark: '',
  };
  dialogVisible.value = true;
}

// 编辑分区
function handleEditSection(row: FieldSection) {
  isEdit.value = true;
  dialogTitle.value = '编辑分区';
  // 只提取需要编辑的字段
  sectionForm.value = {
    id: row.id,
    fieldId: row.fieldId,
    name: row.name,
    area: row.area,
    areaUnit: row.areaUnit,
    cropType: row.cropType || '',
    status: row.status,
    remark: row.remark || '',
  };
  dialogVisible.value = true;
}

// 提交分区表单
async function submitSectionForm() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    if (isEdit.value) {
      // 更新时只提交表单中的字段
      await updateFieldSection(sectionForm.value as any);
      ElMessage.success('更新成功');
    } else {
      // 创建时只提交表单中的字段
      await createFieldSection(sectionForm.value as any);
      ElMessage.success('新增成功');
    }

    dialogVisible.value = false;
    fetchSectionList();
  } catch (error) {
    console.error('提交表单失败', error);
    ElMessage.error('提交失败，请检查表单');
  }
}

// 删除分区
async function handleDeleteSection(id: string) {
  try {
    await ElMessageBox.confirm('确认删除该分区?', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await deleteFieldSection(id);
    ElMessage.success('删除成功');
    fetchSectionList();
  } catch (error) {
    console.error('删除失败', error);
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
}

onMounted(() => {
  if (fieldId.value) {
    fetchFieldDetail();
    fetchSectionList();
  } else {
    ElMessage.error('缺少必要参数，无法获取大田详情');
    router.push('/field/management');
  }
});
</script>

<template>
  <div class="field-detail" v-loading="loading">
    <!-- 头部 -->
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center">
        <el-button @click="goBack" :icon="ArrowLeftBold">返回</el-button>
        <h2 class="ml-4 text-xl font-bold">{{ fieldInfo?.name || '大田详情' }}</h2>
      </div>
    </div>

    <!-- 基本信息 -->
    <el-card class="mb-4">
      <template #header>
        <div class="flex items-center justify-between">
          <span>基本信息</span>
        </div>
      </template>

      <el-descriptions :column="3" border>
        <el-descriptions-item label="大田名称">{{ fieldInfo?.name }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ fieldInfo?.address }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ fieldInfo?.manager }}</el-descriptions-item>
        <el-descriptions-item label="面积">{{ fieldInfo?.area }} {{ fieldInfo?.areaUnit }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="fieldInfo?.status === 1 ? 'success' : 'danger'">
            {{ fieldInfo?.status === 1 ? '正常' : '停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ fieldInfo?.createTime ? new Date(fieldInfo.createTime).toLocaleString() : '' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ fieldInfo?.updateTime ? new Date(fieldInfo.updateTime).toLocaleString() : '' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ fieldInfo?.remark || '无' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 分区信息 -->
    <el-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span>分区信息</span>
          <el-button type="primary" @click="handleAddSection">新增分区</el-button>
        </div>
      </template>

      <el-table :data="sectionList" border stripe v-loading="sectionLoading" empty-text="暂无分区数据">
        <el-table-column type="index" width="50" label="序号" />
        <el-table-column prop="name" label="分区名称" min-width="120" />
        <el-table-column label="面积" width="120">
          <template #default="scope">
            {{ scope?.row?.area || 0 }} {{ scope?.row?.areaUnit || '亩' }}
          </template>
        </el-table-column>
        <el-table-column prop="cropType" label="种植作物" min-width="120">
          <template #default="scope">
            {{ scope?.row?.cropType || '暂无' }}
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
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <template v-if="scope?.row">
              <el-button type="primary" link @click="handleEditSection(scope.row)">编辑</el-button>
              <el-button type="danger" link @click="handleDeleteSection(scope.row.id)">删除</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑分区对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="sectionForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="分区名称" prop="name">
          <el-input v-model="sectionForm.name" placeholder="请输入分区名称" />
        </el-form-item>
        <el-form-item label="面积" prop="area">
          <el-input-number v-model="sectionForm.area" :min="0" />
          <el-select v-model="sectionForm.areaUnit" class="ml-2">
            <el-option
              v-for="item in areaUnitOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="种植作物" prop="cropType">
          <el-input v-model="sectionForm.cropType" placeholder="请输入种植作物" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="sectionForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="sectionForm.remark"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitSectionForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.field-detail {
  padding: 20px;
}
</style>
