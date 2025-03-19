import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      page = 1,
      pageSize = 10,
      keyword = '',
      status = -1,
      level = -1,
      assigneeId = '',
      startTime,
      endTime,
    } = body;

    // 构建查询条件
    const where: any = {};
    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { content: { contains: keyword } },
        { equipment: { name: { contains: keyword } } },
        { assignee: { realName: { contains: keyword } } },
      ];
    }
    if (status !== -1) {
      where.status = status;
    }
    if (level !== -1) {
      where.level = level;
    }
    if (assigneeId) {
      where.assigneeId = assigneeId;
    }
    if (startTime && endTime) {
      where.createdAt = {
        gte: new Date(startTime),
        lte: new Date(endTime),
      };
    }

    // 查询总数
    const total = await prisma.alert.count({ where });

    // 查询列表
    const items = await prisma.alert.findMany({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        field: true,
        section: true,
        equipment: true,
        assignee: true,
      },
    });

    return useResponseSuccess({
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error: any) {
    console.error('获取告警列表失败:', error);
    return useResponseError(error.message || '获取告警列表失败');
  }
});
