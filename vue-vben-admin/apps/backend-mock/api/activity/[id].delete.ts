import { defineEventHandler, getQuery } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id;

    if (!id) {
      return useResponseError('缺少活动ID');
    }

    // 检查活动是否存在
    const activity = await prisma.activity.findUnique({
      where: { id: id as string },
    });
    if (!activity) {
      return useResponseError('活动不存在');
    }

    // 删除活动
    await prisma.activity.delete({
      where: { id: id as string },
    });

    return useResponseSuccess('删除活动成功');
  } catch (error: any) {
    console.error('删除活动失败:', error);
    return useResponseError(error.message || '删除活动失败');
  }
});
