import { getFieldById } from '~/utils/field-data';
import { useResponseSuccess } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id;
    const field = getFieldById(id);

    if (!field) {
      return {
        code: 404,
        data: null,
        error: 'Not Found',
        message: '大田信息不存在',
      };
    }

    return useResponseSuccess(field);
  } catch (error) {
    console.error('获取大田详情出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '获取大田详情失败',
    };
  }
});
