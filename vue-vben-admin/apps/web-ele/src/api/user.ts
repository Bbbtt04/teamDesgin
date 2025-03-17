import { requestClient } from './request';

export interface UserQueryParams {
  username?: string;
  realName?: string;
  roles?: string[];
  status?: number;
}

export interface UserInfo {
  id: string;
  username: string;
  realName: string;
  roles: string[];
  phone: string;
  status: number;
  createTime: string;
}

export interface CreateUserParams {
  username: string;
  realName: string;
  phone: string;
  roles: string[];
  password: string;
}

export interface UpdateUserParams {
  id: string;
  username: string;
  realName: string;
  phone: string;
  roles: string[];
}

const userPrefix = '/user';

/**
 * 获取用户列表
 */
export function getUserList(params?: UserQueryParams) {
  return requestClient.get(`${userPrefix}/list`, { params });
}

/**
 * 创建用户
 */
export function createUser(data: CreateUserParams) {
  return requestClient.post(`${userPrefix}/create`, data);
}

/**
 * 更新用户
 */
export function updateUser(data: UpdateUserParams) {
  return requestClient.put(`${userPrefix}/${data.id}`, data);
}

/**
 * 重置用户密码
 */
export function resetUserPassword(id: string) {
  return requestClient.put(`${userPrefix}/${id}/reset-password`);
}

/**
 * 切换用户状态
 */
export function toggleUserStatus(id: string) {
  return requestClient.put(`${userPrefix}/${id}/toggle-status`);
}

/**
 * 获取用户详情
 */
export function getUserDetail(id: string) {
  return requestClient.get(`${userPrefix}/detail/${id}`);
}
