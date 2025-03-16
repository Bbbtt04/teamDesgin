import dayjs from 'dayjs';

/**
 * 格式化日期时间
 * @param date 日期时间
 * @param format 格式化模板
 * @returns 格式化后的日期字符串
 */
export function formatDateTime(date: Date | string | number, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date) return '';
  return dayjs(date).format(format);
}

/**
 * 格式化日期
 * @param date 日期
 * @param format 格式化模板
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string | number, format = 'YYYY-MM-DD'): string {
  if (!date) return '';
  return dayjs(date).format(format);
}

/**
 * 格式化时间
 * @param date 时间
 * @param format 格式化模板
 * @returns 格式化后的时间字符串
 */
export function formatTime(date: Date | string | number, format = 'HH:mm:ss'): string {
  if (!date) return '';
  return dayjs(date).format(format);
}

/**
 * 获取相对时间
 * @param date 日期
 * @returns 相对时间字符串
 */
export function formatRelativeTime(date: Date | string | number): string {
  if (!date) return '';
  const now = dayjs();
  const target = dayjs(date);
  const diffMinutes = now.diff(target, 'minute');

  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;

  const diffHours = now.diff(target, 'hour');
  if (diffHours < 24) return `${diffHours}小时前`;

  const diffDays = now.diff(target, 'day');
  if (diffDays < 30) return `${diffDays}天前`;

  const diffMonths = now.diff(target, 'month');
  if (diffMonths < 12) return `${diffMonths}个月前`;

  return `${now.diff(target, 'year')}年前`;
}
