import { faker } from '@faker-js/faker/locale/zh_CN';

/**
 * 设备类型枚举
 */
export enum EquipmentType {
  /** 温湿度传感器 */
  TEMP_HUMIDITY_SENSOR = 0,
  /** 土壤湿度传感器 */
  SOIL_MOISTURE_SENSOR = 1,
  /** 光照传感器 */
  LIGHT_SENSOR = 2,
  /** 二氧化碳传感器 */
  CO2_SENSOR = 3,
  /** 摄像头 */
  CAMERA = 4,
  /** 气象站 */
  WEATHER_STATION = 5,
  /** 灌溉控制器 */
  IRRIGATION_CONTROLLER = 6,
  /** 其他 */
  OTHER = 99
}

/**
 * 设备状态枚举
 */
export enum EquipmentStatus {
  /** 在线 */
  ONLINE = 0,
  /** 离线 */
  OFFLINE = 1,
  /** 故障 */
  FAULT = 2,
  /** 维护中 */
  MAINTENANCE = 3
}

/**
 * 设备信息接口
 */
export interface Equipment {
  lastMaintenanceTime: any;
  id: string;
  name: string;
  type: EquipmentType;
  model: string;
  serialNumber: string;
  fieldId: string;
  sectionId?: string;
  status: EquipmentStatus;
  batteryLevel?: number;
  lastReportTime: string;
  installTime: string;
  description?: string;
  manufacturer: string;
  ipAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createTime: string;
  updateTime: string;
}

// 模拟设备数据
export const equipmentList: Equipment[] = Array.from({ length: 30 }).map(() => {
  const id = faker.string.uuid();
  const type = faker.helpers.arrayElement(Object.values(EquipmentType).filter(t => typeof t === 'number')) as EquipmentType;
  const status = faker.helpers.arrayElement(Object.values(EquipmentStatus).filter(s => typeof s === 'number')) as EquipmentStatus;

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

  // 安装时间（过去1年内）
  const installTime = faker.date.past({ years: 1 }).toISOString();

  // 创建时间（安装时间）
  const createTime = installTime;

  // 最后上报时间（过去24小时内，如果设备在线；过去7天内，如果设备离线）
  let lastReportTime;
  if (status === EquipmentStatus.ONLINE) {
    lastReportTime = faker.date.recent({ days: 1 }).toISOString();
  } else {
    lastReportTime = faker.date.recent({ days: 7 }).toISOString();
  }

  // 更新时间
  const updateTime = lastReportTime;

  // 电池电量（只有部分设备有电池）
  let batteryLevel;
  if (faker.datatype.boolean()) {
    batteryLevel = faker.number.int({ min: 1, max: 100 });
  }

  // 设备名称
  let name = '';
  switch (type) {
    case EquipmentType.TEMP_HUMIDITY_SENSOR:
      name = `温湿度传感器-${faker.string.alphanumeric(5).toUpperCase()}`;
      break;
    case EquipmentType.SOIL_MOISTURE_SENSOR:
      name = `土壤湿度传感器-${faker.string.alphanumeric(5).toUpperCase()}`;
      break;
    case EquipmentType.LIGHT_SENSOR:
      name = `光照传感器-${faker.string.alphanumeric(5).toUpperCase()}`;
      break;
    case EquipmentType.CO2_SENSOR:
      name = `CO2传感器-${faker.string.alphanumeric(5).toUpperCase()}`;
      break;
    case EquipmentType.CAMERA:
      name = `摄像头-${faker.string.alphanumeric(5).toUpperCase()}`;
      break;
    case EquipmentType.WEATHER_STATION:
      name = `气象站-${faker.string.alphanumeric(5).toUpperCase()}`;
      break;
    case EquipmentType.IRRIGATION_CONTROLLER:
      name = `灌溉控制器-${faker.string.alphanumeric(5).toUpperCase()}`;
      break;
    case EquipmentType.OTHER:
      name = `其他设备-${faker.string.alphanumeric(5).toUpperCase()}`;
      break;
  }

  // 设备型号
  const models = {
    [EquipmentType.TEMP_HUMIDITY_SENSOR]: ['TH-100', 'TH-200', 'TH-300', 'SHT31', 'DHT22'],
    [EquipmentType.SOIL_MOISTURE_SENSOR]: ['SM-100', 'SM-200', 'SM-300', 'EC-5', 'TEROS-12'],
    [EquipmentType.LIGHT_SENSOR]: ['LS-100', 'LS-200', 'LS-300', 'TSL2591', 'BH1750'],
    [EquipmentType.CO2_SENSOR]: ['CO2-100', 'CO2-200', 'CO2-300', 'MH-Z19B', 'SCD30'],
    [EquipmentType.CAMERA]: ['CAM-100', 'CAM-200', 'CAM-300', 'ESP32-CAM', 'Pi-CAM'],
    [EquipmentType.WEATHER_STATION]: ['WS-100', 'WS-200', 'WS-300', 'Davis-VP2', 'MeteoHelix'],
    [EquipmentType.IRRIGATION_CONTROLLER]: ['IC-100', 'IC-200', 'IC-300', 'Hunter-Pro', 'Rainbird'],
    [EquipmentType.OTHER]: ['OT-100', 'OT-200', 'OT-300', 'Generic-1', 'Generic-2']
  };

  const model = faker.helpers.arrayElement(models[type] || models[EquipmentType.OTHER]);

  // 制造商
  const manufacturers = ['智农科技', '农业物联', '田野智能', '绿色科技', '智慧农场', '科技农业', '数字农场'];
  const manufacturer = faker.helpers.arrayElement(manufacturers);

  return {
    id,
    name,
    type,
    model,
    serialNumber: faker.string.alphanumeric(10).toUpperCase(),
    fieldId,
    sectionId,
    status,
    batteryLevel,
    lastReportTime,
    installTime,
    description: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.7 }),
    manufacturer,
    ipAddress: faker.helpers.maybe(() => faker.internet.ipv4(), { probability: 0.8 }),
    location: faker.helpers.maybe(() => ({
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude()
    }), { probability: 0.6 }),
    createTime,
    updateTime
  };
});

// 根据ID获取设备
export function getEquipmentById(id: string) {
  return equipmentList.find(equipment => equipment.id === id);
}

// 添加设备
export function addEquipment(equipmentData: any) {
  const id = faker.string.uuid();
  const now = new Date().toISOString();

  const newEquipment = {
    id,
    ...equipmentData,
    createTime: now,
    updateTime: now,
  };

  equipmentList.unshift(newEquipment);
  return newEquipment;
}

// 更新设备
export function updateEquipment(id: string, equipmentData: any) {
  const index = equipmentList.findIndex(equipment => equipment.id === id);
  if (index === -1) {
    throw new Error(`未找到ID为${id}的设备`);
  }

  const updatedEquipment = {
    ...equipmentList[index],
    ...equipmentData,
    updateTime: new Date().toISOString(),
  };

  equipmentList[index] = updatedEquipment;
  return updatedEquipment;
}

// 删除设备
export function deleteEquipment(id: string) {
  const index = equipmentList.findIndex(equipment => equipment.id === id);
  if (index === -1) {
    throw new Error(`未找到ID为${id}的设备`);
  }

  equipmentList.splice(index, 1);
  return { success: true };
}
