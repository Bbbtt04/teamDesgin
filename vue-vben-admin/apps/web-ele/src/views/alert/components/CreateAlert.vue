<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    title="创建告警"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="设备名称" prop="deviceName">
        <el-input
          v-model="formData.deviceName"
          placeholder="请输入设备名称"
        />
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
      <el-form-item label="指派人" prop="assignee">
        <el-select
          v-model="formData.assignee"
          placeholder="请选择指派人"
          class="w-full"
          filterable
        >
          <el-option
            v-for="item in userOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <div class="flex items-center">
              <el-avatar :size="24" class="mr-2">{{ item.label.charAt(0) }}</el-avatar>
              <span>{{ item.label }}</span>
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

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}>();

// 表单数据
const formData = reactive<CreateAlertParams>({
  deviceName: '',
  level: undefined as unknown as AlertLevel,
  content: '',
  assignee: '',
});

// 表单校验规则
const rules = {
  deviceName: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  level: [{ required: true, message: '请选择告警级别', trigger: 'change' }],
  assignee: [{ required: true, message: '请选择指派人', trigger: 'change' }],
  content: [{ required: true, message: '请输入告警内容', trigger: 'blur' }],
};

// 告警级别选项
const levelOptions = [
  { label: '一般', value: AlertLevel.NORMAL },
  { label: '重要', value: AlertLevel.IMPORTANT },
  { label: '紧急', value: AlertLevel.URGENT },
];

// 用户选项
const userOptions = ref<{ label: string; value: string }[]>([]);
const userSearchLoading = ref(false);

// 加载用户列表
async function loadUsers() {
  try {
    const data = await getUserList({
      status: 1, // 只获取启用状态的用户
    });
    userOptions.value = (data.items || []).map((user: { realName: any; username: any }) => ({
      label: `${user.realName}（${user.username}）`,
      value: user.realName,
    }));
  } catch (error) {
    console.error('加载用户列表失败', error);
    ElMessage.error('加载用户列表失败');
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
  userOptions.value = [];
}

// 初始化
onMounted(() => {
  loadUsers();
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

.w-full {
  width: 100%;
}
</style>
