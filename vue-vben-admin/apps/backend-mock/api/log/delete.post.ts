import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return useResponseError('请选择要删除的日志');
    }

    // 删除选中的日志
    await prisma.operationLog.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return useResponseSuccess({
      message: '删除成功',
    });
  } catch (error: any) {
    console.error('删除日志失败:', error);
    return useResponseError(error.message || '删除日志失败');
  }
});
