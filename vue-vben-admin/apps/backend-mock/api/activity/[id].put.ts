import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      id,
      fieldId,
      sectionId,
      title,
      activityType,
      description,
      startTime,
      endTime,
      status,
      executor,
      materials,
      dataSource,
      weatherInfo,
      effectDescription,
      images,
      remark,
    } = body;

    // 检查活动是否存在
    const existingActivity = await prisma.activity.findUnique({
      where: { id },
    });
    if (!existingActivity) {
      return useResponseError('活动不存在');
    }

    // 检查大田是否存在
    const field = await prisma.field.findUnique({
      where: { id: fieldId },
    });
    if (!field) {
      return useResponseError('大田不存在');
    }

    // 检查分区是否存在
    if (sectionId) {
      const section = await prisma.fieldSection.findUnique({
        where: { id: sectionId },
      });
      if (!section) {
        return useResponseError('分区不存在');
      }
    }

    // 更新活动
    const activity = await prisma.activity.update({
      where: { id },
      data: {
        fieldId,
        sectionId,
        title,
        activityType: Number(activityType),
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        status: Number(status),
        executor,
        materials: Array.isArray(materials) ? materials : null,
        dataSource: Number(dataSource),
        weatherInfo,
        effectDescription,
        images: Array.isArray(images) ? images : null,
        remark,
      },
      include: {
        field: true,
        section: true,
      },
    });

    return useResponseSuccess(activity);
  } catch (error: any) {
    console.error('更新活动失败:', error);
    return useResponseError(error.message || '更新活动失败');
  }
});
