import { requestClient } from '../request';
import type { Equipment, PageResult } from './types';

// 接口前缀
const apiPrefix = '/equipment';

// 获取设备列表
export function getEquipmentList(params?: any): Promise<PageResult<Equipment>> {
  return requestClient.get(`${apiPrefix}/list`, { params });
}

// 获取设备详情
export function getEquipmentById(id: string): Promise<Equipment> {
  return requestClient.get(`${apiPrefix}/${id}`);
}

// 创建设备
export function createEquipment(data: Omit<Equipment, 'id' | 'createTime' | 'updateTime'>) {
  return requestClient.post(`${apiPrefix}/create`, data);
}

// 更新设备
export function updateEquipment(data: Partial<Equipment> & { id: string }) {
  return requestClient.put(`${apiPrefix}/update`, data);
}

// 删除设备
export function deleteEquipment(id: string) {
  return requestClient.delete(`${apiPrefix}/${id}`);
}

/**
 * 导出设备列表
 */
export function exportEquipment(params: Partial<EquipmentQueryParams>) {
  return requestClient.get(`${apiPrefix}/export`, {
    params,
    responseType: 'blob',
  });
}

/**
 * 获取设备统计信息
 */
export interface EquipmentStatistics {
  total: number;
  online: number;
  offline: number;
  fault: number;
  maintenance: number;
  byType: Record<number, number>;
}

export function getEquipmentStatistics(fieldId?: string) {
  return requestClient.get<EquipmentStatistics>(`${apiPrefix}/statistics`, {
    params: { fieldId },
  });
}
