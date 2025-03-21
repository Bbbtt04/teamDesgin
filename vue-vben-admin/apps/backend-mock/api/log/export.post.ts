import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, operationType, status, startTime, endTime, module } = body;

  const where: any = {};
  if (username) {
    where.username = { contains: username };
  }
  if (operationType) {
    where.operationType = operationType;
  }
  if (status) {
    where.status = status;
  }
  if (module) {
    where.module = { contains: module };
  }
  if (startTime && endTime) {
    where.createTime = {
      gte: new Date(startTime),
      lte: new Date(endTime),
    };
  }

  const logs = await prisma.operationLog.findMany({
    where,
    orderBy: { createTime: 'desc' },
  });

  return logs;
});
