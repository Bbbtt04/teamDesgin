import { deleteActivity } from '../../utils/activity-data';
import { useResponseSuccess } from '../../utils/response';

export default defineEventHandler(async (event) => {
  try {
    // 获取请求体
    const body = await readBody(event);

    // 检查必要字段
    if (!body.id) {
      return {
        code: 400,
        data: null,
        message: '缺少活动ID',
      };
    }

    // 删除活动
    const result = deleteActivity(body.id);

    return useResponseSuccess(result);
  } catch (error) {
    console.error('删除活动出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '删除活动失败',
    };
  }
});
