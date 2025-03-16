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

/**
 * 设备查询参数接口
 */
export interface EquipmentQueryParams {
  page: number;
  pageSize: number;
  name?: string;
  type?: EquipmentType;
  status?: EquipmentStatus;
  fieldId?: string;
  sectionId?: string;
}

/**
 * 设备列表响应接口
 */
export interface EquipmentListResult {
  items: Equipment[];
  total: number;
}
