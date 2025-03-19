<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    title="创建告警"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="告警标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入告警标题"
        />
      </el-form-item>
      <el-form-item label="告警类型" prop="type">
        <el-select
          v-model="formData.type"
          placeholder="请选择告警类型"
          class="w-full"
        >
          <el-option label="设备告警" :value="1" />
          <el-option label="系统告警" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="告警来源" prop="source">
        <el-select
          v-model="formData.source"
          placeholder="请选择告警来源"
          class="w-full"
        >
          <el-option label="系统检测" :value="0" />
          <el-option label="设备上报" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="告警级别" prop="level">
        <el-select
          v-model="formData.level"
          placeholder="请选择告警级别"
          class="w-full"
        >
          <el-option
            v-for="item in levelOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="关联大田" prop="fieldId">
        <el-select
          v-model="formData.fieldId"
          placeholder="请选择大田"
          class="w-full"
          clearable
          filterable
          @change="handleFieldChange"
        >
          <el-option
            v-for="field in fieldOptions"
            :key="field.id"
            :label="field.name"
            :value="field.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="关联分区" prop="sectionId">
        <el-select
          v-model="formData.sectionId"
          placeholder="请选择分区"
          class="w-full"
          clearable
          filterable
          :disabled="!formData.fieldId"
        >
          <el-option
            v-for="section in sectionOptions"
            :key="section.id"
            :label="section.name"
            :value="section.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="关联设备" prop="equipmentId">
        <el-select
          v-model="formData.equipmentId"
          placeholder="请选择设备"
          class="w-full"
          clearable
          filterable
        >
          <el-option
            v-for="equipment in equipmentOptions"
            :key="equipment.id"
            :label="equipment.name"
            :value="equipment.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="指派人" prop="assigneeId">
        <el-select
          v-model="formData.assigneeId"
          placeholder="请选择指派人"
          class="w-full"
          filterable
        >
          <el-option
            v-for="user in userOptions"
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
      <el-form-item label="告警内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="4"
          placeholder="请输入告警内容"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance } from 'element-plus';
import { ElMessage } from 'element-plus';
import { createAlert, type CreateAlertParams, AlertLevel } from '#/api/alert';
import { getUserList } from '#/api/user';
import { getFieldList } from '#/api/farm';
import { getEquipmentList } from '#/api/equipment';

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}>();

// 表单数据
const formData = reactive<CreateAlertParams>({
  title: '',
  type: 1,
  source: 0,
  level: undefined as unknown as AlertLevel,
  content: '',
  fieldId: '',
  sectionId: '',
  equipmentId: '',
  assigneeId: '',
});

// 表单校验规则
const rules = {
  title: [{ required: true, message: '请输入告警标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择告警类型', trigger: 'change' }],
  source: [{ required: true, message: '请选择告警来源', trigger: 'change' }],
  level: [{ required: true, message: '请选择告警级别', trigger: 'change' }],
  content: [{ required: true, message: '请输入告警内容', trigger: 'blur' }],
};

// 告警级别选项
const levelOptions = [
  { label: '一般', value: AlertLevel.NORMAL },
  { label: '重要', value: AlertLevel.IMPORTANT },
  { label: '紧急', value: AlertLevel.URGENT },
];

// 用户选项
const userOptions = ref<{ id: string; realName: string; department?: string }[]>([]);

// 大田选项
const fieldOptions = ref<{ id: string; name: string }[]>([]);

// 分区选项
const sectionOptions = ref<{ id: string; name: string }[]>([]);

// 设备选项
const equipmentOptions = ref<{ id: string; name: string }[]>([]);

// 加载用户列表
async function loadUsers() {
  try {
    const data = await getUserList({
      status: 1, // 只获取启用状态的用户
    });
    userOptions.value = data.items || [];
  } catch (error) {
    console.error('加载用户列表失败', error);
    ElMessage.error('加载用户列表失败');
  }
}

// 加载大田列表
async function loadFields() {
  try {
    const data = await getFieldList({
      status: 1, // 只获取启用状态的大田
    });
    fieldOptions.value = data.items || [];
  } catch (error) {
    console.error('加载大田列表失败', error);
    ElMessage.error('加载大田列表失败');
  }
}

// 加载设备列表
async function loadEquipment() {
  try {
    const data = await getEquipmentList({
      status: 1, // 只获取启用状态的设备
    });
    equipmentOptions.value = data.items || [];
  } catch (error) {
    console.error('加载设备列表失败', error);
    ElMessage.error('加载设备列表失败');
  }
}

// 大田变化时加载分区
async function handleFieldChange(fieldId: string) {
  formData.sectionId = '';
  sectionOptions.value = [];
  
  if (!fieldId) return;

  try {
    const data = await getFieldList({
      parentId: fieldId,
      status: 1,
    });
    sectionOptions.value = data.items || [];
  } catch (error) {
    console.error('加载分区列表失败', error);
    ElMessage.error('加载分区列表失败');
  }
}

const formRef = ref<FormInstance>();
const loading = ref(false);

// 提交表单
async function handleSubmit() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    await createAlert(formData);
    ElMessage.success('创建成功');
    emit('success');
    handleClose();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('创建告警失败:', error);
      ElMessage.error('创建失败');
    }
  } finally {
    loading.value = false;
  }
}

// 关闭对话框
function handleClose() {
  emit('update:visible', false);
  if (formRef.value) {
    formRef.value.resetFields();
  }
}

// 初始化
onMounted(() => {
  loadUsers();
  loadFields();
  loadEquipment();
});
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-select-dropdown__item) {
  padding: 0 12px;
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

.w-full {
  width: 100%;
}

.text-gray {
  color: #909399;
}
</style>
