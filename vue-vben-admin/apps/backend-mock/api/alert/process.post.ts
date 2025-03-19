import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id } = body;

    // 验证必填参数
    if (!id) {
      return useResponseError('告警ID不能为空');
    }

    // 验证告警是否存在
    const alert = await prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      return useResponseError('告警不存在');
    }

    // 更新告警状态为已处理
    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: {
        status: 1,  // 已处理
      },
      include: {
        field: true,
        section: true,
        equipment: true,
        assignee: true,
      },
    });

    return useResponseSuccess(updatedAlert);
  } catch (error: any) {
    console.error('处理告警失败:', error);
    return useResponseError(error.message || '处理告警失败');
  }
});
