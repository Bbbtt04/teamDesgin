import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { name, address, manager, area, areaUnit, status, remark } = body;

    // 创建田地
    const field = await prisma.field.create({
      data: {
        name,
        address,
        manager,
        area,
        areaUnit,
        status,
        remark,
      },
    });

    return useResponseSuccess({
      message: '创建田地成功',
      data: field,
    });
  } catch (error: any) {
    console.error('创建田地失败:', error);
    return useResponseError(error.message || '创建田地失败');
  }
});
