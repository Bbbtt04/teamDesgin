<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
    @submit.prevent
  >
    <el-form-item label="设备名称" prop="name">
      <el-input v-model="form.name" placeholder="请输入设备名称" />
    </el-form-item>
    <el-form-item label="设备类型" prop="type">
      <el-select v-model="form.type" placeholder="请选择设备类型" style="width: 100%">
        <el-option
          v-for="(label, value) in typeMap"
          :key="value"
          :label="label"
          :value="Number(value)"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="设备型号" prop="model">
      <el-input v-model="form.model" placeholder="请输入设备型号" />
    </el-form-item>
    <el-form-item label="序列号" prop="serialNumber">
      <el-input v-model="form.serialNumber" placeholder="请输入序列号" />
    </el-form-item>
    <el-form-item label="所属农场" prop="fieldId">
      <el-select v-model="form.fieldId" placeholder="请选择农场" style="width: 100%">
        <el-option
          v-for="item in fieldOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="设备状态" prop="status">
      <el-select v-model="form.status" placeholder="请选择设备状态" style="width: 100%">
        <el-option
          v-for="(item, value) in statusMap"
          :key="value"
          :label="item.text"
          :value="Number(value)"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="制造商" prop="manufacturer">
      <el-input v-model="form.manufacturer" placeholder="请输入制造商" />
    </el-form-item>
    <el-form-item label="安装时间" prop="installTime">
      <el-date-picker
        v-model="form.installTime"
        type="datetime"
        placeholder="请选择安装时间"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item label="IP地址">
      <el-input v-model="form.ipAddress" placeholder="请输入IP地址" />
    </el-form-item>
    <el-form-item label="设备描述">
      <el-input
        v-model="form.description"
        type="textarea"
        :rows="3"
        placeholder="请输入设备描述"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
      <el-button @click="$emit('cancel')">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import type { FormInstance } from 'element-plus';
import { EquipmentStatus, EquipmentType } from '#/api/equipment/model';
import type { Equipment } from '#/api/equipment/model';

const props = defineProps<{
  formData?: Partial<Equipment>;
  isEdit?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit'): void;
  (e: 'cancel'): void;
}>();

const formRef = ref<FormInstance>();

// 表单数据
const form = reactive<Partial<Equipment>>({
  name: '',
  type: undefined,
  model: '',
  serialNumber: '',
  fieldId: undefined,
  status: undefined,
  manufacturer: '',
  installTime: '',
  ipAddress: '',
  description: '',
  ...props.formData,
});

// 设备状态映射
const statusMap = {
  [EquipmentStatus.ONLINE]: { text: '在线' },
  [EquipmentStatus.OFFLINE]: { text: '离线' },
  [EquipmentStatus.FAULT]: { text: '故障' },
  [EquipmentStatus.MAINTENANCE]: { text: '维护中' },
};

// 设备类型映射
const typeMap = {
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
const fieldOptions = [
  { label: '农场1', value: '1' },
  { label: '农场2', value: '2' },
  { label: '农场3', value: '3' },
];

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  model: [{ required: true, message: '请输入设备型号', trigger: 'blur' }],
  serialNumber: [{ required: true, message: '请输入序列号', trigger: 'blur' }],
  fieldId: [{ required: true, message: '请选择所属农场', trigger: 'change' }],
  status: [{ required: true, message: '请选择设备状态', trigger: 'change' }],
  manufacturer: [{ required: true, message: '请输入制造商', trigger: 'blur' }],
  installTime: [{ required: true, message: '请选择安装时间', trigger: 'change' }],
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate();
  emit('submit');
};
</script>
