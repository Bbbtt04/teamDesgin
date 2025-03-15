import { addFieldSection } from '~/utils/field-data';
import { useResponseSuccess } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // 验证必要字段
    if (!body.fieldId || !body.name || body.area === undefined) {
      return {
        code: 400,
        data: null,
        error: 'Bad Request',
        message: '请提供完整的分区信息',
      };
    }

    const newSection = addFieldSection(body);

    if (!newSection) {
      return {
        code: 404,
        data: null,
        error: 'Not Found',
        message: '大田信息不存在',
      };
    }

    return useResponseSuccess(newSection);
  } catch (error) {
    console.error('创建分区出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '创建分区失败',
    };
  }
});
