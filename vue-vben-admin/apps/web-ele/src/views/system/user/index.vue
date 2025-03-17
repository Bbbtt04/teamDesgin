<template>
  <div class="user-management">
    <!-- 搜索区域 -->
    <el-card class="search-card mb-4" shadow="never">
      <el-form :model="searchForm" inline class="search-form">
        <el-row :gutter="16" class="w-full">
          <el-col :span="6">
            <el-form-item label="用户名" class="mb-0 w-full">
              <el-input
                v-model="searchForm.username"
                placeholder="请输入用户名"
                clearable
                class="w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="真实姓名" class="mb-0 w-full">
              <el-input
                v-model="searchForm.realName"
                placeholder="请输入真实姓名"
                clearable
                class="w-full"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="角色" class="mb-0 w-full">
              <el-select
                v-model="searchForm.roles"
                placeholder="请选择角色"
                clearable
                class="w-full"
                multiple
              >
                <el-option
                  v-for="role in roleOptions"
                  :key="role.value"
                  :label="role.label"
                  :value="role.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态" class="mb-0 w-full">
              <el-select
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
                class="w-full"
              >
                <el-option label="启用" :value="1" />
                <el-option label="禁用" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <div class="flex justify-end mt-4">
          <el-button @click="resetSearch">重置</el-button>
          <el-button type="primary" @click="handleSearch" class="ml-2">查询</el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 操作区域 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span class="text-lg font-medium">用户列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon class="mr-1"><Plus /></el-icon>新增用户
          </el-button>
        </div>
      </template>

      <!-- 用户列表表格 -->
      <el-table
        :data="userList"
        border
        style="width: 100%"
        v-loading="loading"
        :header-cell-style="{
          background: 'var(--el-fill-color-light)',
          color: 'var(--el-text-color-primary)',
          fontWeight: 'bold',
        }"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="realName" label="真实姓名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号码" min-width="120" show-overflow-tooltip />
        <el-table-column prop="roles" label="角色" min-width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <el-space wrap>
              <el-tag
                v-for="role in row.roles"
                :key="role"
                :type="getRoleTagType(role)"
                size="small"
              >
                {{ getRoleName(role) }}
              </el-tag>
            </el-space>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="180" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-space>
              <el-button link type="primary" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon>编辑
              </el-button>
              <el-button link type="primary" @click="handleResetPwd(row)">
                <el-icon><Key /></el-icon>重置密码
              </el-button>
              <el-button
                link
                :type="row.status === 1 ? 'danger' : 'success'"
                @click="handleToggleStatus(row)"
              >
                <el-icon>
                  <component :is="row.status === 1 ? 'Close' : 'Check'" />
                </el-icon>
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 用户编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formData.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="formData.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="formData.roles" placeholder="请选择角色" style="width: 100%" multiple>
            <el-option
              v-for="role in roleOptions"
              :key="role.value"
              :label="role.label"
              :value="role.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogType === 'add'" label="密码" prop="password">
          <el-input v-model="formData.password" type="password" placeholder="请输入密码" />
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
import {
  createUser,
  getUserList,
  resetUserPassword,
  toggleUserStatus,
  updateUser,
  type CreateUserParams,
  type UserInfo,
  type UserQueryParams,
} from '#/api/user';
import { Edit, Key, Plus } from '@element-plus/icons-vue';
import type { TagProps } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref } from 'vue';

// 角色选项
const roleOptions = [
  { label: '系统管理员', value: 'super_admin' },
  { label: '大田管理员', value: 'farm_admin' },
  { label: '技术员', value: 'technician' },
];

// 角色名称映射
const roleNameMap: Record<string, string> = {
  super_admin: '系统管理员',
  farm_admin: '大田管理员',
  technician: '技术员',
};

// 角色标签类型映射
const roleTagTypeMap: Record<string, TagProps['type']> = {
  super_admin: 'danger',
  farm_admin: 'warning',
  technician: 'info',
};

interface UserForm {
  id?: string;
  username: string;
  realName: string;
  phone: string;
  roles: string[];
  password?: string;
}

