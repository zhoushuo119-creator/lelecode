import type { Command } from '../../commands.js'

const webCmd: Command = {
  type: 'local',
  name: 'web',
  description: '联网搜索（需要配置 SERPER_API_KEY 或 BING_API_KEY）',
  argumentHint: '<关键词>',
  load: () => import('./web.js'),
}

export default webCmd
