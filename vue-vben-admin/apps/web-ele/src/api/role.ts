import { requestClient } from './request';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const rolePrefix = '/role';

/**
 * 获取角色列表
 * @returns 角色列表
 */
export function getRoleList() {
  return requestClient.get(`${rolePrefix}/list`);
}

/**
 * 创建角色
 * @param role 角色信息
 * @returns 创建结果
 */
export function createRole(role: Role) {
  return requestClient.post(`${rolePrefix}/create`, role);
}

/**
 * 更新角色
 * @param role 角色信息
 * @returns 更新结果
 */     
export function updateRole(role: Role) {
  return requestClient.post(`${rolePrefix}/update`, role);
}

/**
 * 删除角色
 * @param id 角色ID
 * @returns 删除结果
 */     
export function deleteRole(id: string) {
  return requestClient.delete(`${rolePrefix}/delete/${id}`);
}
