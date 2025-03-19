import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id, assigneeId } = body;

    // 验证必填参数
    if (!id) {
      return useResponseError('告警ID不能为空');
    }

    if (!assigneeId) {
      return useResponseError('指派人ID不能为空');
    }

    // 验证告警是否存在
    const alert = await prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      return useResponseError('告警不存在');
    }

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: assigneeId },
    });

    if (!user) {
      return useResponseError('指定的用户不存在');
    }

    // 指派告警
    const updatedAlert = await prisma.alert.update({
      where: { id },
      data: {
        assigneeId,
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
    console.error('指派告警失败:', error);
    return useResponseError(error.message || '指派告警失败');
  }
}); 