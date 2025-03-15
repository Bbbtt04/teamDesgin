import { getActivityById } from '../../utils/activity-data';
import { useResponseSuccess } from '../../utils/response';

export default defineEventHandler(async (event) => {
  try {
    // 从URL获取活动ID
    const id = getRouterParam(event, 'id');

    if (!id) {
      return {
        code: 400,
        data: null,
        message: '缺少活动ID参数',
      };
    }

    // 获取活动详情
    const activity = getActivityById(id);

    if (!activity) {
      return {
        code: 404,
        data: null,
        message: `未找到ID为${id}的活动`,
      };
    }

    // 返回活动详情
    return useResponseSuccess(activity);
  } catch (error) {
    console.error('获取活动详情出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '获取活动详情失败',
    };
  }
});
