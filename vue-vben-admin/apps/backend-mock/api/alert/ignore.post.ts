import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id } = body;

  if (!id) {
    throw createError({
      statusCode: 400,
      message: '告警ID不能为空',
    });
  }

  // 在实际应用中，这里会更新数据库中的告警状态为已忽略
  return {
    code: 0,
    message: '已忽略该告警',
  };
});
