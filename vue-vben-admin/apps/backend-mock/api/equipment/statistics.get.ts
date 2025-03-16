import { equipmentList, EquipmentStatus, EquipmentType } from '~/utils/equipment-data';
import { useResponseSuccess } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event);
    const { fieldId } = query;

    // 根据查询参数过滤设备列表
    let filteredEquipments = [...equipmentList];

    if (fieldId) {
      filteredEquipments = filteredEquipments.filter(equipment => equipment.fieldId === fieldId);
    }

    // 按状态统计
    const byStatus = {};
    Object.values(EquipmentStatus).forEach(status => {
      if (typeof status === 'number') {
        byStatus[status] = filteredEquipments.filter(e => e.status === status).length;
      }
    });

    // 按类型统计
    const byType = {};
    Object.values(EquipmentType).forEach(type => {
      if (typeof type === 'number') {
        byType[type] = filteredEquipments.filter(e => e.type === type).length;
      }
    });

    // 电池电量统计
    const batteryStats = {
      low: 0,  // 低于20%
      medium: 0,  // 20%-60%
      high: 0,  // 60%以上
      noData: 0  // 无电池数据
    };

    filteredEquipments.forEach(equipment => {
      if (equipment.batteryLevel === undefined) {
        batteryStats.noData++;
      } else if (equipment.batteryLevel < 20) {
        batteryStats.low++;
      } else if (equipment.batteryLevel < 60) {
        batteryStats.medium++;
      } else {
        batteryStats.high++;
      }
    });

    // 在线率统计
    const onlineRate = filteredEquipments.length > 0
      ? (byStatus[EquipmentStatus.ONLINE] || 0) / filteredEquipments.length
      : 0;

    return useResponseSuccess({
      totalCount: filteredEquipments.length,
      byStatus,
      byType,
      batteryStats,
      onlineRate
    });
  } catch (error) {
    console.error('获取设备统计出错:', error);
    return {
      code: 500,
      data: null,
      error,
      message: '获取设备统计失败',
    };
  }
});
