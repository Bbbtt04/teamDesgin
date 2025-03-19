import { prisma } from '~/modules/db'
import { useResponseSuccess, useResponseError } from '~/utils/response'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id

    if (!id) {
      return useResponseError('角色ID不能为空')
    }

    // 检查角色是否存在
    const existingRole = await prisma.role.findUnique({
      where: { id }
    })

    if (!existingRole) {
      return useResponseError('角色不存在')
    }

    // 删除角色（由于设置了级联删除，相关的权限关联也会被自动删除）
    await prisma.role.delete({
      where: { id }
    })

    return useResponseSuccess({
      message: '删除角色成功'
    })
  } catch (error) {
    console.error('删除角色失败:', error)
    return useResponseError('删除角色失败')
  }
}) 