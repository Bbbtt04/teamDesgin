import { equipmentList } from '~/utils/equipment-data';
import { usePageResponseSuccess } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    // 获取请求参数
    const query = getQuery(event);
    const { page = 1, pageSize = 10, fieldId, type, status } = query;

    // 过滤数据
    let result = [...equipmentList];

    if (fieldId) {
      result = result.filter(item => item.fieldId === fieldId);
    }

    if (type !== undefined && type !== '' && Number(type) !== -1) {
      result = result.filter(item => item.type === Number(type));
    }

    if (status !== undefined && status !== '' && Number(status) !== -1) {
      result = result.filter(item => item.status === Number(status));
    }

    // 返回分页结果
    return usePageResponseSuccess(
      page as string | number,
      pageSize as string | number,
      result,
      { message: '获取设备列表成功' }
    );
  } catch (error) {
    console.error('获取设备列表出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '获取设备列表失败',
    };
  }
});
