// 大田数据
export const fieldList = [
  {
    id: '1',
    name: '东湖大田',
    address: '湖北省武汉市洪山区东湖路120号',
    manager: '张三',
    area: 500,
    areaUnit: '亩',
    createTime: '2023-01-10T08:00:00Z',
    updateTime: '2023-01-15T10:30:00Z',
    status: 1,
    remark: '主要种植水稻',
    sections: [
      {
        id: '101',
        fieldId: '1',
        name: 'A区',
        area: 150,
        areaUnit: '亩',
        cropType: '水稻',
        status: 1,
        createTime: '2023-01-10T08:00:00Z',
        updateTime: '2023-01-15T10:30:00Z',
        remark: '早稻种植区'
      },
      {
        id: '102',
        fieldId: '1',
        name: 'B区',
        area: 200,
        areaUnit: '亩',
        cropType: '水稻',
        status: 1,
        createTime: '2023-01-10T08:00:00Z',
        updateTime: '2023-01-15T10:30:00Z',
        remark: '晚稻种植区'
      },
      {
        id: '103',
        fieldId: '1',
        name: 'C区',
        area: 150,
        areaUnit: '亩',
        cropType: '小麦',
        status: 1,
        createTime: '2023-01-10T08:00:00Z',
        updateTime: '2023-01-15T10:30:00Z',
        remark: '轮作区'
      }
    ]
  },
  {
    id: '2',
    name: '南湖大田',
    address: '湖北省武汉市江夏区南湖大道456号',
    manager: '李四',
    area: 300,
    areaUnit: '亩',
    createTime: '2023-02-05T09:15:00Z',
    updateTime: '2023-02-10T14:20:00Z',
    status: 1,
    remark: '主要种植蔬菜',
    sections: [
      {
        id: '201',
        fieldId: '2',
        name: 'A区',
        area: 100,
        areaUnit: '亩',
        cropType: '白菜',
        status: 1,
        createTime: '2023-02-05T09:15:00Z',
        updateTime: '2023-02-10T14:20:00Z',
        remark: '叶菜区'
      },
      {
        id: '202',
        fieldId: '2',
        name: 'B区',
        area: 200,
        areaUnit: '亩',
        cropType: '萝卜',
        status: 1,
        createTime: '2023-02-05T09:15:00Z',
        updateTime: '2023-02-10T14:20:00Z',
        remark: '根茎类蔬菜区'
      }
    ]
  },
  {
    id: '3',
    name: '西山大田',
    address: '湖北省武汉市蔡甸区西山大道789号',
    manager: '王五',
    area: 800,
    areaUnit: '亩',
    createTime: '2023-03-01T07:30:00Z',
    updateTime: '2023-03-15T16:40:00Z',
    status: 0,
    remark: '休耕中',
    sections: []
  },
  {
    id: '4',
    name: '北原大田',
    address: '湖北省武汉市黄陂区北原路234号',
    manager: '赵六',
    area: 650,
    areaUnit: '亩',
    createTime: '2023-04-10T10:20:00Z',
    updateTime: '2023-04-20T11:10:00Z',
    status: 1,
    remark: '主要种植玉米',
    sections: [
      {
        id: '401',
        fieldId: '4',
        name: 'A区',
        area: 300,
        areaUnit: '亩',
        cropType: '玉米',
        status: 1,
        createTime: '2023-04-10T10:20:00Z',
        updateTime: '2023-04-20T11:10:00Z',
        remark: '春玉米区'
      },
      {
        id: '402',
        fieldId: '4',
        name: 'B区',
        area: 350,
        areaUnit: '亩',
        cropType: '玉米',
        status: 1,
        createTime: '2023-04-10T10:20:00Z',
        updateTime: '2023-04-20T11:10:00Z',
        remark: '夏玉米区'
      }
    ]
  },
  {
    id: '5',
    name: '中央大田',
    address: '湖北省武汉市江汉区中央大道567号',
    manager: '钱七',
    area: 400,
    areaUnit: '亩',
    createTime: '2023-05-05T08:45:00Z',
    updateTime: '2023-05-15T09:30:00Z',
    status: 1,
    remark: '主要种植花生',
    sections: [
      {
        id: '501',
        fieldId: '5',
        name: 'A区',
        area: 400,
        areaUnit: '亩',
        cropType: '花生',
        status: 1,
        createTime: '2023-05-05T08:45:00Z',
        updateTime: '2023-05-15T09:30:00Z',
        remark: '油料作物区'
      }
    ]
  }
];

// 根据ID获取大田详情
export function getFieldById(id: string) {
  return fieldList.find(field => field.id === id);
}

// 获取大田分区列表
export function getFieldSections(fieldId: string) {
  const field = getFieldById(fieldId);
  return field ? field.sections : [];
}

// 添加大田
export function addField(field) {
  const newField = {
    ...field,
    id: String(fieldList.length + 1),
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString(),
    sections: []
  };
  fieldList.push(newField);
  return newField;
}

// 更新大田
export function updateField(field) {
  const index = fieldList.findIndex(item => item.id === field.id);
  if (index !== -1) {
    const sections = fieldList[index].sections;
    fieldList[index] = {
      ...field,
      updateTime: new Date().toISOString(),
      sections
    };
    return fieldList[index];
  }
  return null;
}

// 删除大田
export function deleteField(id: string) {
  const index = fieldList.findIndex(item => item.id === id);
  if (index !== -1) {
    fieldList.splice(index, 1);
    return true;
  }
  return false;
}

// 添加大田分区
export function addFieldSection(section) {
  const field = getFieldById(section.fieldId);
  if (field) {
    const newSection = {
      ...section,
      id: `${field.id}${String(field.sections.length + 1).padStart(2, '0')}`,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    };
    field.sections.push(newSection);
    return newSection;
  }
  return null;
}

// 更新大田分区
export function updateFieldSection(section) {
  const field = getFieldById(section.fieldId);
  if (field) {
    const index = field.sections.findIndex(item => item.id === section.id);
    if (index !== -1) {
      field.sections[index] = {
        ...section,
        updateTime: new Date().toISOString()
      };
      return field.sections[index];
    }
  }
  return null;
}

// 删除大田分区
export function deleteFieldSection(id: string) {
  for (const field of fieldList) {
    const index = field.sections.findIndex(item => item.id === id);
    if (index !== -1) {
      field.sections.splice(index, 1);
      return true;
    }
  }
  return false;
}
