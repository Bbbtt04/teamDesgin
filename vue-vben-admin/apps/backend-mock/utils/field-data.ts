import { prisma } from '~/modules/db';

// 根据ID获取大田详情
export async function getFieldById(id: string) {
  return await prisma.field.findUnique({
    where: { id },
    include: { sections: true },
  });
}

// 获取大田分区列表
export async function getFieldSections(fieldId: string) {
  const field = await getFieldById(fieldId);
  return field ? field.sections : [];
}

// 添加大田
export async function addField(field) {
  const newField = await prisma.field.create({
    data: {
      ...field,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    },
  });
  return newField;
}

// 更新大田
export async function updateField(field) {
  const updatedField = await prisma.field.update({
    where: { id: field.id },
    data: {
      ...field,
      updateTime: new Date().toISOString(),
    },
  });
  return updatedField;
}

// 删除大田
export async function deleteField(id: string) {
  await prisma.field.delete({
    where: { id },
  });
  return true;
}

// 添加大田分区
export async function addFieldSection(section) {
  const newSection = await prisma.fieldSection.create({
    data: {
      ...section,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    },
  });
  return newSection;
}

// 更新大田分区
export async function updateFieldSection(section) {
  const updatedSection = await prisma.fieldSection.update({
    where: { id: section.id },
    data: {
      ...section,
      updateTime: new Date().toISOString(),
    },
  });
  return updatedSection;
}

// 删除大田分区
export async function deleteFieldSection(id: string) {
  await prisma.fieldSection.delete({
    where: { id },
  });
  return true;
}
