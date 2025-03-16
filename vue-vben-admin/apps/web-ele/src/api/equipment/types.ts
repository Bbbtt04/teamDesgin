import type { EquipmentType, EquipmentStatus } from '@/enums/equipment';

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

export interface PageResult<T> {
  items: T[];
  total: number;
}
