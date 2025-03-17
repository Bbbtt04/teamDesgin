<template>
  <el-form
    ref="formRef"
    :model="formData"
    label-width="100px"
    :rules="rules"
  >
    <el-row :gutter="16">
      <el-col :span="12">
        <el-form-item label="大田" prop="fieldId">
          <el-select
            v-model="formData.fieldId"
            placeholder="请选择大田"
            style="width: 100%"
            :disabled="isEdit"
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
      </el-col>
      <el-col :span="12">
        <el-form-item label="分区" prop="sectionId">
          <el-select
            v-model="formData.sectionId"
            placeholder="请选择分区"
            style="width: 100%"
            :disabled="!formData.fieldId"
          >
            <el-option
              v-for="item in sectionOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入活动标题" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="活动类型" prop="activityType">
          <el-select
            v-model="formData.activityType"
            placeholder="请选择活动类型"
            style="width: 100%"
          >
            <el-option
              v-for="item in activityTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="formData.startTime"
            type="datetime"
            placeholder="请选择开始时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="formData.endTime"
            type="datetime"
            placeholder="请选择结束时间"
            style="width: 100%"
            :disabled="formData.status === ActivityStatus.PLANNED"
          />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="执行人" prop="executor">
          <el-select
            v-model="formData.executor"
            placeholder="请选择执行人"
            style="width: 100%"
            filterable
          >
            <el-option
              v-for="item in userOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="活动状态" prop="status">
          <el-select
            v-model="formData.status"
            placeholder="请选择活动状态"
            style="width: 100%"
            @change="handleStatusChange"
          >
            <el-option
              v-for="item in activityStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="24">
        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
          />
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item label="数据来源" prop="dataSource">
          <el-select
            v-model="formData.dataSource"
            placeholder="请选择数据来源"
            style="width: 100%"
          >
            <el-option
              v-for="item in dataSourceOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="24">
        <el-form-item label="使用农资" prop="materials">
          <el-select
            v-model="formData.materials"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请输入使用的农资，支持自定义"
            style="width: 100%"
          >
            <el-option
              v-for="item in materialOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="12" v-if="formData.status !== ActivityStatus.PLANNED">
        <el-form-item label="天气信息" prop="weatherInfo">
          <el-input v-model="formData.weatherInfo" placeholder="请输入天气信息" />
        </el-form-item>
      </el-col>

      <el-col :span="12" v-if="formData.status === ActivityStatus.COMPLETED">
        <el-form-item label="效果描述" prop="effectDescription">
          <el-input v-model="formData.effectDescription" placeholder="请输入效果描述" />
        </el-form-item>
      </el-col>

      <el-col :span="24">
        <el-form-item label="上传图片" prop="images">
          <el-upload
            list-type="picture-card"
            :auto-upload="false"
            :limit="5"
            multiple
            :file-list="uploadFileList"
            :on-change="handleUploadChange"
            :on-remove="handleRemove"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-col>

      <el-col :span="24">
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <div class="form-actions">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">提交</el-button>
    </div>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import type { FormInstance } from 'element-plus';
import {
  createActivity,
  updateActivity,
  getFieldList,
  getFieldSectionList,
  ActivityType,
  ActivityStatus,
  DataSource,
} from '#/api/activity';
import { getUserList } from '#/api/user';

interface FieldOption {
  label: string;
  value: string;
}

interface UploadFile {
  name: string;
  url?: string;
  raw?: File;
}

