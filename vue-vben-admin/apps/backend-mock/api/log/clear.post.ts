import { defineEventHandler } from 'h3';
import { prisma } from '~/modules/db';

export default defineEventHandler(async () => {
  await prisma.operationLog.deleteMany();
  return { success: true };
});
