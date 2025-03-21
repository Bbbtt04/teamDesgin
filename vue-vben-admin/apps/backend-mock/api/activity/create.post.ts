import { defineEventHandler, readBody } from 'h3';
import { prisma } from '~/modules/db';
import { useResponseSuccess, useResponseError } from '~/utils/response';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      fieldId,
      sectionId,
      activityType,
      title,
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

    // 安全地解析 JSON 数据
    let parsedMaterials = null;
    let parsedImages = null;

    try {
      if (materials && typeof materials === 'string') {
        parsedMaterials = JSON.parse(materials);
      }
    } catch (e) {
      console.warn('材料数据解析失败:', e);
    }

    try {
      if (images && typeof images === 'string') {
        parsedImages = JSON.parse(images);
      }
    } catch (e) {
      console.warn('图片数据解析失败:', e);
    }

    // 创建活动
    const activity = await prisma.activity.create({
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
        materials: parsedMaterials,
        dataSource: Number(dataSource),
        weatherInfo,
        effectDescription,
        images: parsedImages,
        remark,
      },
      include: {
        field: true,
        section: true,
      },
    });

    return useResponseSuccess(activity);
  } catch (error: any) {
    console.error('创建活动失败:', error);
    return useResponseError(error.message || '创建活动失败');
  }
});
