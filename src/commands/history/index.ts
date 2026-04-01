import type { Command } from '../../commands.js'

const historyCmd: Command = {
  type: 'local-jsx',
  name: 'history',
  description: '搜索对话历史记录',
  argumentHint: '[关键词]',
  load: () => import('./history.js'),
}

export default historyCmd
