import { activityList } from '../../utils/activity-data';
import { usePageResponseSuccess } from '../../utils/response';
import { ActivityType, ActivityStatus } from '../../utils/enums';

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event);
    const {
      page = 1,
      pageSize = 10,
      fieldId,
      sectionId,
      activityType,
      status,
      startDate,
      endDate,
      sortBy = 'createTime',
      sortOrder = 'desc'
    } = query;

    // 根据查询参数过滤活动列表
    let filteredActivities = [...activityList];

    // 大田过滤
    if (fieldId) {
      filteredActivities = filteredActivities.filter(activity => activity.fieldId === fieldId);
    }

    // 分区过滤
    if (sectionId) {
      filteredActivities = filteredActivities.filter(activity => activity.sectionId === sectionId);
    }

    // 活动类型过滤
    if (activityType !== undefined && activityType !== '') {
      filteredActivities = filteredActivities.filter(activity =>
        activity.activityType === Number(activityType)
      );
    }

    // 状态过滤
    if (status !== undefined && status !== '') {
      filteredActivities = filteredActivities.filter(activity =>
        activity.status === Number(status)
      );
    }

    // 时间范围过滤
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

    // 排序
    if (sortBy) {
      filteredActivities.sort((a, b) => {
        const aValue = a[sortBy as keyof typeof a];
        const bValue = b[sortBy as keyof typeof b];

        // 处理不同类型的排序
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          // 数字或日期
          return sortOrder === 'asc'
            ? (aValue < bValue ? -1 : 1)
            : (aValue > bValue ? -1 : 1);
        }
      });
    }

    // 分页处理
    const pageNum = Number(page);
    const pageSizeNum = Number(pageSize);

    // 返回分页数据
    return usePageResponseSuccess(
      pageNum,
      pageSizeNum,
      filteredActivities,
      { message: '获取农事活动列表成功' }
    );
  } catch (error) {
    console.error('获取农事活动列表出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '获取农事活动列表失败',
    };
  }
});
