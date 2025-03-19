import { requestClient } from './request';

// 接口前缀
const apiPrefix = '/alert';

/**
 * 告警级别枚举
 */
export enum AlertLevel {
  /** 一般 */
  NORMAL = 0,
  /** 重要 */
  IMPORTANT = 1,
  /** 紧急 */
  URGENT = 2
}

/**
 * 告警状态枚举
 */
export enum AlertStatus {
  /** 未处理 */
  PENDING = 0,
  /** 已处理 */
  PROCESSED = 1,
  /** 已忽略 */
  IGNORED = 2
}

/**
 * 分页结果接口
 */
export interface PageResult<T> {
  items: T[];
  total: number;
}

/**
 * 告警查询参数
 */
export interface AlertQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: AlertStatus | -1;
  level?: AlertLevel | -1;
  startTime?: string;
  endTime?: string;
  dateRange?: string[];
  assigneeId?: string;
}

/**
 * 告警信息接口
 */
export interface AlertInfo {
  id: string;
  title: string;
  content: string;
  level: AlertLevel;
  status: AlertStatus;
  type: number;
  source: number;
  fieldId?: string;
  sectionId?: string;
  equipmentId?: string;
  assigneeId?: string;
  assignee?: {
    id: string;
    realName: string;
    department?: string;
  };
  field?: {
    id: string;
    name: string;
  };
  section?: {
    id: string;
    name: string;
  };
  equipment?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * 获取告警列表
 * @param params 查询参数
 * @returns 分页结果
 */
export function getAlertList(params: AlertQueryParams): Promise<PageResult<AlertInfo>> {
  return requestClient.post(`${apiPrefix}/list`, params);
}

/**
 * 处理告警
 * @param id 告警ID
 * @returns 处理结果
 */
export function processAlert(id: string) {
  return requestClient.post(`${apiPrefix}/process`, { id });
}

/**
 * 忽略告警
 * @param id 告警ID
 * @returns 忽略结果
 */
export function ignoreAlert(id: string) {
  return requestClient.post(`${apiPrefix}/ignore`, { id });
}

/**
 * 指派告警
 * @param data 指派参数
 * @returns 指派结果
 */
export function assignAlert(data: { id: string; assigneeId: string }) {
  return requestClient.post(`${apiPrefix}/assign`, data);
}

/**
 * 告警统计数据接口
 */
export interface AlertStatistics {
  totalCount: number;
  statusCounts: Record<AlertStatus, number>;
  levelCounts: Record<AlertLevel, number>;
  todayCount: number;
  weekCount: number;
  monthCount: number;
}

/**
 * 获取告警统计数据
 * @param params 查询参数
 * @returns 统计数据
 */
export function getAlertStatistics(params?: {
  startTime?: string;
  endTime?: string;
}): Promise<AlertStatistics> {
  return requestClient.get(`${apiPrefix}/statistics`, { params });
}

/**
 * 创建告警参数接口
 */
export interface CreateAlertParams {
  title: string;
  content: string;
  level: AlertLevel;
  type: number;
  source: number;
  fieldId?: string;
  sectionId?: string;
  equipmentId?: string;
  assigneeId?: string;
}

/**
 * 创建告警
 * @param data 创建告警参数
 * @returns 创建结果
 */
export function createAlert(data: CreateAlertParams) {
  return requestClient.post(`${apiPrefix}/create`, data);
}
