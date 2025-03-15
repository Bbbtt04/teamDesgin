import { updateField } from '~/utils/field-data';
import { useResponseSuccess } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // 验证必要字段
    if (!body.id || !body.name || !body.address || !body.manager || body.area === undefined) {
      return {
        code: 400,
        data: null,
        error: 'Bad Request',
        message: '请提供完整的大田信息',
      };
    }

    const updatedField = updateField(body);

    if (!updatedField) {
      return {
        code: 404,
        data: null,
        error: 'Not Found',
        message: '大田信息不存在',
      };
    }

    return useResponseSuccess(updatedField);
  } catch (error) {
    console.error('更新大田出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '更新大田失败',
    };
  }
});
