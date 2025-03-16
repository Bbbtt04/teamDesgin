export default {
  title: 'Equipment',
  management: 'Equipment Management',
  detail: 'Equipment Detail',
  statistics: 'Equipment Statistics',

  // Form fields
  name: 'Name',
  type: 'Type',
  model: 'Model',
  serialNumber: 'Serial Number',
  deviceStatus: 'Status',
  batteryLevel: 'Battery Level',
  lastReportTime: 'Last Report Time',
  installTime: 'Install Time',
  manufacturer: 'Manufacturer',
  ipAddress: 'IP Address',
  location: 'Location',
  description: 'Description',
  fieldId: 'Field',
  sectionId: 'Section',

  // Equipment types
  types: {
    tempHumiditySensor: 'Temperature & Humidity Sensor',
    soilMoistureSensor: 'Soil Moisture Sensor',
    lightSensor: 'Light Sensor',
    co2Sensor: 'CO2 Sensor',
    camera: 'Camera',
    weatherStation: 'Weather Station',
    irrigationController: 'Irrigation Controller',
    other: 'Other',
  },

  // Equipment status
  statusTypes: {
    online: 'Online',
    offline: 'Offline',
    fault: 'Fault',
    maintenance: 'Maintenance',
  },

  // Buttons and actions
  actions: {
    add: 'Add Equipment',
    edit: 'Edit Equipment',
    delete: 'Delete Equipment',
    view: 'View Details',
    confirm: 'Confirm',
    cancel: 'Cancel',
    search: 'Search',
    reset: 'Reset',
  },

  // Messages
  messages: {
    deleteConfirm: 'Are you sure you want to delete this equipment?',
    deleteSuccess: 'Delete successful',
    deleteFailed: 'Delete failed',
    addSuccess: 'Add successful',
    addFailed: 'Add failed',
    editSuccess: 'Edit successful',
    editFailed: 'Edit failed',
    loadFailed: 'Failed to load equipment list',
  },

  // Form validation
  rules: {
    nameRequired: 'Please enter equipment name',
    typeRequired: 'Please select equipment type',
    modelRequired: 'Please enter equipment model',
    serialNumberRequired: 'Please enter serial number',
    fieldRequired: 'Please select field',
    statusRequired: 'Please select status',
    manufacturerRequired: 'Please enter manufacturer',
    installTimeRequired: 'Please select install time',
  },
};
