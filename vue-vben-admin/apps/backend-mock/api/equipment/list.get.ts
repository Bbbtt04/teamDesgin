import { defineEventHandler, getQuery } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const {
      page = 1,
      pageSize = 10,
      keyword = '',
      type = -1,
      status = -1,
      fieldId,
      sectionId,
    } = query;

    // 构建查询条件
    const where: any = {};
    if (keyword) {
      where.OR = [
        { name: { contains: keyword as string } },
        { model: { contains: keyword as string } },
        { serialNumber: { contains: keyword as string } },
      ];
    }
    if (type !== -1) {
      where.type = Number(type);
    }
    if (status !== -1) {
      where.status = Number(status);
    }
    if (fieldId) {
      where.fieldId = fieldId as string;
    }
    if (sectionId) {
      where.sectionId = sectionId as string;
    }

    // 查询总数
    const total = await prisma.equipment.count({ where });

    // 查询列表
    const items = await prisma.equipment.findMany({
      where,
      include: {

        // 假设 farmTrends 和 alerts 是 Equipment 模型中可用的关联字段
        farmTrends: true,
        alerts: true,
      },
      orderBy: {
        createTime: 'desc',
      },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    return useResponseSuccess({
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error: any) {
    console.error('获取设备列表失败:', error);
    return useResponseError(error.message || '获取设备列表失败');
  }
});
