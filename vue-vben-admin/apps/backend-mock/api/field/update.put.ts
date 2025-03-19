import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id, name, address, manager, area, areaUnit, status, remark } = body;

    // 更新田地
    const field = await prisma.field.update({
      where: {
        id,
      },
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
      message: '更新田地成功',
      data: field,
    });
  } catch (error: any) {
    console.error('更新田地失败:', error);
    return useResponseError(error.message || '更新田地失败');
  }
});
