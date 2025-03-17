import { MOCK_USERS } from '~/utils/mock-data';
import { useResponseSuccess, useResponseError } from '~/utils/response';
import { readBody } from 'h3';
import { faker } from '@faker-js/faker';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { username, realName, phone, roles, password } = body;

    // 验证必填字段
    if (!username || !realName || !phone || !roles?.length || !password) {
      return useResponseError('请填写完整的用户信息');
    }

    // 检查用户名是否已存在
    if (MOCK_USERS.some(user => user.username === username)) {
      return useResponseError('用户名已存在');
    }

    // 创建新用户
    const newUser = {
      id: faker.string.uuid(),
      username,
      realName,
      phone,
      roles,
      password, // 实际项目中需要对密码进行加密
      status: 1,
      createTime: new Date().toISOString(),
    };

    MOCK_USERS.push(newUser);

    return useResponseSuccess({ message: '创建用户成功' });
  } catch (error) {
    console.error('创建用户失败:', error);
    return useResponseError('创建用户失败');
  }
});
