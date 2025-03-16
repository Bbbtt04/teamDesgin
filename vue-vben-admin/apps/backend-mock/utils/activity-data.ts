import { faker } from '@faker-js/faker/locale/zh_CN';

/**
 * 农事活动类型枚举
 */
export enum ActivityType {
  /** 播种 */
  PLANTING = 0,
  /** 施肥 */
  FERTILIZING = 1,
  /** 灌溉 */
  IRRIGATION = 2,
  /** 除草 */
  WEEDING = 3,
  /** 病虫害防治 */
  PESTCONTROL = 4,
  /** 收获 */
  HARVEST = 5,
  /** 其他 */
  OTHER = 99
}

/**
 * 农事活动状态枚举
 */
export enum ActivityStatus {
  /** 计划中 */
  PLANNED = 0,
  /** 进行中 */
  INPROGRESS = 1,
  /** 已完成 */
  COMPLETED = 2,
  /** 已取消 */
  CANCELLED = 3
}

/**
 * 数据来源枚举
 */
export enum DataSource {
  /** 手动录入 */
  MANUAL = 0,
  /** 设备采集 */
  DEVICE = 1,
  /** 系统生成 */
  SYSTEM = 2
}



// 模拟农事活动数据
export const activityList = Array.from({ length: 50 }).map(() => {
  const id = faker.string.uuid();
  const activityType = faker.helpers.arrayElement(Object.values(ActivityType).filter(t => typeof t === 'number')) as ActivityType;
  const status = faker.helpers.arrayElement(Object.values(ActivityStatus).filter(s => typeof s === 'number')) as ActivityStatus;
  const dataSource = faker.helpers.arrayElement(Object.values(DataSource).filter(d => typeof d === 'number')) as DataSource;

  // 使用真实的字段ID
  const fieldId = faker.helpers.arrayElement(['1', '2', '3', '4', '5']);

  // 根据字段ID选择对应的分区ID
  let sectionId;
  switch(fieldId) {
    case '1':
      sectionId = faker.helpers.arrayElement(['101', '102', '103']);
      break;
    case '2':
      sectionId = faker.helpers.arrayElement(['201', '202']);
      break;
    case '4':
      sectionId = faker.helpers.arrayElement(['401', '402']);
      break;
    case '5':
      sectionId = faker.helpers.arrayElement(['501']);
      break;
    default:
      sectionId = undefined;
  }

  // 创建时间（过去3个月内）
  const createTime = faker.date.recent({ days: 90 }).toISOString();

  // 开始时间（创建时间后1-7天）
  const startTimeDate = new Date(createTime);
  startTimeDate.setDate(startTimeDate.getDate() + faker.number.int({ min: 1, max: 7 }));
  const startTime = startTimeDate.toISOString();

  // 结束时间（开始时间后1-10天，仅对非计划中的活动）
  let endTime = undefined;
  if (status !== ActivityStatus.PLANNED) {
    const endTimeDate = new Date(startTime);
    endTimeDate.setDate(endTimeDate.getDate() + faker.number.int({ min: 1, max: 10 }));
    endTime = endTimeDate.toISOString();
  }

  // 更新时间
  const updateTime = endTime ? endTime : createTime;

  // 活动标题
  let title = '';
  switch (activityType) {
    case ActivityType.PLANTING:
      title = `${faker.helpers.arrayElement(['水稻', '小麦', '玉米', '大豆', '土豆', '花生'])}播种`;
      break;
    case ActivityType.FERTILIZING:
      title = `${faker.helpers.arrayElement(['氮肥', '磷肥', '钾肥', '复合肥', '有机肥'])}施肥`;
      break;
    case ActivityType.IRRIGATION:
      title = `${faker.helpers.arrayElement(['滴灌', '喷灌', '漫灌', '沟灌'])}灌溉`;
      break;
    case ActivityType.WEEDING:
      title = `${faker.helpers.arrayElement(['人工', '机械', '化学'])}除草`;
      break;
    case ActivityType.PESTCONTROL:
      title = `${faker.helpers.arrayElement(['杀虫剂', '杀菌剂', '除草剂'])}喷洒`;
      break;
    case ActivityType.HARVEST:
      title = `${faker.helpers.arrayElement(['水稻', '小麦', '玉米', '大豆', '土豆', '花生'])}收获`;
      break;
    case ActivityType.OTHER:
      title = `${faker.helpers.arrayElement(['土壤检测', '农田巡查', '设备维护', '技术培训'])}`;
      break;
  }

  // 材料
  const materialsCount = faker.number.int({ min: 0, max: 3 });
  const materials = Array.from({ length: materialsCount }).map(() =>
    faker.helpers.arrayElement([
      '复合肥', '氮肥', '磷肥', '钾肥', '有机肥',
      '杀虫剂', '杀菌剂', '除草剂',
      '水稻种子', '小麦种子', '玉米种子', '大豆种子',
      '灌溉设备', '收割机', '播种机', '拖拉机'
    ])
  );

  // 天气信息（非计划中活动可能有）
  let weatherInfo = undefined;
  if (status !== ActivityStatus.PLANNED) {
    weatherInfo = `${faker.helpers.arrayElement(['晴朗', '多云', '阴天', '小雨', '中雨', '大雨'])}, ${faker.number.int({ min: 10, max: 35 })}°C, ${faker.helpers.arrayElement(['微风', '无风', '大风'])}`;
  }

  // 效果描述（只有已完成活动有）
  let effectDescription = undefined;
  if (status === ActivityStatus.COMPLETED) {
    effectDescription = faker.helpers.arrayElement([
      '完成良好，作物生长情况正常',
      '效果明显，植物长势更强',
      '除虫/除草效果显著',
      '灌溉均匀，土壤湿度适宜',
      '收成良好，产量高于预期',
      '施肥均匀，植物吸收良好'
    ]);
  }

  // 图片（模拟URL，实际项目中应替换为真实图片URL）
  const imageCount = faker.number.int({ min: 0, max: 5 });
  const images = Array.from({ length: imageCount }).map((_, index) =>
    `https://picsum.photos/id/${faker.number.int({ min: 1, max: 1000 })}/800/600`
  );

  return {
    id,
    fieldId,
    sectionId,
    activityType,
    title,
    description: faker.lorem.paragraph(),
    startTime,
    endTime,
    status,
    executor: faker.person.fullName(),
    materials,
    dataSource,
    weatherInfo,
    effectDescription,
    images,
    createTime,
    updateTime,
    remark: faker.helpers.maybe(() => faker.lorem.sentences(2), { probability: 0.4 }),
  };
});

// 根据ID获取农事活动
export function getActivityById(id: string) {
  return activityList.find(activity => activity.id === id);
}

// 添加农事活动
export function addActivity(activityData: any) {
  const id = faker.string.uuid();
  const now = new Date().toISOString();

  const newActivity = {
    id,
    ...activityData,
    createTime: now,
    updateTime: now,
  };

  activityList.unshift(newActivity);
  return newActivity;
}

// 更新农事活动
export function updateActivity(id: string, activityData: any) {
  const index = activityList.findIndex(activity => activity.id === id);
  if (index === -1) {
    throw new Error(`未找到ID为${id}的活动`);
  }

  const updatedActivity = {
    ...activityList[index],
    ...activityData,
    updateTime: new Date().toISOString(),
  };

  activityList[index] = updatedActivity;
  return updatedActivity;
}

// 删除农事活动
export function deleteActivity(id: string) {
  const index = activityList.findIndex(activity => activity.id === id);
  if (index === -1) {
    throw new Error(`未找到ID为${id}的活动`);
  }

  activityList.splice(index, 1);
  return { success: true };
}
