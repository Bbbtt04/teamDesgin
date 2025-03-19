import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id, fieldId, name, area, areaUnit, cropType, status, remark } = body;

    // 验证分区是否存在
    const section = await prisma.fieldSection.findUnique({
      where: { id },
    });

    if (!section) {
      return useResponseError('分区信息不存在', 404);
    }

    // 验证大田是否存在
    if (fieldId) {
      const field = await prisma.field.findUnique({
        where: { id: fieldId },
      });

      if (!field) {
        return useResponseError('大田信息不存在', 404);
      }
    }

    // 更新分区
    const updatedSection = await prisma.fieldSection.update({
      where: { id },
      data: {
        fieldId,
        name,
        area,
        areaUnit,
        cropType,
        status,
        remark,
      },
    });

    return useResponseSuccess({
      message: '更新分区成功',
      data: updatedSection,
    });
  } catch (error: any) {
    console.error('更新分区失败:', error);
    return useResponseError(error.message || '更新分区失败');
  }
});
