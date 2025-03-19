import { defineEventHandler, getQuery } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { page = 1, pageSize = 10, fieldId, sectionId, activityType, status, startTime, endTime } = query;

    // 构建查询条件
    const where: any = {};
    if (fieldId) {
      where.fieldId = fieldId as string;
    }
    if (sectionId) {
      where.sectionId = sectionId as string;
    }
    if (activityType) {
      where.activityType = Number(activityType);
    }
    if (status) {
      where.status = Number(status);
    }
    if (startTime && endTime) {
      where.startTime = {
        gte: new Date(startTime as string),
        lte: new Date(endTime as string),
      };
    }

    // 查询总数
    const total = await prisma.activity.count({ where });

    // 查询列表
    const items = await prisma.activity.findMany({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      orderBy: {
        createTime: 'desc',
      },
      include: {
        field: true,
        section: true,
      },
    });

    return useResponseSuccess({
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error: any) {
    console.error('获取活动列表失败:', error);
    return useResponseError(error.message || '获取活动列表失败');
  }
});
