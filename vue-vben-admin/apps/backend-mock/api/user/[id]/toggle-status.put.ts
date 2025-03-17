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

    // 切换用户状态
    MOCK_USERS[userIndex].status = MOCK_USERS[userIndex].status === 1 ? 0 : 1;

    return useResponseSuccess({
      message: `${MOCK_USERS[userIndex].status === 1 ? '启用' : '禁用'}成功`
    });
  } catch (error) {
    console.error('切换用户状态失败:', error);
    return useResponseError('切换用户状态失败');
  }
});
