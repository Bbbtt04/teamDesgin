/**
 * 设备类型枚举
 */
export enum EquipmentType {
  /** 温湿度传感器 */
  TEMP_HUMIDITY_SENSOR = 1,
  /** 土壤湿度传感器 */
  SOIL_MOISTURE_SENSOR = 2,
  /** 光照传感器 */
  LIGHT_SENSOR = 3,
  /** 二氧化碳传感器 */
  CO2_SENSOR = 4,
  /** 摄像头 */
  CAMERA = 5,
  /** 气象站 */
  WEATHER_STATION = 6,
  /** 灌溉控制器 */
  IRRIGATION_CONTROLLER = 7,
  /** 其他 */
  OTHER = 8,
}

/**
 * 设备状态枚举
 */
export enum EquipmentStatus {
  /** 在线 */
  ONLINE = 1,
  /** 离线 */
  OFFLINE = 2,
  /** 故障 */
  FAULT = 3,
  /** 维护中 */
  MAINTENANCE = 4,
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
  status: EquipmentStatus;
  location?: string;
  fieldId?: string;
  sectionId?: string;
  installTime?: string;
  lastMaintenanceTime?: string;
  nextMaintenanceTime?: string;
  description?: string;
  manufacturer?: string;
  purchaseDate?: string;
  createTime: string;
  updateTime: string;
  field?: {
    id: string;
    name: string;
  };
  section?: {
    id: string;
    name: string;
  };
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
