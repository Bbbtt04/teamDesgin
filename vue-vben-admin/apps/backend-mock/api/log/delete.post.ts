import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { ids } = body;

  await prisma.operationLog.deleteMany({
    where: { id: { in: ids } },
  });

  return { success: true };
});
