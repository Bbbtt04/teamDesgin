import { activityList } from '~/utils/activity-data';
import { useResponseSuccess } from '~/utils/response';

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
    // 获取查询参数
    const query = getQuery(event);
    const { fieldId, startDate, endDate } = query;

    // 根据查询参数过滤活动列表
    let filteredActivities = [...activityList];

    if (fieldId) {
      filteredActivities = filteredActivities.filter(activity => activity.fieldId === fieldId);
    }

    if (startDate && endDate) {
      try {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        filteredActivities = filteredActivities.filter(activity => {
          const activityDate = new Date(activity.startTime);
          return activityDate >= start && activityDate <= end;
        });
      } catch (e) {
        console.error('日期解析错误:', e);
      }
    }

    // 按类型统计
    const byType = {};
    Object.values(ActivityType).forEach(type => {
      if (typeof type === 'number') {
        byType[type] = filteredActivities.filter(a => a.activityType === type).length;
      }
    });

    // 按状态统计
    const byStatus = {};
    Object.values(ActivityStatus).forEach(status => {
      if (typeof status === 'number') {
        byStatus[status] = filteredActivities.filter(a => a.status === status).length;
      }
    });

    // 按月份统计
    const byMonth = {};
    for (let i = 0; i < 12; i++) {
      const month = i + 1;
      byMonth[month < 10 ? `0${month}` : `${month}`] = 0;
    }

    filteredActivities.forEach(activity => {
      const date = new Date(activity.startTime);
      const month = date.getMonth() + 1; // 月份从0开始，所以+1
      const monthKey = month < 10 ? `0${month}` : `${month}`;
      byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
    });

    return useResponseSuccess({
      byType,
      byStatus,
      byMonth,
      totalCount: filteredActivities.length
    });
  } catch (error) {
    console.error('获取农事活动统计出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '获取农事活动统计失败',
    };
  }
});
