import { getEquipmentById } from '~/utils/equipment-data';
import { useResponseSuccess } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id;
    if (!id) {
      return {
        code: 400,
        data: null,
        message: '设备ID不能为空',
      };
    }

    const equipment = getEquipmentById(id);
    if (!equipment) {
      return {
        code: 404,
        data: null,
        message: '设备不存在',
      };
    }

    return useResponseSuccess(equipment);
  } catch (error) {
    console.error('获取设备详情出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '获取设备详情失败',
    };
  }
});
