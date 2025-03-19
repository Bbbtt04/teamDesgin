import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id } = body;

    // 删除田地
    await prisma.field.delete({
      where: {
        id,
      },
    });

    return useResponseSuccess({
      message: '删除田地成功',
    });
  } catch (error: any) {
    console.error('删除田地失败:', error);
    return useResponseError(error.message || '删除田地失败');
  }
}); 