/**
 * 当 websocket 消息中类型字段的内容与目标表名不符，
 * 请在这里添加转换规则。目标表名对应实际表名，注意查阅 schemas/
 * 下的表名定义。
 *
 * 注：大小写区别，及单复数形式在名字末尾仅相差一个 's' 的情况
 * 已做自动转换，无需在此处添加映射。
 */
export default {
  Work: 'File',
  Works: 'File',
  ChatMessage: 'Activity',
  ChatMessages: 'Activity',
  Activities: 'Activity',
  HomeActivities: 'Activity'
}
