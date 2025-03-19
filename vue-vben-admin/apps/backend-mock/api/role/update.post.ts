import { prisma } from '~/modules/db'
import { useResponseSuccess, useResponseError } from '~/utils/response'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { id, name, description, permissions } = body

    // 验证必填字段
    if (!id || !name || !description || !permissions?.length) {
      return useResponseError('请填写完整的角色信息')
    }

    // 检查角色是否存在
    const existingRole = await prisma.role.findUnique({
      where: { id }
    })

    if (!existingRole) {
      return useResponseError('角色不存在')
    }

    // 检查角色名是否与其他角色重复
    const duplicateRole = await prisma.role.findFirst({
      where: {
        name,
        id: { not: id }
      }
    })

    if (duplicateRole) {
      return useResponseError('角色名已存在')
    }

    // 更新角色及其权限关联
    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        rolePermissions: {
          deleteMany: {}, // 删除所有现有权限关联
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
      message: '更新角色成功'
    })
  } catch (error) {
    console.error('更新角色失败:', error)
    return useResponseError('更新角色失败')
  }
}) 