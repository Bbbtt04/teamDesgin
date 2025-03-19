import { defineEventHandler, getQuery } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    // 获取请求参数
    const query = getQuery(event);
    const { fieldId } = query;

    if (!fieldId) {
      return useResponseError('请提供大田ID', 400);
    }

    const sections = await prisma.fieldSection.findMany({
      where: {
        fieldId: fieldId as string,
      },
      orderBy: {
        createTime: 'desc',
      },
    });

    return useResponseSuccess(sections);
  } catch (error: any) {
    console.error('获取分区列表出错:', error);
    return useResponseError(error.message || '获取分区列表失败', 500);
  }
});
