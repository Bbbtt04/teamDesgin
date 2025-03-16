import { deleteEquipment } from '~/utils/equipment-data';
import { useResponseSuccess } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.id) {
      return {
        code: 400,
        data: null,
        message: '设备ID不能为空',
      };
    }

    const result = deleteEquipment(body.id);
    return useResponseSuccess(result);
  } catch (error) {
    console.error('删除设备出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '删除设备失败',
    };
  }
});
