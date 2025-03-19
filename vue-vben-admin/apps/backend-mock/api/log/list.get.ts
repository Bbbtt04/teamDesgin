import { defineEventHandler, getQuery } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';
import { OperationType, OperationStatus } from '~/middleware/logger';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const {
      page = 1,
      pageSize = 10,
      username,
      operationType,
      status,
      module,
      startTime,
      endTime,
    } = query;

    // 构建查询条件
    const where: any = {};
    
    if (username) {
      where.username = {
        contains: username as string,
      };
    }
    
    if (operationType) {
      where.operationType = operationType as OperationType;
    }
    
    if (status) {
      where.status = status as OperationStatus;
    }
    
    if (module) {
      where.module = {
        contains: module as string,
      };
    }
    
    if (startTime && endTime) {
      where.createTime = {
        gte: new Date(startTime as string),
        lte: new Date(endTime as string),
      };
    }

    // 查询总数
    const total = await prisma.operationLog.count({ where });

    // 查询列表
    const items = await prisma.operationLog.findMany({
      where,
      orderBy: {
        createTime: 'desc',
      },
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
    });

    return useResponseSuccess({
      data: {
        items,
        total,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    });
  } catch (error: any) {
    console.error('获取日志列表失败:', error);
    return useResponseError(error.message || '获取日志列表失败');
  }
}); 