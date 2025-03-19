import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id;
    const field = await prisma.field.findUnique({
      where: { id },
      include: { sections: true },
    });

    if (!field) {
      return {
        code: 404,
        data: null,
        error: 'Not Found',
        message: '大田信息不存在',
      };
    }

    return useResponseSuccess(field);
  } catch (error: any) {
    console.error('获取大田详情出错:', error);
    return useResponseError(error.message || '获取大田详情失败');
  }
});
