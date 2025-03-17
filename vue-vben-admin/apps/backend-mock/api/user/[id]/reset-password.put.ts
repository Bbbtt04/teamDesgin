import { MOCK_USERS } from '~/utils/mock-data';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      return useResponseError('用户ID不能为空');
    }

    // 查找用户
    const userIndex = MOCK_USERS.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return useResponseError('用户不存在');
    }

    // 重置密码为默认密码
    MOCK_USERS[userIndex].password = '123456'; // 实际项目中需要对密码进行加密

    return useResponseSuccess({ message: '重置密码成功' });
  } catch (error) {
    console.error('重置密码失败:', error);
    return useResponseError('重置密码失败');
  }
});
