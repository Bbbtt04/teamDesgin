import { defineEventHandler, getQuery } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { page = 1, pageSize = 10, name, status, manager } = query;

    // 构建查询条件
    const where: any = {};
    if (name) {
      where.name = {
        contains: name as string,
      };
    }
    if (status) {
      where.status = Number(status);
    }
    if (manager) {
      where.manager = {
        contains: manager as string,
      };
    }

    // 查询总数
    const total = await prisma.field.count({ where });

    // 查询列表
    const items = await prisma.field.findMany({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      orderBy: {
        createTime: 'desc',
      },
      include: {
        sections: true,
      },
    });

    return useResponseSuccess({
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error: any) {
    console.error('获取田地列表失败:', error);
    return useResponseError(error.message || '获取田地列表失败');
  }
});
