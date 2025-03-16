import { addEquipment } from '~/utils/equipment-data';
import { useResponseSuccess } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (!body.name || !body.type || !body.model || !body.serialNumber || !body.fieldId || body.status === undefined) {
      return {
        code: 400,
        data: null,
        message: '缺少必要参数',
      };
    }

    const equipment = addEquipment(body);
    return useResponseSuccess(equipment);
  } catch (error) {
    console.error('创建设备出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '创建设备失败',
    };
  }
});
