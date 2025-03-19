import { prisma } from '~/modules/db'
import { useResponseSuccess, useResponseError } from '~/utils/response'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, description, permissions } = body

    // 验证必填字段
    if (!name || !description || !permissions?.length) {
      return useResponseError('请填写完整的角色信息')
    }

    // 检查角色名是否已存在
    const existingRole = await prisma.role.findUnique({
      where: { name }
    })

    if (existingRole) {
      return useResponseError('角色名已存在')
    }

    // 创建角色及其权限关联
    const role = await prisma.role.create({
      data: {
        name,
        description,
        rolePermissions: {
          create: permissions.map((permissionName: string) => ({
            permission: {
              connectOrCreate: {
                where: { name: permissionName },
                create: { name: permissionName }
              }
            }
          }))
        }
      },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    })

    // 转换数据格式
    const formattedRole = {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.rolePermissions.map(rp => rp.permission.name)
    }

    return useResponseSuccess({
      data: formattedRole,
      message: '创建角色成功'
    })
  } catch (error) {
    console.error('创建角色失败:', error)
    return useResponseError('创建角色失败')
  }
}) 