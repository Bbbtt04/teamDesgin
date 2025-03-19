import { deleteFieldSection } from '~/utils/field-data';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params.id;
    const result = await deleteFieldSection(id);

    if (!result) {
      return useResponseError('分区信息不存在', 404);
    }

    return useResponseSuccess(null);
  } catch (error: any) {
    console.error('删除分区出错:', error);
    return useResponseError(error.message || '删除分区失败');
  }
});
