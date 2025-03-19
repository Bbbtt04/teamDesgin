import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';
import type { H3Event } from 'h3';
import { verifyAccessToken } from '~/utils/jwt-utils';

// 操作类型枚举
export enum OperationType {
  QUERY = 'QUERY',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  PROCESS = 'PROCESS',
  IGNORE = 'IGNORE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

// 操作状态枚举
export enum OperationStatus {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

// 获取客户端信息
function getClientInfo(event: H3Event) {
  const headers = event.headers;
  return {
    ip: headers['x-forwarded-for'] || headers['x-real-ip'] || 'unknown',
    browser: headers['user-agent'] || 'unknown',
    os: headers['sec-ch-ua-platform'] || 'unknown',
  };
}

// 获取用户信息
function getUserInfo(event: H3Event) {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return {
      username: 'anonymous',
      userId: null,
    };
  }
  return {
    username: userinfo.username || 'anonymous',
    userId: userinfo.id || null,
  };
}

// 日志中间件
export default defineEventHandler(async (event: H3Event) => {
  // 获取请求信息
  const { method, url } = event.node.req;
  const path = url?.split('?')[0] || '';
  
  // 获取客户端信息
  const clientInfo = getClientInfo(event);
  
  // 获取用户信息
  const userInfo = getUserInfo(event);
  
  // 获取请求体
  let requestParams = '';
  if (method === 'POST' || method === 'PUT') {
    const body = await readBody(event);
    requestParams = JSON.stringify(body);
  }
  

  // 获取响应数据
  const originalEnd = event.node.res.end;
  let responseData = '';
  event.node.res.end = function (chunk: any, ...args: any[]) {
    if (chunk) {
      responseData = chunk.toString();
    }
    return originalEnd.apply(this, [chunk, ...args]);
  };

  // 记录日志
  try {
    console.log('记录日志', userInfo);
    await prisma.operationLog.create({
      data: {
        username: userInfo.username,
        operationType: getOperationType(method, path),
        module: getModuleFromPath(path),
        description: getOperationDescription(method, path),
        requestUrl: url || '',
        requestMethod: method || '',
        requestParams,
        responseData,
        status: OperationStatus.SUCCESS,
        ip: clientInfo.ip,
        browser: clientInfo.browser,
        os: clientInfo.os,
      },
    });
  } catch (error) {
    console.error('记录操作日志失败:', error);
  }
});

// 根据请求方法和路径获取操作类型
function getOperationType(method: string | undefined, path: string): OperationType {
  if (path.includes('/login')) return OperationType.LOGIN;
  if (path.includes('/logout')) return OperationType.LOGOUT;
  
  switch (method) {
    case 'GET':
      return OperationType.QUERY;
    case 'POST':
      return OperationType.CREATE;
    case 'PUT':
    case 'PATCH':
      return OperationType.UPDATE;
    case 'DELETE':
      return OperationType.DELETE;
    default:
      return OperationType.QUERY;
  }
}

// 从路径获取模块名称
function getModuleFromPath(path: string): string {
  const modules = {
    '/api/user': '用户管理',
    '/api/role': '角色管理',
    '/api/permission': '权限管理',
    '/api/equipment': '设备管理',
    '/api/field': '田地管理',
    '/api/activity': '活动管理',
    '/api/alert': '告警管理',
    '/api/log': '日志管理',
  };

  for (const [key, value] of Object.entries(modules)) {
    if (path.startsWith(key)) {
      return value;
    }
  }
  return '其他';
}

// 获取操作描述
function getOperationDescription(method: string | undefined, path: string): string {
  const descriptions = {
    GET: '查询',
    POST: '创建',
    PUT: '更新',
    PATCH: '更新',
    DELETE: '删除',
  };

  const action = descriptions[method as keyof typeof descriptions] || '操作';
  const module = getModuleFromPath(path);
  
  return `${action}${module}`;
} 