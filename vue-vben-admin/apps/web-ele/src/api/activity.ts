import { requestClient } from './request';

// 接口前缀
const apiPrefix = '/field';
const activityPrefix = '/activity';

// 大田管理接口
export interface FieldInfo {
  id: string;
  name: string;
  address: string;
  manager: string;
  area: number;
  areaUnit: string;
  createTime: string;
  updateTime: string;
  status: number;
  remark?: string;
  sections?: FieldSection[];
}

// 大田分区接口
export interface FieldSection {
  id: string;
  fieldId: string;
  name: string;
  area: number;
  areaUnit: string;
  cropType?: string;
  status: number;
  createTime: string;
  updateTime: string;
  remark?: string;
}

// 分页结果接口
export interface PageResult<T> {
  items: T[];
  total: number;
}

// 获取大田列表
export function getFieldList(params?: any): Promise<PageResult<FieldInfo>> {
  return requestClient.get(`${apiPrefix}/list`, { params })
}

// 获取大田详情
export function getFieldDetail(id: string): Promise<FieldInfo> {
  return requestClient.get(`${apiPrefix}/detail/${id}`)
}

// 创建大田
export function createField(data: Omit<FieldInfo, 'id' | 'createTime' | 'updateTime'>) {
  return requestClient.post(`${apiPrefix}/create`, data);
}

// 更新大田
export function updateField(data: Partial<FieldInfo> & { id: string }) {
  return requestClient.put(`${apiPrefix}/update`, data);
}

// 删除大田
export function deleteField(id: string) {
  return requestClient.delete(`${apiPrefix}/delete/${id}`);
}

// 获取大田分区列表
export function getFieldSectionList(fieldId: string): Promise<FieldSection[]> {
  return requestClient.get(`${apiPrefix}/section/list`, { params: { fieldId } })
}

// 创建大田分区
export function createFieldSection(data: Omit<FieldSection, 'id' | 'createTime' | 'updateTime'>): Promise<FieldSection> {
  return requestClient.post(`${apiPrefix}/section/create`, data)
}

// 更新大田分区
export function updateFieldSection(data: Partial<FieldSection> & { id: string; fieldId: string }): Promise<FieldSection> {
  return requestClient.put(`${apiPrefix}/section/update`, data)
}

// 删除大田分区
export function deleteFieldSection(id: string): Promise<boolean> {
  return requestClient.delete(`${apiPrefix}/section/delete/${id}`)
}

/**
 * 农事活动类型枚举
 */
export enum ActivityType {
  /** 播种 */
  PLANTING = 0,
  /** 施肥 */
  FERTILIZING = 1,
  /** 灌溉 */
  IRRIGATION = 2,
  /** 除草 */
  WEEDING = 3,
  /** 病虫害防治 */
  PESTCONTROL = 4,
  /** 收获 */
  HARVEST = 5,
  /** 其他 */
  OTHER = 99
}

/**
 * 农事活动状态枚举
 */
export enum ActivityStatus {
  /** 计划中 */
  PLANNED = 0,
  /** 进行中 */
  INPROGRESS = 1,
  /** 已完成 */
  COMPLETED = 2,
  /** 已取消 */
  CANCELLED = 3
}

/**
 * 数据来源枚举
 */
export enum DataSource {
  /** 手动录入 */
  MANUAL = 0,
  /** 设备采集 */
  DEVICE = 1,
  /** 系统生成 */
  SYSTEM = 2
}

/**
 * 农事活动查询参数
 */
export interface ActivityQueryParams {
  page?: number;
  pageSize?: number;
  fieldId?: string;
  sectionId?: string;
  activityType?: ActivityType;
  status?: ActivityStatus;
  startDate?: string;
  endDate?: string;
  executor?: string;
}

/**
 * 农事活动接口
 */
export interface FarmActivity {
  id: string;
  fieldId: string;
  sectionId?: string;
  title: string;
  activityType: ActivityType;
  description?: string;
  startTime: string;
  endTime?: string;
  status: ActivityStatus;
  executor: string;
  materials?: string[];
  dataSource: DataSource;
  weatherInfo?: string;
  effectDescription?: string;
  images?: string[];
  createTime: string;
  updateTime: string;
  remark?: string;
}

/**
 * 获取农事活动列表
 * @param params 查询参数
 * @returns 分页结果
 */
export function getActivityList(params: ActivityQueryParams): Promise<PageResult<FarmActivity>> {
  return requestClient.get(`${activityPrefix}/list`, { params });
}

/**
 * 获取农事活动详情
 * @param id 活动ID
 * @returns 活动详情
 */
export function getActivityDetail(id: string): Promise<FarmActivity> {
  return requestClient.get(`${activityPrefix}/${id}`);
}

/**
 * 创建农事活动
 * @param data 活动数据
 * @returns 创建结果
 */
export function createActivity(data: Omit<FarmActivity, 'id' | 'createTime' | 'updateTime'>) {
  return requestClient.post(`${activityPrefix}/create`, data);
}

/**
 * 更新农事活动
 * @param id 活动ID
 * @param data 活动数据
 * @returns 更新结果
 */
export function updateActivity(id: string, data: Partial<FarmActivity>) {
  return requestClient.put(`${activityPrefix}/${id}`, data);
}

/**
 * 删除农事活动
 * @param id 活动ID
 * @returns 删除结果
 */
export function deleteActivity(id: string) {
  return requestClient.delete(`${activityPrefix}/${id}`);
}

/**
 * 导出农事活动
 * @param params 查询参数
 * @returns Blob 数据
 */
export function exportActivities(params: Partial<ActivityQueryParams>): Promise<Blob> {
  return requestClient.get(`${activityPrefix}/export`, {
    params,
    responseType: 'blob'
  });
}

/**
 * 农事活动统计数据接口
 */
export interface ActivityStatistics {
  totalCount: number;
  statusCounts: Record<ActivityStatus, number>;
  typeCounts: Record<ActivityType, number>;
  monthCounts: Record<string, number>;
}

/**
 * 获取农事活动统计数据
 * @param params 查询参数
 * @returns 统计数据
 */
export function getActivityStatistics(params?: {
  fieldId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ActivityStatistics> {
  return requestClient.get(`${activityPrefix}/statistics`, { params });
}
