import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      return useResponseError('设备ID不能为空', 400);
    }

    const equipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!equipment) {
      return useResponseError('设备不存在', 404);
    }

    return useResponseSuccess(equipment);
  } catch (error) {
    console.error('获取设备详情出错:', error);
    return useResponseError('获取设备详情失败');
  }
});
