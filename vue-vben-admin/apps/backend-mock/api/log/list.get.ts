import { defineEventHandler, getQuery } from 'h3';
import { prisma } from '~/modules/db';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const {
    page = 1,
    pageSize = 10,
    username,
    operationType,
    status,
    startTime,
    endTime,
    module,
  } = query;

  const where: any = {};
  if (username) {
    where.username = { contains: username as string };
  }
  if (operationType) {
    where.operationType = operationType;
  }
  if (status) {
    where.status = status;
  }
  if (module) {
    where.module = { contains: module as string };
  }
  if (startTime && endTime) {
    where.createTime = {
      gte: new Date(startTime as string),
      lte: new Date(endTime as string),
    };
  }

  const [total, items] = await Promise.all([
    prisma.operationLog.count({ where }),
    prisma.operationLog.findMany({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      orderBy: { createTime: 'desc' },
    }),
  ]);

  return { items, total };
}); 