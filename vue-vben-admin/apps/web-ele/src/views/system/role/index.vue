<template>
  <div class="p-4">
    <div class="mb-4 flex justify-between">
      <el-button type="primary" @click="handleAdd">
        新增角色
      </el-button>
    </div>

    <el-table :data="roleList" border style="width: 100%">
      <el-table-column prop="code" label="角色编码" width="180" />
      <el-table-column prop="name" label="角色名称" width="180" />
      <el-table-column prop="description" label="角色描述" />
      <el-table-column label="权限" min-width="300">
        <template #default="{ row }">
          <el-tag
            v-for="permission in row.permissions"
            :key="permission"
            class="mr-2 mb-2"
            :type="getPermissionTagType(permission)"
          >
            {{ getPermissionName(permission) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 角色编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="权限配置" prop="permissions">
          <el-checkbox-group v-model="formData.permissions">
            <el-checkbox label="system">系统管理</el-checkbox>
            <el-checkbox label="user">用户管理</el-checkbox>
            <el-checkbox label="role">角色管理</el-checkbox>
            <el-checkbox label="monitor">监控大屏</el-checkbox>
            <el-checkbox label="equipment">设备管理</el-checkbox>
            <el-checkbox label="farm">农田管理</el-checkbox>
            <el-checkbox label="alert">告警管理</el-checkbox>
            <el-checkbox label="analysis">数据分析</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
// import { ROLES, ROLE_DESCRIPTIONS } from '../../../backend-mock/utils/mock-data';
// 角色权限定义
const ROLES = {
  SUPER_ADMIN: 'super_admin',    // 系统管理员
  FARM_ADMIN: 'farm_admin',      // 大田管理员
  TECHNICIAN: 'technician',      // 技术员
} as const;

// 角色描述
const ROLE_DESCRIPTIONS = {
  [ROLES.SUPER_ADMIN]: {
    name: '系统管理员',
    description: '系统最高权限，可以管理所有功能和配置',
    permissions: ['system', 'user', 'role', 'monitor', 'equipment', 'farm', 'alert', 'analysis'],
  },
  [ROLES.FARM_ADMIN]: {
    name: '大田管理员',
    description: '负责农田和设备的日常管理和监控',
    permissions: ['monitor', 'equipment', 'farm', 'alert', 'analysis'],
  },
  [ROLES.TECHNICIAN]: {
    name: '技术员',
    description: '负责设备维护和故障处理',
    permissions: ['equipment', 'alert'],
  },
} as const;


interface RoleForm {
  code: string;
  name: string;
  description: string;
  permissions: string[];
}

// 表单校验规则
const rules = {
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入角色描述', trigger: 'blur' }],
  permissions: [{ required: true, message: '请选择权限', trigger: 'change' }],
};

// 角色列表数据
const roleList = ref([
  {
    code: ROLES.SUPER_ADMIN,
    name: ROLE_DESCRIPTIONS[ROLES.SUPER_ADMIN].name,
    description: ROLE_DESCRIPTIONS[ROLES.SUPER_ADMIN].description,
    permissions: ROLE_DESCRIPTIONS[ROLES.SUPER_ADMIN].permissions,
  },
  {
    code: ROLES.FARM_ADMIN,
    name: ROLE_DESCRIPTIONS[ROLES.FARM_ADMIN].name,
    description: ROLE_DESCRIPTIONS[ROLES.FARM_ADMIN].description,
    permissions: ROLE_DESCRIPTIONS[ROLES.FARM_ADMIN].permissions,
  },
  {
    code: ROLES.TECHNICIAN,
    name: ROLE_DESCRIPTIONS[ROLES.TECHNICIAN].name,
    description: ROLE_DESCRIPTIONS[ROLES.TECHNICIAN].description,
    permissions: ROLE_DESCRIPTIONS[ROLES.TECHNICIAN].permissions,
  },
]);

// 权限标签类型映射
const permissionTagTypes = {
  system: 'danger',
  user: 'warning',
  role: 'warning',
  monitor: 'success',
  equipment: 'success',
  farm: 'success',
  alert: 'info',
  analysis: 'primary',
} as const;

// 权限名称映射
const permissionNames = {
  system: '系统管理',
  user: '用户管理',
  role: '角色管理',
  monitor: '监控大屏',
  equipment: '设备管理',
  farm: '农田管理',
  alert: '告警管理',
  analysis: '数据分析',
} as const;

// 获取权限标签类型
const getPermissionTagType = (permission: string) => {
  return permissionTagTypes[permission as keyof typeof permissionTagTypes] || '';
};

// 获取权限名称
const getPermissionName = (permission: string) => {
  return permissionNames[permission as keyof typeof permissionNames] || permission;
};

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const dialogTitle = computed(() => (dialogType.value === 'add' ? '新增角色' : '编辑角色'));

// 表单数据
const formRef = ref();
const formData = ref<RoleForm>({
  code: '',
  name: '',
  description: '',
  permissions: [],
});

// 新增角色
const handleAdd = () => {
  dialogType.value = 'add';
  formData.value = {
    code: '',
    name: '',
    description: '',
    permissions: [],
  };
  dialogVisible.value = true;
};

// 编辑角色
const handleEdit = (row: any) => {
  dialogType.value = 'edit';
  formData.value = {
    ...row,
    permissions: [...row.permissions],
  };
  dialogVisible.value = true;
};

// 删除角色
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该角色吗？', '提示', {
      type: 'warning',
    });
    const index = roleList.value.findIndex((item) => item.code === row.code);
    if (index !== -1) {
      roleList.value.splice(index, 1);
      ElMessage.success('删除成功');
    }
  } catch {
    // 用户取消删除
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 新增角色
        roleList.value.push({
          ...formData.value,
        });
      } else {
        // 编辑角色
        const index = roleList.value.findIndex(
          (item) => item.code === formData.value.code
        );
        if (index !== -1) {
          roleList.value[index] = {
            ...formData.value,
          };
        }
      }
      dialogVisible.value = false;
      ElMessage.success(
        dialogType.value === 'add' ? '新增成功' : '编辑成功'
      );
    }
  });
};
</script>
