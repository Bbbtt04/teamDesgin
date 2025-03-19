import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      id,
      name,
      type,
      model,
      serialNumber,
      status,
      location,
      fieldId,
      sectionId,
      installTime,
      lastMaintenanceTime,
      nextMaintenanceTime,
      description,
      manufacturer,
      purchaseDate,
    } = body;

    // 检查设备是否存在
    const existingEquipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!existingEquipment) {
      return useResponseError('设备不存在');
    }

    // 如果修改了序列号,检查新序列号是否已存在
    if (serialNumber && serialNumber !== existingEquipment.serialNumber) {
      const duplicateEquipment = await prisma.equipment.findUnique({
        where: { serialNumber },
      });
      if (duplicateEquipment) {
        return useResponseError('设备序列号已存在');
      }
    }

    // 如果指定了大田,检查大田是否存在
    if (fieldId) {
      const field = await prisma.field.findUnique({
        where: { id: fieldId },
      });
      if (!field) {
        return useResponseError('指定的大田不存在');
      }
    }

    // 如果指定了分区,检查分区是否存在
    if (sectionId) {
      const section = await prisma.fieldSection.findUnique({
        where: { id: sectionId },
      });
      if (!section) {
        return useResponseError('指定的分区不存在');
      }
    }

    // 更新设备
    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        name,
        type: type ? Number(type) : undefined,
        model,
        serialNumber,
        status: status ? Number(status) : undefined,
        location,
        fieldId,
        sectionId,
        installTime: installTime ? new Date(installTime) : undefined,
        lastMaintenanceTime: lastMaintenanceTime ? new Date(lastMaintenanceTime) : undefined,
        nextMaintenanceTime: nextMaintenanceTime ? new Date(nextMaintenanceTime) : undefined,
        description,
        manufacturer,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      },
      include: {
        field: true,
        section: true,
      },
    });

    return useResponseSuccess(equipment);
  } catch (error: any) {
    console.error('更新设备失败:', error);
    return useResponseError(error.message || '更新设备失败');
  }
});
