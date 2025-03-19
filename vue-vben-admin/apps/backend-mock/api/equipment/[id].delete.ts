import { defineEventHandler, getRouterParam } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id');

    // 检查设备是否存在
    const equipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!equipment) {
      return useResponseError('设备不存在');
    }

    // 删除设备
    await prisma.equipment.delete({
      where: { id },
    });

    return useResponseSuccess(null);
  } catch (error: any) {
    console.error('删除设备失败:', error);
    return useResponseError(error.message || '删除设备失败');
  }
});
