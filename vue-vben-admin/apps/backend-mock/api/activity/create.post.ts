import { addActivity } from '../../utils/activity-data';
import { useResponseSuccess } from '../../utils/response';

export default defineEventHandler(async (event) => {
  try {
    // 获取请求体
    const body = await readBody(event);

    // 检查必要字段
    if (!body.fieldId || !body.title || body.activityType === undefined || !body.startTime || body.status === undefined) {
      return {
        code: 400,
        data: null,
        message: '请提供完整的活动信息（大田ID、活动标题、活动类型、开始时间、活动状态是必填项）',
      };
    }

    // 添加活动
    const newActivity = addActivity(body);

    return useResponseSuccess(newActivity);
  } catch (error) {
    console.error('创建活动出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '创建活动失败',
    };
  }
});
