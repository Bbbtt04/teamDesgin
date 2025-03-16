export default {
  title: '农机设备',
  management: '设备管理',
  detail: '设备详情',
  statistics: '设备统计',

  // 表单字段
  name: '设备名称',
  type: '设备类型',
  model: '设备型号',
  serialNumber: '序列号',
  deviceStatus: '设备状态',
  batteryLevel: '电池电量',
  lastReportTime: '最后上报时间',
  installTime: '安装时间',
  manufacturer: '制造商',
  ipAddress: 'IP地址',
  location: '安装位置',
  description: '设备描述',
  fieldId: '所属农场',
  sectionId: '所属分区',

  // 设备类型
  types: {
    tempHumiditySensor: '温湿度传感器',
    soilMoistureSensor: '土壤湿度传感器',
    lightSensor: '光照传感器',
    co2Sensor: 'CO2传感器',
    camera: '摄像头',
    weatherStation: '气象站',
    irrigationController: '灌溉控制器',
    other: '其他设备',
  },

  // 设备状态
  statusTypes: {
    online: '在线',
    offline: '离线',
    fault: '故障',
    maintenance: '维护中',
  },

  // 按钮和操作
  actions: {
    add: '添加设备',
    edit: '编辑设备',
    delete: '删除设备',
    view: '查看详情',
    confirm: '确定',
    cancel: '取消',
    search: '查询',
    reset: '重置',
  },

  // 提示信息
  messages: {
    deleteConfirm: '确定要删除此设备吗？',
    deleteSuccess: '删除成功',
    deleteFailed: '删除失败',
    addSuccess: '添加成功',
    addFailed: '添加失败',
    editSuccess: '编辑成功',
    editFailed: '编辑失败',
    loadFailed: '加载设备列表失败',
  },

  // 表单验证
  rules: {
    nameRequired: '请输入设备名称',
    typeRequired: '请选择设备类型',
    modelRequired: '请输入设备型号',
    serialNumberRequired: '请输入序列号',
    fieldRequired: '请选择所属农场',
    statusRequired: '请选择设备状态',
    manufacturerRequired: '请输入制造商',
    installTimeRequired: '请选择安装时间',
  },
};
