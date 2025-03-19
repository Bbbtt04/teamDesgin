import { requestClient } from './request';

// 接口前缀
const apiPrefix = '/log';

/**
 * 操作类型枚举
 */
export enum OperationType {
  /** 查询 */
  QUERY = 'QUERY',
  /** 创建 */
  CREATE = 'CREATE',
  /** 更新 */
  UPDATE = 'UPDATE',
  /** 删除 */
  DELETE = 'DELETE',
  /** 导出 */
  EXPORT = 'EXPORT',
  /** 处理 */
  PROCESS = 'PROCESS',
  /** 忽略 */
  IGNORE = 'IGNORE',
  /** 登录 */
  LOGIN = 'LOGIN',
  /** 登出 */
  LOGOUT = 'LOGOUT',
}

/**
 * 操作状态枚举
 */
export enum OperationStatus {
  /** 成功 */
  SUCCESS = 'SUCCESS',
  /** 失败 */
  FAIL = 'FAIL',
}

/**
 * 操作日志查询参数
 */
export interface LogQueryParams {
  page?: number;
  pageSize?: number;
  username?: string;
  operationType?: OperationType;
  status?: OperationStatus;
  module?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * 操作日志信息
 */
export interface LogInfo {
  id: string;
  username: string;
  operationType: OperationType;
  module: string;
  description: string;
  requestUrl: string;
  requestMethod: string;
  requestParams: string;
  responseData: string;
  status: OperationStatus;
  ip: string;
  browser: string;
  os: string;
  createTime: string;
}

/**
 * 日志列表响应
 */
export interface LogListResponse {
  data: {
    items: LogInfo[];
    total: number;
    page: number;
    pageSize: number;
  };
}

/**
 * 获取操作日志列表
 */
export function getLogList(params: LogQueryParams) {
  return requestClient.get<LogListResponse>(`${apiPrefix}/list`, { params });
}

/**
 * 导出操作日志
 */
export function exportLogs(params: LogQueryParams) {
  return requestClient.post(`${apiPrefix}/export`, params, {
    responseType: 'blob',
  });
}

/**
 * 删除操作日志
 */
export function deleteLogs(ids: string[]) {
  return requestClient.post(`${apiPrefix}/delete`, { ids });
}

/**
 * 清空操作日志
 */
export function clearLogs() {
  return requestClient.post(`${apiPrefix}/clear`);
}
