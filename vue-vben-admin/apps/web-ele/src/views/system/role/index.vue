<template>
  <div class="p-4">
    <div class="mb-4 flex justify-between">
      <el-button type="primary" @click="handleAdd">
        新增角色
      </el-button>
    </div>

    <el-table v-loading="loading" :data="roleList" border style="width: 100%">
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
            <el-checkbox label="farmdashboard">农田仪表盘</el-checkbox>
            <el-checkbox label="field">田地管理</el-checkbox>
            <el-checkbox label="activity">活动管理</el-checkbox>
            <el-checkbox label="alert">告警管理</el-checkbox>
            <el-checkbox label="equipment">设备管理</el-checkbox>
            <el-checkbox label="workspace">工作区管理</el-checkbox>
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
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getRoleList, createRole, updateRole, deleteRole } from '#/api/role';

interface RoleForm {
  id?: string;
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
const roleList = ref<RoleForm[]>([]);
const loading = ref(false);

// 获取角色列表
const fetchRoleList = async () => {
  try {
    loading.value = true;
    const res = await getRoleList();
    roleList.value = res.items.map((item: any) => ({
      id: item.id,
      code: item.name, // 使用name作为code
      name: item.name,
      description: item.description,
      permissions: item.permissions,
    }));
  } catch (error) {
    console.error('获取角色列表失败:', error);
    ElMessage.error('获取角色列表失败');
  } finally {
    loading.value = false;
  }
};

// 权限标签类型映射
const permissionTagTypes = {
  system: 'danger',
  farmdashboard: 'success',
  field: 'success',
  activity: 'success',
  alert: 'info',
  equipment: 'success',
  workspace: 'success',
} as const;

// 权限名称映射
const permissionNames = {
  system: '系统管理',
  farmdashboard: '农场仪表盘',
  field: '田地管理',
  activity: '活动管理',
  alert: '告警管理',
  equipment: '设备管理',
  workspace: '工作空间',
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
const handleEdit = (row: RoleForm) => {
  dialogType.value = 'edit';
  formData.value = {
    ...row,
    permissions: [...row.permissions],
  };
  dialogVisible.value = true;
};

// 删除角色
const handleDelete = async (row: RoleForm) => {
  if (!row.id) return;
  
  try {
    await ElMessageBox.confirm('确认删除该角色吗？', '提示', {
      type: 'warning',
    });
    
    await deleteRole(row.id);
    ElMessage.success('删除成功');
    // 从列表中移除已删除的角色
    roleList.value = roleList.value.filter(role => role.id !== row.id);
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error);
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const roleData = {
          name: formData.value.name,
          description: formData.value.description,
          permissions: formData.value.permissions,
        };

        if (dialogType.value === 'add') {
          // 新增角色
          const res = await createRole(roleData);
          roleList.value.push({
            id: res.data.id,
            code: res.data.name,
            name: res.data.name,
            description: res.data.description,
            permissions: res.data.permissions,
          });
          ElMessage.success('新增成功');
        } else {
          // 编辑角色
          if (!formData.value.id) return;
          await updateRole({
            id: formData.value.id,
            ...roleData,
          });
          const index = roleList.value.findIndex(role => role.id === formData.value.id);
          if (index !== -1) {
            roleList.value[index] = {
              id: formData.value.id,
              code: formData.value.name,
              name: formData.value.name,
              description: formData.value.description,
              permissions: formData.value.permissions,
            };
          }
          ElMessage.success('编辑成功');
        }
        
        dialogVisible.value = false;
      } catch (error: any) {
        console.error('保存角色失败:', error);
        ElMessage.error(error.message || '保存失败');
      }
    }
  });
};

// 页面加载时获取角色列表
onMounted(() => {
  fetchRoleList();
});
</script>
