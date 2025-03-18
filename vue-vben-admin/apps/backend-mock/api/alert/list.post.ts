import { defineEventHandler } from 'h3';
import { faker } from '@faker-js/faker/locale/zh_CN';

// 生成模拟数据
function generateMockAlert(index: number) {
  const status = Math.floor(Math.random() * 3); // 0: 未处理, 1: 已处理, 2: 已忽略
  const level = Math.floor(Math.random() * 3); // 0: 一般, 1: 重要, 2: 紧急
  const createTime = faker.date.recent({ days: 30 });

  return {
    id: faker.string.uuid(),
    content: `设备${faker.string.alpha(3).toUpperCase()}-${index + 1}发生${level === 0 ? '轻微' : level === 1 ? '严重' : '危险'}故障`,
    deviceName: `设备${faker.string.alpha(3).toUpperCase()}-${index + 1}`,
    level,
    status,
    assignee: faker.person.fullName(),
    createTime: createTime.toISOString(),
    handleTime: status === 1 ? faker.date.between({ from: createTime, to: new Date() }).toISOString() : null,
  };
}

// 模拟数据库
const mockAlerts = Array.from({ length: 100 }, (_, index) => generateMockAlert(index));

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    page = 1,
    pageSize = 10,
    keyword = '',
    status = -1,
    level = -1,
    startTime,
    endTime,
  } = body;

  // 筛选数据
  let filteredAlerts = [...mockAlerts];

  // 关键词搜索
  if (keyword) {
    filteredAlerts = filteredAlerts.filter(
      (alert) => alert.content.includes(keyword) || alert.deviceName.includes(keyword)
    );
  }

  // 状态筛选
  if (status !== -1) {
    filteredAlerts = filteredAlerts.filter((alert) => alert.status === status);
  }

  // 级别筛选
  if (level !== -1) {
    filteredAlerts = filteredAlerts.filter((alert) => alert.level === level);
  }

  // 时间范围筛选
  if (startTime && endTime) {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    filteredAlerts = filteredAlerts.filter((alert) => {
      const time = new Date(alert.createTime).getTime();
      return time >= start && time <= end;
    });
  }

  // 分页
  const total = filteredAlerts.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = filteredAlerts.slice(start, end);

  return usePageResponseSuccess(page, pageSize, items)
});
