/** Shell chrome and General-nav dictionaries. */
export const zh = {
  trigger: '设置',
  title: '设置',
  close: '关闭',
  openDocument: '打开配置文件',
  'openDocument.error': '无法打开配置文件',
  'general.nav': '通用设置',
}

export const en = {
  trigger: 'Settings',
  title: 'Settings',
  close: 'Close',
  openDocument: 'Open configuration file',
  'openDocument.error': 'Could not open configuration file',
  'general.nav': 'General',
}

export type SettingsKey = keyof typeof zh
