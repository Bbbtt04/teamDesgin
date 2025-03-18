import { defineEventHandler } from 'h3';
import { useResponseSuccess } from '../../utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // 检查必要字段
    if (!body.deviceName || body.level === undefined || !body.content || !body.assignee) {
      return {
        code: 400,
        data: null,
        message: '请提供完整的告警信息（设备名称、告警级别、告警内容、指派人是必填项）',
      };
    }

    // 创建新的告警
    const newAlert = {
      id: crypto.randomUUID(),
      deviceName: body.deviceName,
      level: body.level,
      content: body.content,
      assignee: body.assignee,
      status: 0, // 初始状态为未处理
      createTime: new Date().toISOString(),
      handleTime: null,
    };

    return useResponseSuccess(newAlert);
  } catch (error) {
    console.error('创建告警出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '创建告警失败',
    };
  }
});
