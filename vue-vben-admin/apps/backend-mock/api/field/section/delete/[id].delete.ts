import { deleteFieldSection } from '~/utils/field-data';
import { useResponseSuccess } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id;
    const result = deleteFieldSection(id);

    if (!result) {
      return {
        code: 404,
        data: null,
        error: 'Not Found',
        message: '分区信息不存在',
      };
    }

    return useResponseSuccess(null);
  } catch (error) {
    console.error('删除分区出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '删除分区失败',
    };
  }
});
