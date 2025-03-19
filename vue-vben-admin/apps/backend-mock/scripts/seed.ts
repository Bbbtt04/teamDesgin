import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // 创建测试用户
  const user = await prisma.user.create({
    data: {
      username: 'admin',
      password: '123456', // 实际应用中应该使用加密密码
      realName: '管理员',
      status: 1,
      department: '技术部',
      phone: '13800138000',
    },
  });

  // 创建角色
  const role = await prisma.role.create({
    data: {
      name: 'admin',
      description: '系统管理员',
    },
  });

  // 创建权限
  const permission = await prisma.permission.create({
    data: {
      name: 'system:manage',
      description: '系统管理权限',
    },
  });

  // 关联用户和角色
  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: role.id,
    },
  });

  // 关联角色和权限
  await prisma.rolePermission.create({
    data: {
      roleId: role.id,
      permissionId: permission.id,
    },
  });

  // 创建大田
  const field = await prisma.field.create({
    data: {
      name: '测试大田1',
      address: '北京市海淀区',
      manager: '张三',
      area: 100,
      areaUnit: '亩',
      status: 1,
      remark: '测试大田',
    },
  });

  // 创建大田分区
  const section = await prisma.fieldSection.create({
    data: {
      fieldId: field.id,
      name: '测试分区1',
      area: 50,
      areaUnit: '亩',
      cropType: '小麦',
      status: 1,
      remark: '测试分区',
    },
  });

  // 创建农事活动
  await prisma.activity.create({
    data: {
      fieldId: field.id,
      sectionId: section.id,
      title: '播种',
      activityType: 1,
      description: '小麦播种',
      startTime: new Date(),
      status: 1,
      executor: '张三',
      dataSource: 1,
      weatherInfo: '晴天',
      effectDescription: '播种完成',
    },
  });

  // 创建设备
  const equipment = await prisma.equipment.create({
    data: {
      name: '测试设备1',
      type: 1,
      model: 'TEST-001',
      serialNumber: 'SN001',
      status: 1,
      location: '测试位置',
      fieldId: field.id,
      sectionId: section.id,
      installTime: new Date(),
      manufacturer: '测试厂家',
      purchaseDate: new Date(),
    },
  });

  // 创建农场动态
  await prisma.farmTrend.create({
    data: {
      avatar: 'https://example.com/avatar.jpg',
      title: '张三',
      content: '完成了小麦播种工作',
      date: new Date(),
      fieldId: field.id,
      equipmentId: equipment.id,
    },
  });

  // 创建操作日志
  await prisma.operationLog.create({
    data: {
      username: 'admin',
      operationType: '查询',
      module: '系统管理',
      description: '查询系统日志',
      requestUrl: '/api/log/list',
      requestMethod: 'GET',
      requestParams: '{}',
      responseData: '{}',
      status: '成功',
      ip: '127.0.0.1',
      browser: 'Chrome',
      os: 'Windows',
    },
  });

  console.log('数据库初始化完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 