// 表单校验规则
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  roles: [{ required: true, message: '请选择角色', trigger: 'change' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

// 加载状态
const loading = ref(false);

// 搜索表单
const searchForm = ref<UserQueryParams>({
  username: '',
  realName: '',
  roles: [],
  status: undefined,
});

// 分页配置
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 用户列表
const userList = ref<UserInfo[]>([]);

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formRef = ref();
const formData = ref<UserForm>({
  username: '',
  realName: '',
  phone: '',
  roles: [],
});

// 加载用户列表
const loadUserList = async () => {
  try {
    loading.value = true;
    const data = await getUserList({
      ...searchForm.value,
      page: pagination.value.currentPage,
      pageSize: pagination.value.pageSize,
    });
    userList.value = data.items;
    pagination.value.total = data.total;
  } catch (error) {
    console.error('加载用户列表失败：', error);
    ElMessage.error('加载用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.value.currentPage = 1;
  loadUserList();
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    username: '',
    realName: '',
    roles: [],
    status: undefined,
  };
  handleSearch();
};

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.value.pageSize = val;
  loadUserList();
};

const handleCurrentChange = (val: number) => {
  pagination.value.currentPage = val;
  loadUserList();
};

// 新增用户
const handleAdd = () => {
  dialogType.value = 'add';
  formData.value = {
    username: '',
    realName: '',
    phone: '',
    roles: [],
    password: '',
  };
  dialogVisible.value = true;
};

// 编辑用户
const handleEdit = (row: UserInfo) => {
  dialogType.value = 'edit';
  formData.value = {
    id: row.id,
    username: row.username,
    realName: row.realName,
    phone: row.phone,
    roles: [...row.roles],
  };
  dialogVisible.value = true;
};

// 重置密码
const handleResetPwd = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm('确认重置该用户的密码吗？', '提示', {
      type: 'warning',
    });
    await resetUserPassword(row.id);
    ElMessage.success('密码重置成功');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置密码失败：', error);
      ElMessage.error('重置密码失败');
    }
  }
};

// 切换用户状态
const handleToggleStatus = async (row: UserInfo) => {
  try {
    await ElMessageBox.confirm(
      `确认${row.status === 0 ? '禁用' : '启用'}该用户吗？`,
      '提示',
      {
        type: 'warning',
      }
    );
    await toggleUserStatus(row.id);
    row.status = row.status === 1 ? 0 : 1;
    ElMessage.success(`${row.status === 1 ? '启用' : '禁用'}成功`);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败：', error);
      ElMessage.error('操作失败');
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (dialogType.value === 'add') {
          await createUser(formData.value as CreateUserParams);
          ElMessage.success('新增成功');
        } else {
          await updateUser({
            id: formData.value.id!,
            username: formData.value.username,
            realName: formData.value.realName,
            phone: formData.value.phone,
            roles: formData.value.roles,
          });
          ElMessage.success('编辑成功');
        }
        dialogVisible.value = false;
        loadUserList();
      } catch (error) {
        console.error('操作失败：', error);
        ElMessage.error(dialogType.value === 'add' ? '新增失败' : '编辑失败');
      }
    }
  });
};

// 获取角色标签类型
function getRoleTagType(role: string): TagProps['type'] {
  return roleTagTypeMap[role] || 'success';
}

// 获取角色名称
function getRoleName(role: string) {
  return roleNameMap[role] || role;
}

// 格式化日期
function formatDateTime(date: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

// 初始化
loadUserList();
</script>

<style lang="scss" scoped>
.user-management {
  padding: 16px;
  background-color: var(--el-bg-color-page);
  min-height: 100%;

  :deep(.el-card) {
    --el-card-border-color: var(--el-border-color-light);
  }

  .search-card {
    .search-form {
      .el-form-item {
        margin-right: 0;

        :deep(.el-form-item__label) {
          font-weight: normal;
          color: var(--el-text-color-regular);
        }
      }
    }
  }

  .table-card {
    :deep(.el-card__header) {
      padding: 16px 20px;
      border-bottom: 1px solid var(--el-border-color-light);
    }
  }

  :deep(.el-table) {
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;

    th {
      font-weight: 600;
      background-color: var(--el-fill-color-light);
      border-bottom: 1px solid var(--el-border-color-light);
    }

    td {
      padding: 8px 0;
    }
  }
}
</style>
