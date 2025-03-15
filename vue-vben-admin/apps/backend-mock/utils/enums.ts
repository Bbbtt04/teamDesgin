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
