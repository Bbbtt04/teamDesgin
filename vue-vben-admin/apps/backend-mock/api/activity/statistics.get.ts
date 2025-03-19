import { defineEventHandler, getQuery } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

/**
 * 农事活动类型枚举
 */
export enum ActivityType {
  /** 播种 */
  PLANTING = 0,
  /** 施肥 */
  FERTILIZING = 1,
  /** 灌溉 */
  IRRIGATION = 2,
  /** 除草 */
  WEEDING = 3,
  /** 病虫害防治 */
  PESTCONTROL = 4,
  /** 收获 */
  HARVEST = 5,
  /** 其他 */
  OTHER = 99
}

/**
 * 农事活动状态枚举
 */
export enum ActivityStatus {
  /** 计划中 */
  PLANNED = 0,
  /** 进行中 */
  INPROGRESS = 1,
  /** 已完成 */
  COMPLETED = 2,
  /** 已取消 */
  CANCELLED = 3
}

/**
 * 数据来源枚举
 */
export enum DataSource {
  /** 手动录入 */
  MANUAL = 0,
  /** 设备采集 */
  DEVICE = 1,
  /** 系统生成 */
  SYSTEM = 2
}

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { fieldId, startDate, endDate } = query;

    // 构建查询条件
    const where: any = {};
    if (fieldId) {
      where.fieldId = fieldId as string;
    }
    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    // 获取所有符合条件的活动
    const activities = await prisma.activity.findMany({
      where,
      orderBy: {
        startTime: 'asc',
      },
    });

    // 按类型统计
    const byType = {
      0: 0, // 播种
      1: 0, // 施肥
      2: 0, // 灌溉
      3: 0, // 除草
      4: 0, // 病虫害防治
      5: 0, // 收获
      99: 0, // 其他
    };

    // 按状态统计
    const byStatus = {
      0: 0, // 计划中
      1: 0, // 进行中
      2: 0, // 已完成
      3: 0, // 已取消
    };

    // 按月份统计
    const byMonth = {};
    for (let i = 0; i < 12; i++) {
      const month = i + 1;
      byMonth[month < 10 ? `0${month}` : `${month}`] = 0;
    }

    // 统计数据
    activities.forEach(activity => {
      // 按类型统计
      byType[activity.activityType] = (byType[activity.activityType] || 0) + 1;

      // 按状态统计
      byStatus[activity.status] = (byStatus[activity.status] || 0) + 1;

      // 按月份统计
      const date = new Date(activity.startTime);
      const month = date.getMonth() + 1;
      const monthKey = month < 10 ? `0${month}` : `${month}`;
      byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
    });

    // 返回数据
    const result = {
      totalCount: activities.length,
      byType,
      byStatus,
      byMonth,
    };

    return useResponseSuccess(result);
  } catch (error: any) {
    console.error('获取农事活动统计失败:', error);
    return useResponseError(error.message || '获取农事活动统计失败');
  }
});
