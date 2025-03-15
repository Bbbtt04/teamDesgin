import { getFieldSections } from '~/utils/field-data';
import { useResponseSuccess } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    // 获取请求参数
    const query = getQuery(event);
    const { fieldId } = query;

    if (!fieldId) {
      return {
        code: 400,
        data: null,
        error: 'Bad Request',
        message: '请提供大田ID',
      };
    }

    const sections = getFieldSections(fieldId as string);
    return useResponseSuccess(sections);
  } catch (error) {
    console.error('获取分区列表出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '获取分区列表失败',
    };
  }
});
