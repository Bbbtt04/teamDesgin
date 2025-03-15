import { requestClient } from '../request';

// 接口前缀
const apiPrefix = '/field';

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
