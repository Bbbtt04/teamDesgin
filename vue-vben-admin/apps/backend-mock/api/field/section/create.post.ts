import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { fieldId, name, area, areaUnit, cropType, status, remark } = body;

    // 验证大田是否存在
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
    });

    if (!field) {
      return useResponseError('大田信息不存在', 404);
    }

    // 创建分区
    const section = await prisma.fieldSection.create({
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
      message: '创建分区成功',
      data: section,
    });
  } catch (error: any) {
    console.error('创建分区失败:', error);
    return useResponseError(error.message || '创建分区失败');
  }
});
