import { MOCK_USERS, ROLES } from '../../../utils/mock-data';
import { usePageResponseSuccess } from '../../../utils/response';

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event);
    const {
      page = 1,
      pageSize = 10,
      username,
      realName,
      department,
    } = query;

    // 过滤掉超级管理员，并根据查询参数过滤用户列表
    let filteredUsers = MOCK_USERS.filter(user => !user.roles.includes(ROLES.SUPER_ADMIN));

    // 用户名过滤
    if (username) {
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(String(username).toLowerCase())
      );
    }

    // 真实姓名过滤
    if (realName) {
      filteredUsers = filteredUsers.filter(user =>
        user.realName.includes(String(realName))
      );
    }

    // 部门过滤
    if (department) {
      filteredUsers = filteredUsers.filter(user =>
        user.department === department
      );
    }

    // 返回分页数据
    return usePageResponseSuccess(
      Number(page),
      Number(pageSize),
      filteredUsers,
      { message: '获取普通用户列表成功' }
    );
  } catch (error) {
    console.error('获取普通用户列表出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '获取普通用户列表失败',
    };
  }
});
