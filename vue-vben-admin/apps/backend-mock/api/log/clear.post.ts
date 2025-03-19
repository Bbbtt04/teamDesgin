import { defineEventHandler } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    // 清空所有日志
    await prisma.operationLog.deleteMany({});

    return useResponseSuccess({
      message: '清空成功',
    });
  } catch (error: any) {
    console.error('清空日志失败:', error);
    return useResponseError(error.message || '清空日志失败');
  }
});
