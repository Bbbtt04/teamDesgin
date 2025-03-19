import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 1. 创建角色和权限
  console.log('创建角色和权限...')
  // 创建权限
  const permissions = [
    { name: 'system', id: '1' },
    { name: 'farmdashboard', id: '2' },
    { name: 'field', id: '3' },
    { name: 'activity', id: '4' },
    { name: 'alert', id: '5' },
    { name: 'equipment', id: '6' },
    { name: 'workspace', id: '7' }
  ]

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { id: perm.id },
      update: { name: perm.name },
      create: { id: perm.id, name: perm.name }
    })
  }

  // 创建角色
  const roles = [
    {
      id: '1',
      name: 'super_admin',
      description: '系统最高权限，可以管理所有功能和配置',
      permissions: ['1', '2', '3', '4', '5', '6', '7']
    },
    {
      id: '2',
      name: 'farm_admin',
      description: '负责农田和设备的日常管理和监控',
      permissions: ['4', '5', '6', '7']
    },
    {
      id: '3',
      name: 'technician',
      description: '负责设备维护和故障处理',
      permissions: ['5', '7']
    }
  ]

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {
        name: role.name,
        description: role.description
      },
      create: {
        id: role.id,
        name: role.name,
        description: role.description
      }
    })

    // 为角色添加权限
    for (const permId of role.permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permId
          }
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permId
        }
      })
    }
  }

  // 2. 创建用户
  console.log('创建用户...')

  const users = [
    {
      id: '1',
      username: 'admin',
      password: '123456',
      realName: '系统管理员',
      roles: ['1'], // super_admin
      department: '信息技术部',
      phone: '13800138000',
      status: 1
    },
    {
      id: '2',
      username: 'farm_admin',
      password: '123456',
      realName: '张大田',
      roles: ['2'], // farm_admin
      department: '农业管理部',
      phone: '13800138001',
      status: 1
    },
    {
      id: '3',
      username: 'tech',
      password: '123456',
      realName: '李工',
      roles: ['3'], // technician
      department: '技术支持部',
      phone: '13800138002',
      status: 1
    },
    {
      id: '4',
      username: 'tech2',
      password: '123456',
      realName: '王工',
      roles: ['3'], // technician
      department: '技术支持部',
      phone: '13800138003',
      status: 1
    }
  ]

  for (const user of users) {
    const createdUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        username: user.username,
        realName: user.realName,
        status: user.status,
        department: user.department,
        phone: user.phone
      },
      create: {
        id: user.id,
        username: user.username,
        password: user.password,
        realName: user.realName,
        status: user.status,
        department: user.department,
        phone: user.phone
      }
    })

    // 为用户关联角色
    for (const roleId of user.roles) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: createdUser.id,
            roleId: roleId
          }
        },
        update: {},
        create: {
          userId: createdUser.id,
          roleId: roleId
        }
      })
    }
  }

  // 3. 创建大田数据
  console.log('创建大田数据...')

  const fields = [
    {
      id: '1',
      name: '1号田',
      address: '河南省郑州市高新区',
      manager: '张大田',
      area: 100,
      areaUnit: '亩',
      status: 1,
      remark: '种植水稻'
    },
    {
      id: '2',
      name: '2号田',
      address: '河南省郑州市金水区',
      manager: '张大田',
      area: 150,
      areaUnit: '亩',
      status: 1,
      remark: '种植小麦'
    },
    {
      id: '3',
      name: '3号田',
      address: '河南省郑州市中原区',
      manager: '赵经理',
      area: 120,
      areaUnit: '亩',
      status: 1,
      remark: '种植玉米'
    },
    {
      id: '4',
      name: '4号田',
      address: '河南省郑州市惠济区',
      manager: '赵经理',
      area: 200,
      areaUnit: '亩',
      status: 1,
      remark: '种植大豆'
    },
    {
      id: '5',
      name: '5号田',
      address: '河南省郑州市管城区',
      manager: '孙经理',
      area: 80,
      areaUnit: '亩',
      status: 0,
      remark: '休耕地'
    }
  ]

  for (const field of fields) {
    await prisma.field.upsert({
      where: { id: field.id },
      update: {
        name: field.name,
        address: field.address,
        manager: field.manager,
        area: field.area,
        areaUnit: field.areaUnit,
        status: field.status,
        remark: field.remark
      },
      create: {
        id: field.id,
        name: field.name,
        address: field.address,
        manager: field.manager,
        area: field.area,
        areaUnit: field.areaUnit,
        status: field.status,
        remark: field.remark
      }
    })
  }

  // 4. 创建大田分区数据
  console.log('创建大田分区数据...')

  const sections = [
    {
      id: '101',
      fieldId: '1',
      name: '1号田-A区',
      area: 40,
      areaUnit: '亩',
      cropType: '水稻',
      status: 1,
      remark: '早稻区'
    },
    {
      id: '102',
      fieldId: '1',
      name: '1号田-B区',
      area: 30,
      areaUnit: '亩',
      cropType: '水稻',
      status: 1,
      remark: '晚稻区'
    },
    {
      id: '103',
      fieldId: '1',
      name: '1号田-C区',
      area: 30,
      areaUnit: '亩',
      cropType: '水稻',
      status: 1,
      remark: '实验区'
    },
    {
      id: '201',
      fieldId: '2',
      name: '2号田-A区',
      area: 80,
      areaUnit: '亩',
      cropType: '小麦',
      status: 1,
      remark: '主栽区'
    },
    {
      id: '202',
      fieldId: '2',
      name: '2号田-B区',
      area: 70,
      areaUnit: '亩',
      cropType: '小麦',
      status: 1,
      remark: '试验区'
    },
    {
      id: '401',
      fieldId: '4',
      name: '4号田-北区',
      area: 120,
      areaUnit: '亩',
      cropType: '大豆',
      status: 1,
      remark: '主栽区'
    },
    {
      id: '402',
      fieldId: '4',
      name: '4号田-南区',
      area: 80,
      areaUnit: '亩',
      cropType: '大豆',
      status: 1,
      remark: '试验区'
    },
    {
      id: '501',
      fieldId: '5',
      name: '5号田-全区',
      area: 80,
      areaUnit: '亩',
      cropType: null,
      status: 0,
      remark: '休耕区'
    }
  ]

  for (const section of sections) {
    await prisma.fieldSection.upsert({
      where: { id: section.id },
      update: {
        fieldId: section.fieldId,
        name: section.name,
        area: section.area,
        areaUnit: section.areaUnit,
        cropType: section.cropType,
        status: section.status,
        remark: section.remark
      },
      create: {
        id: section.id,
        fieldId: section.fieldId,
        name: section.name,
        area: section.area,
        areaUnit: section.areaUnit,
        cropType: section.cropType,
        status: section.status,
        remark: section.remark
      }
    })
  }

  // 5. 创建设备数据
  console.log('创建设备数据...')

  const equipments = [
    {
      id: '1',
      name: '土壤湿度传感器-01',
      type: 1, // 传感器
      model: 'SM-100',
      serialNumber: 'SM10020230001',
      status: 1, // 正常
      location: '北纬30.5° 东经114.3°',
      fieldId: '1',
      sectionId: '101',
      installTime: new Date('2023-01-15'),
      lastMaintenanceTime: new Date('2023-12-10'),
      description: '监测土壤湿度',
      manufacturer: '智农科技'
    },
    {
      id: '2',
      name: '土壤温度传感器-01',
      type: 1, // 传感器
      model: 'ST-100',
      serialNumber: 'ST10020230002',
      status: 1, // 正常
      location: '北纬30.5° 东经114.3°',
      fieldId: '1',
      sectionId: '101',
      installTime: new Date('2023-01-15'),
      lastMaintenanceTime: new Date('2023-12-10'),
      description: '监测土壤温度',
      manufacturer: '智农科技'
    },
    {
      id: '3',
      name: '自动灌溉系统-01',
      type: 2, // 控制设备
      model: 'IS-200',
      serialNumber: 'IS20020230001',
      status: 1, // 正常
      location: '北纬30.5° 东经114.3°',
      fieldId: '1',
      sectionId: '101',
      installTime: new Date('2023-02-20'),
      lastMaintenanceTime: new Date('2023-11-05'),
      description: '自动灌溉系统',
      manufacturer: '智农科技'
    },
    {
      id: '4',
      name: '气象站-01',
      type: 3, // 监测站
      model: 'WS-500',
      serialNumber: 'WS50020230001',
      status: 1, // 正常
      location: '北纬30.6° 东经114.4°',
      fieldId: '2',
      sectionId: null,
      installTime: new Date('2023-03-10'),
      lastMaintenanceTime: new Date('2023-12-20'),
      description: '监测天气数据',
      manufacturer: '气象科技'
    },
    {
      id: '5',
      name: '农田监控摄像头-01',
      type: 4, // 摄像设备
      model: 'CAM-100',
      serialNumber: 'CAM10020230001',
      status: 1, // 正常
      location: '北纬30.5° 东经114.3°',
      fieldId: '1',
      sectionId: null,
      installTime: new Date('2023-01-25'),
      lastMaintenanceTime: new Date('2023-10-15'),
      description: '监控农田情况',
      manufacturer: '安防科技'
    }
  ]

  for (const equipment of equipments) {
    await prisma.equipment.upsert({
      where: { id: equipment.id },
      update: {
        name: equipment.name,
        type: equipment.type,
        model: equipment.model,
        serialNumber: equipment.serialNumber,
        status: equipment.status,
        location: equipment.location,
        fieldId: equipment.fieldId,
        sectionId: equipment.sectionId,
        installTime: equipment.installTime,
        lastMaintenanceTime: equipment.lastMaintenanceTime,
        description: equipment.description,
        manufacturer: equipment.manufacturer
      },
      create: {
        id: equipment.id,
        name: equipment.name,
        type: equipment.type,
        model: equipment.model,
        serialNumber: equipment.serialNumber,
        status: equipment.status,
        location: equipment.location,
        fieldId: equipment.fieldId,
        sectionId: equipment.sectionId,
        installTime: equipment.installTime,
        lastMaintenanceTime: equipment.lastMaintenanceTime,
        description: equipment.description,
        manufacturer: equipment.manufacturer
      }
    })
  }

  // 6. 创建农事活动数据
  console.log('创建农事活动数据...')

  const activities = [
    {
      id: '1',
      fieldId: '1',
      sectionId: '101',
      title: '水稻播种',
      activityType: 0, // 播种
      description: '春季水稻播种',
      startTime: new Date('2023-04-10'),
      endTime: new Date('2023-04-15'),
      status: 2, // 已完成
      executor: '张大田',
      materials: ['水稻种子', '有机肥'],
      dataSource: 0, // 手动录入
      weatherInfo: '晴朗, 22°C, 微风',
      effectDescription: '播种均匀，出苗率高',
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      remark: '使用了优质种子'
    },
    {
      id: '2',
      fieldId: '1',
      sectionId: '101',
      title: '追施氮肥',
      activityType: 1, // 施肥
      description: '水稻生长期追肥',
      startTime: new Date('2023-05-20'),
      endTime: new Date('2023-05-21'),
      status: 2, // 已完成
      executor: '李工',
      materials: ['氮肥'],
      dataSource: 0, // 手动录入
      weatherInfo: '多云, 25°C, 无风',
      effectDescription: '肥效良好，植株长势旺盛',
      images: ['https://example.com/image3.jpg'],
      remark: '按照推荐用量施肥'
    },
    {
      id: '3',
      fieldId: '1',
      sectionId: '101',
      title: '灌溉作业',
      activityType: 2, // 灌溉
      description: '干旱期灌溉',
      startTime: new Date('2023-06-15'),
      endTime: new Date('2023-06-15'),
      status: 2, // 已完成
      executor: '自动系统',
      materials: [],
      dataSource: 1, // 设备采集
      weatherInfo: '晴朗, 30°C, 无风',
      effectDescription: '有效缓解旱情',
      images: [],
      remark: '使用自动灌溉系统'
    },
    {
      id: '4',
      fieldId: '2',
      sectionId: '201',
      title: '小麦收获',
      activityType: 5, // 收获
      description: '夏季小麦收获',
      startTime: new Date('2023-06-25'),
      endTime: new Date('2023-06-28'),
      status: 2, // 已完成
      executor: '王工',
      materials: [],
      dataSource: 0, // 手动录入
      weatherInfo: '晴朗, 28°C, 微风',
      effectDescription: '收成良好，产量高于预期',
      images: ['https://example.com/image4.jpg', 'https://example.com/image5.jpg'],
      remark: '使用收割机收获'
    },
    {
      id: '5',
      fieldId: '4',
      sectionId: '401',
      title: '大豆除草',
      activityType: 3, // 除草
      description: '大豆生长期除草',
      startTime: new Date('2023-07-10'),
      endTime: null,
      status: 1, // 进行中
      executor: '张大田',
      materials: ['除草剂'],
      dataSource: 0, // 手动录入
      weatherInfo: null,
      effectDescription: null,
      images: [],
      remark: '使用环保除草剂'
    },
    {
      id: '6',
      fieldId: '1',
      sectionId: '103',
      title: '水稻病虫害防治',
      activityType: 4, // 病虫害防治
      description: '防治稻飞虱',
      startTime: new Date('2023-07-20'),
      endTime: null,
      status: 0, // 计划中
      executor: '李工',
      materials: ['杀虫剂'],
      dataSource: 0, // 手动录入
      weatherInfo: null,
      effectDescription: null,
      images: [],
      remark: '使用低毒杀虫剂'
    }
  ]

  for (const activity of activities) {
    await prisma.activity.upsert({
      where: { id: activity.id },
      update: {
        fieldId: activity.fieldId,
        sectionId: activity.sectionId,
        title: activity.title,
        activityType: activity.activityType,
        description: activity.description,
        startTime: activity.startTime,
        endTime: activity.endTime,
        status: activity.status,
        executor: activity.executor,
        materials: activity.materials,
        dataSource: activity.dataSource,
        weatherInfo: activity.weatherInfo,
        effectDescription: activity.effectDescription,
        images: activity.images,
        remark: activity.remark
      },
      create: {
        id: activity.id,
        fieldId: activity.fieldId,
        sectionId: activity.sectionId,
        title: activity.title,
        activityType: activity.activityType,
        description: activity.description,
        startTime: activity.startTime,
        endTime: activity.endTime,
        status: activity.status,
        executor: activity.executor,
        materials: activity.materials,
        dataSource: activity.dataSource,
        weatherInfo: activity.weatherInfo,
        effectDescription: activity.effectDescription,
        images: activity.images,
        remark: activity.remark
      }
    })
  }

  // 7. 创建农场动态数据
  // 8. 创建告警数据
  console.log('创建告警数据...')

  const alerts = [
    {
      id: '1',
      title: '土壤湿度异常',
      content: '1号田-A区土壤湿度低于阈值，建议及时灌溉',
      type: 1, // 设备告警
      level: 1, // 重要
      status: 0, // 未处理
      source: 1, // 设备上报
      fieldId: '1',
      sectionId: '101',
      equipmentId: '1',
      assigneeId: '2' // 指派给张大田
    },
    {
      id: '2',
      title: '设备离线',
      content: '土壤温度传感器-01离线，请检查设备',
      type: 2, // 系统告警
      level: 2, // 紧急
      status: 1, // 已处理
      source: 0, // 系统检测
      fieldId: '1',
      sectionId: '101',
      equipmentId: '2',
      assigneeId: '3' // 指派给李工
    },
    {
      id: '3',
      title: '灌溉系统故障',
      content: '自动灌溉系统-01工作异常，需要维修',
      type: 1, // 设备告警
      level: 2, // 紧急
      status: 1, // 已处理
      source: 1, // 设备上报
      fieldId: '1',
      sectionId: '101',
      equipmentId: '3',
      assigneeId: '3' // 指派给李工
    },
    {
      id: '4',
      title: '气象站数据异常',
      content: '气象站-01数据上报异常，请检查网络连接',
      type: 2, // 系统告警
      level: 1, // 重要
      status: 2, // 已忽略
      source: 0, // 系统检测
      fieldId: '2',
      sectionId: null,
      equipmentId: '4',
      assigneeId: '3' // 指派给李工
    },
    {
      id: '5',
      title: '摄像头离线',
      content: '农田监控摄像头-01离线，请检查设备',
      type: 1, // 设备告警
      level: 0, // 一般
      status: 0, // 未处理
      source: 1, // 设备上报
      fieldId: '1',
      sectionId: null,
      equipmentId: '5',
      assigneeId: '3' // 指派给李工
    }
  ]

  for (const alert of alerts) {
    await prisma.alert.upsert({
      where: { id: alert.id },
      update: {
        title: alert.title,
        content: alert.content,
        type: alert.type,
        level: alert.level,
        status: alert.status,
        source: alert.source,
        fieldId: alert.fieldId,
        sectionId: alert.sectionId,
        equipmentId: alert.equipmentId,
        assigneeId: alert.assigneeId
      },
      create: {
        id: alert.id,
        title: alert.title,
        content: alert.content,
        type: alert.type,
        level: alert.level,
        status: alert.status,
        source: alert.source,
        fieldId: alert.fieldId,
        sectionId: alert.sectionId,
        equipmentId: alert.equipmentId,
        assigneeId: alert.assigneeId
      }
    })
  }

  console.log('数据库初始化完成')
}

// 辅助函数：减少天数
function subDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('数据库初始化失败:', e)
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
