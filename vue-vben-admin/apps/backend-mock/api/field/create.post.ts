import { addField } from '~/utils/field-data';
import { useResponseSuccess } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // 验证必要字段
    if (!body.name || !body.address || !body.manager || body.area === undefined) {
      return {
        code: 400,
        data: null,
        error: 'Bad Request',
        message: '请提供完整的大田信息',
      };
    }

    const newField = addField(body);
    return useResponseSuccess(newField);
  } catch (error) {
    console.error('创建大田出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '创建大田失败',
    };
  }
});
