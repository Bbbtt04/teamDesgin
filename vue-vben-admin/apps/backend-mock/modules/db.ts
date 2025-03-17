import { PrismaClient } from '@prisma/client'

// 单例模式保证只有一个PrismaClient实例
export const prisma = new PrismaClient()

// 添加连接测试
prisma.$connect()
  .then(() => {
    console.log('✅ Prisma连接数据库成功')
  })
  .catch((error) => {
    console.error('❌ Prisma连接数据库失败:', error)
  })


// 关闭应用时确保连接关闭
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
