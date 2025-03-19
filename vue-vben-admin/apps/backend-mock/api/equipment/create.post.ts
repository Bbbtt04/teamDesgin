import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
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

    // 检查序列号是否已存在
    const existingEquipment = await prisma.equipment.findUnique({
      where: { serialNumber },
    });

    if (existingEquipment) {
      return useResponseError('设备序列号已存在');
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

    // 创建设备
    const equipment = await prisma.equipment.create({
      data: {
        name,
        type: Number(type),
        model,
        serialNumber,
        status: Number(status),
        location,
        fieldId,
        sectionId,
        installTime: installTime ? new Date(installTime) : null,
        lastMaintenanceTime: lastMaintenanceTime ? new Date(lastMaintenanceTime) : null,
        nextMaintenanceTime: nextMaintenanceTime ? new Date(nextMaintenanceTime) : null,
        description,
        manufacturer,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      },
      include: {
        field: true,
        section: true,
      },
    });

    return useResponseSuccess(equipment);
  } catch (error: any) {
    console.error('创建设备失败:', error);
    return useResponseError(error.message || '创建设备失败');
  }
});
