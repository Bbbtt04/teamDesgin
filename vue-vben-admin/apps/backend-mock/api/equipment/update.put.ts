import { updateEquipment } from '~/utils/equipment-data';
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

    const equipment = updateEquipment(body.id, body);
    return useResponseSuccess(equipment);
  } catch (error) {
    console.error('更新设备出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '更新设备失败',
    };
  }
});
