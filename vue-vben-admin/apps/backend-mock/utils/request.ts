import { H3Event } from 'h3';
import { UAParser } from 'ua-parser-js';

/**
 * 获取客户端信息
 */
export function getClientInfo(event: H3Event) {
  const headers = event.node.req.headers;
  const userAgent = headers['user-agent'] || '';
  const result = new UAParser(userAgent).getResult();

  return {
    ip: headers['x-forwarded-for'] || headers['x-real-ip'] || event.node.req.socket.remoteAddress,
    browser: `${result.browser.name || ''} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || ''} ${result.os.version || ''}`.trim(),
  };
}
