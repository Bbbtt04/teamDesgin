import { fieldList } from '~/utils/field-data';
import { usePageResponseSuccess, useResponseSuccess } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    // 获取请求参数
    const query = getQuery(event);
    const { page = 1, pageSize = 10, name, status } = query;

    // 过滤数据
    let result = [...fieldList];

    if (name) {
      result = result.filter(item => item.name.includes(name as string));
    }

    if (status !== undefined && status !== '' && Number(status) !== -1) {
      // 只有当状态不为 -1 时才过滤
      result = result.filter(item => item.status === Number(status));
    }

    // 返回分页结果
    return usePageResponseSuccess(
      page as string | number,
      pageSize as string | number,
      result,
      { message: '获取大田列表成功' }
    );
  } catch (error) {
    console.error('获取大田列表出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '获取大田列表失败',
    };
  }
});
