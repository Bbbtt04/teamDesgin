import { prisma } from '~/modules/db'
import { usePageResponseSuccess, useResponseError } from '~/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const {
      page = 1,
      pageSize = 10,
      name,
    } = query

    // 构建查询条件
    const where: any = {}

    if (name) {
      where.name = { contains: String(name) }
    }

    // 查询总数
    const total = await prisma.role.count({ where })

    // 查询数据
    const roles = await prisma.role.findMany({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    })

    // 转换数据格式
    const formattedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.rolePermissions.map(rp => rp.permission.name)
    }))

    return usePageResponseSuccess(
      Number(page),
      Number(pageSize),
      formattedRoles,
      {
        message: '获取角色列表成功',
      }
    )
  } catch (error) {
    console.error('获取角色列表出错:', error)
    return useResponseError('获取角色列表失败')
  }
}) 