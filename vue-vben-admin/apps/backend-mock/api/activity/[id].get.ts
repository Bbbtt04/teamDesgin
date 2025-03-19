import { defineEventHandler, getRouterParam } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');

    if (!id) {
      return useResponseError('缺少活动ID');
    }

    // 查询活动
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        field: true,
        section: true,
      },
    });

    if (!activity) {
      return useResponseError('活动不存在');
    }

    return useResponseSuccess(activity);
  } catch (error: any) {
    console.error('获取活动详情失败:', error);
    return useResponseError(error.message || '获取活动详情失败');
  }
});
