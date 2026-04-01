import type { Command } from '../../commands.js'

const templateCmd: Command = {
  type: 'local-jsx',
  name: 'template',
  description: '项目模板管理 (list/use/save)',
  argumentHint: '[list|use <模板名>|save <模板名>]',
  load: () => import('./template.js'),
}

export default templateCmd
