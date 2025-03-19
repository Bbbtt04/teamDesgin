import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      title,
      content,
      type,
      level,
      status,
      source,
      fieldId,
      sectionId,
      equipmentId,
    } = body;

    // 验证必填参数
    if (!title) {
      return useResponseError('告警标题不能为空');
    }

    // 检查关联数据是否存在
    if (fieldId) {
      const field = await prisma.field.findUnique({
        where: { id: fieldId },
      });
      if (!field) {
        return useResponseError('大田不存在');
      }
    }

    if (sectionId) {
      const section = await prisma.fieldSection.findUnique({
        where: { id: sectionId },
      });
      if (!section) {
        return useResponseError('分区不存在');
      }
    }

    if (equipmentId) {
      const equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
      });
      if (!equipment) {
        return useResponseError('设备不存在');
      }
    }

    // 创建告警
    const alert = await prisma.alert.create({
      data: {
        title,
        content,
        type: isNaN(Number(type)) ? undefined : Number(type),
        level: isNaN(Number(level)) ? undefined : Number(level),
        status: isNaN(Number(status)) ? 0 : Number(status), // 默认值为0
        source: isNaN(Number(source)) ? undefined : Number(source),
        fieldId: fieldId || null,
        sectionId: sectionId || null,
        equipmentId: equipmentId || null,
      },
      include: {
        field: true,
        section: true,
        equipment: true,
      },
    });

    return useResponseSuccess(alert);
  } catch (error: any) {
    console.error('创建告警失败:', error);
    return useResponseError(error.message || '创建告警失败');
  }
});