// 定义Props
const props = defineProps({
  formData: {
    type: Object,
    default: () => ({}),
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
});

// 定义Emits
const emit = defineEmits(['submit', 'cancel']);

// 表单引用
const formRef = ref<FormInstance>();
const loading = ref(false);

// 大田和分区选项
const fieldOptions = ref<FieldOption[]>([]);
const sectionOptions = ref<FieldOption[]>([]);

// 文件列表
const uploadFileList = ref<UploadFile[]>([]);

// 用户选项
const userOptions = ref<{ label: string; value: string }[]>([]);

// 表单数据
const formData = reactive({
  id: props.formData?.id || '',
  fieldId: props.formData?.fieldId || '',
  sectionId: props.formData?.sectionId || '',
  title: props.formData?.title || '',
  activityType: props.formData?.activityType !== undefined ? props.formData?.activityType : ActivityType.PLANTING,
  startTime: props.formData?.startTime || '',
  endTime: props.formData?.endTime || '',
  status: props.formData?.status !== undefined ? props.formData?.status : ActivityStatus.PLANNED,
  executor: props.formData?.executor || '',
  description: props.formData?.description || '',
  dataSource: props.formData?.dataSource !== undefined ? props.formData?.dataSource : DataSource.MANUAL,
  materials: props.formData?.materials || [],
  weatherInfo: props.formData?.weatherInfo || '',
  effectDescription: props.formData?.effectDescription || '',
  images: props.formData?.images || [],
  remark: props.formData?.remark || '',
});

// 农资选项
const materialOptions = [
  '复合肥', '氮肥', '磷肥', '钾肥', '有机肥',
  '杀虫剂', '杀菌剂', '除草剂',
  '水稻种子', '小麦种子', '玉米种子', '大豆种子',
  '灌溉设备', '收割机', '播种机', '拖拉机'
];

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

// 数据来源选项
const dataSourceOptions = computed(() => {
  return [
    { label: '手动录入', value: DataSource.MANUAL },
    { label: '设备采集', value: DataSource.DEVICE },
    { label: '系统生成', value: DataSource.SYSTEM },
  ];
});

// 表单验证规则
const rules = {
  fieldId: [{ required: true, message: '请选择大田', trigger: 'change' }],
  title: [{ required: true, message: '请输入活动标题', trigger: 'blur' }],
  activityType: [{ required: true, message: '请选择活动类型', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  status: [{ required: true, message: '请选择活动状态', trigger: 'change' }],
  executor: [{ required: true, message: '请输入执行人', trigger: 'blur' }],
  dataSource: [{ required: true, message: '请选择数据来源', trigger: 'change' }],
};

// 加载用户列表
async function loadUsers() {
  try {
    const data  = await getUserList({
      status: 1, // 只获取启用状态的用户
    });
    userOptions.value = (data.items || []).map((user: { realName: any; username: any }) => ({
      label: `${user.realName}（${user.username}）`,
      value: `${user.realName}`,
    }));
  } catch (error) {
    console.error('加载用户列表失败', error);
    ElMessage.error('加载用户列表失败');
  }
}

// 初始化
onMounted(async () => {
  await Promise.all([loadFields(), loadUsers()]);

  if (formData.fieldId) {
    await loadSections(formData.fieldId);
  }

  // 初始化上传文件列表
  if (formData.images && formData.images.length > 0) {
    uploadFileList.value = formData.images.map((url: string, index: number) => ({
      name: `image_${index + 1}.jpg`,
      url,
    }));
  }
});

// 监听状态变化
watch(() => formData.status, (value) => {
  if (value === ActivityStatus.PLANNED) {
    formData.endTime = '';
    formData.weatherInfo = '';
    formData.effectDescription = '';
  }
});

// 加载大田列表
async function loadFields() {
  try {
    const result = await getFieldList();
    fieldOptions.value = (result.items || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (error) {
    console.error('加载大田列表失败', error);
    ElMessage.error('加载大田列表失败');
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
    sectionOptions.value = (sections || []).map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (error) {
    console.error('加载分区列表失败', error);
    ElMessage.error('加载分区列表失败');
  }
}

// 处理大田选择
function handleFieldChange(value: string) {
  formData.sectionId = '';
  if (value) {
    loadSections(value);
  } else {
    sectionOptions.value = [];
  }
}

// 处理状态变化
function handleStatusChange(value: ActivityStatus) {
  if (value === ActivityStatus.PLANNED) {
    formData.endTime = '';
    formData.weatherInfo = '';
    formData.effectDescription = '';
  }
}

// 处理上传变化
function handleUploadChange(file: UploadFile, fileList: UploadFile[]) {
  uploadFileList.value = fileList;

  // 更新表单数据中的图片列表
  formData.images = fileList.map((file: UploadFile) => {
    if (file.url) {
      return file.url;
    } else if (file.raw) {
      // 在实际项目中，这里应该上传到服务器并返回URL
      return URL.createObjectURL(file.raw);
    }
    return '';
  }).filter(Boolean);
}

// 处理移除文件
function handleRemove(file: UploadFile, fileList: UploadFile[]) {
  uploadFileList.value = fileList;
  formData.images = fileList.map((file: UploadFile) => file.url || (file.raw ? URL.createObjectURL(file.raw) : '')).filter(Boolean);
}

// 取消
function handleCancel() {
  emit('cancel');
}

// 提交
async function handleSubmit() {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    loading.value = true;

    let activityResult;
    if (props.isEdit) {
      activityResult = await updateActivity(formData.id, formData);
    } else {
      activityResult = await createActivity(formData);
    }

    ElMessage.success(props.isEdit ? '编辑成功' : '新增成功');
    emit('submit', formData);
  } catch (error) {
    console.error('提交失败', error);
    ElMessage.error(props.isEdit ? '编辑失败' : '新增失败');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 12px;
}
</style>
