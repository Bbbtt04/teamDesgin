import { prisma } from '~/modules/db'
import { usePageResponseSuccess } from '~/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const {
      page = 1,
      pageSize = 10,
      username,
      realName,
      department,
      role,
      status,
    } = query

    // 构建查询条件
    const where: any = {}

    if (username) {
      where.username = { contains: String(username) }
    }

    if (realName) {
      where.realName = { contains: String(realName) }
    }

    if (department) {
      where.department = String(department)
    }

    if (role) {
      where.userRoles = {
        some: {
          role: {
            name: String(role)
          }
        }
      }
    }

    if (status !== undefined) {
      where.status = Number(status)
    }

    // 查询总数
    const total = await prisma.user.count({ where })

    // 查询数据
    const users = await prisma.user.findMany({
      where,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    })

    // 转换数据格式，使其与原mock数据结构相同
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      realName: user.realName,
      status: user.status,
      department: user.department,
      phone: user.phone,
      createTime: user.createTime,
      roles: user.userRoles.map(ur => ur.role.name)
    }))

    return usePageResponseSuccess(
      Number(page),
      Number(pageSize),
      formattedUsers,
      {
        message: '获取用户列表成功',
      }
    )
  } catch (error) {
    console.error('获取用户列表出错:', error)
    return {
      code: 500,
      data: null,
      error,
      message: '获取用户列表失败',
    }
  }
})
