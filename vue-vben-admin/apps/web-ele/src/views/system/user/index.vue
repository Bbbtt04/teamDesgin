<template>
  <div class="p-4">
    <!-- 搜索表单 -->
    <el-form :model="searchForm" inline class="mb-4">
      <el-form-item label="用户名">
        <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="真实姓名">
        <el-input v-model="searchForm.realName" placeholder="请输入真实姓名" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <div class="mb-4">
      <el-button type="primary" @click="handleAdd">新增</el-button>
    </div>

    <!-- 用户列表 -->
    <el-table :data="userList" border style="width: 100%">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="realName" label="真实姓名" width="120" />
      <el-table-column prop="phone" label="手机号码" width="120" />
      <el-table-column prop="department" label="所属部门" width="120" />
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status ? 'success' : 'danger'">
            {{ row.status ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180" align="center">
        <template #default="{ row }">
          {{ row.createTime }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="primary" @click="handleResetPwd(row)">重置密码</el-button>
          <el-button
            link
            :type="row.status ? 'danger' : 'success'"
            @click="handleToggleStatus(row)"
          >
            {{ row.status ? '禁用' : '启用' }}
          </el-button>
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
        <el-form-item label="所属部门" prop="department">
          <el-select v-model="formData.department" placeholder="请选择部门" style="width: 100%">
            <el-option label="信息技术部" value="信息技术部" />
            <el-option label="农田管理部" value="农田管理部" />
            <el-option label="设备维护部" value="设备维护部" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="formData.roles" multiple placeholder="请选择角色" style="width: 100%">
            <el-option label="系统管理员" value="super_admin" />
            <el-option label="大田管理员" value="farm_admin" />
            <el-option label="技术员" value="technician" />
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
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

interface UserListItem {
  id: number;
  username: string;
  realName: string;
  phone: string;
  department: string;
  roles: string[];
  status: boolean;
  createTime: string;
}

interface UserForm {
  id?: number;
  username: string;
  realName: string;
  phone: string;
  department: string;
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
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  roles: [{ required: true, message: '请选择角色', trigger: 'change' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
};

// 搜索表单
const searchForm = ref({
  username: '',
  realName: '',
});

// 分页配置
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 模拟用户数据
const userList = ref<UserListItem[]>([
  {
    id: 1,
    username: 'admin',
    realName: '系统管理员',
    phone: '13800138000',
    department: '信息技术部',
    roles: ['super_admin'],
    status: true,
    createTime: '2024-01-01 12:00:00',
  },
  {
    id: 2,
    username: 'farm_admin',
    realName: '张大田',
    phone: '13800138001',
    department: '农田管理部',
    roles: ['farm_admin'],
    status: true,
    createTime: '2024-01-02 12:00:00',
  },
  {
    id: 3,
    username: 'tech1',
    realName: '李工',
    phone: '13800138002',
    department: '设备维护部',
    roles: ['technician'],
    status: true,
    createTime: '2024-01-03 12:00:00',
  },
]);

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formRef = ref();
const formData = ref<UserForm>({
  username: '',
  realName: '',
  phone: '',
  department: '',
  roles: [],
});

// 搜索
const handleSearch = () => {
  // TODO: 实现搜索逻辑
  console.log('搜索条件：', searchForm.value);
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    username: '',
    realName: '',
  };
};

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.value.pageSize = val;
  // TODO: 重新加载数据
};

const handleCurrentChange = (val: number) => {
  pagination.value.currentPage = val;
  // TODO: 重新加载数据
};

// 新增用户
const handleAdd = () => {
  dialogType.value = 'add';
  formData.value = {
    username: '',
    realName: '',
    phone: '',
    department: '',
    roles: [],
    password: '',
  };
  dialogVisible.value = true;
};

// 编辑用户
const handleEdit = (row: UserListItem) => {
  dialogType.value = 'edit';
  formData.value = {
    ...row,
    roles: [...row.roles],
  };
  dialogVisible.value = true;
};

// 重置密码
const handleResetPwd = async (row: UserListItem) => {
  try {
    await ElMessageBox.confirm('确认重置该用户的密码吗？', '提示', {
      type: 'warning',
    });
    ElMessage.success('密码已重置为：123456');
  } catch {
    // 用户取消操作
  }
};

// 切换用户状态
const handleToggleStatus = async (row: UserListItem) => {
  try {
    await ElMessageBox.confirm(
      `确认${row.status ? '禁用' : '启用'}该用户吗？`,
      '提示',
      {
        type: 'warning',
      }
    );
    row.status = !row.status;
    ElMessage.success(`${row.status ? '启用' : '禁用'}成功`);
  } catch {
    // 用户取消操作
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 新增用户
        const newUser: UserListItem = {
          id: userList.value.length + 1,
          ...formData.value,
          status: true,
          createTime: new Date().toLocaleString(),
        };
        userList.value.push(newUser);
      } else {
        // 编辑用户
        const index = userList.value.findIndex(
          (item) => item.id === formData.value.id
        );
        if (index !== -1) {
          const currentUser = userList.value[index];
          const updatedUser: UserListItem = {
            ...currentUser,
            ...formData.value,
            id: currentUser.id,
            status: currentUser.status,
            createTime: currentUser.createTime,
          };
          userList.value[index] = updatedUser;
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
