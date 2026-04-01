/**
 * 项目模板系统
 * 用法：/template list | /template use <名称> | /template save <名称>
 *
 * 模板存储在 ~/.lelecode/templates/<name>.json
 * 每个模板是一个对象，包含 name、description、files、prompt 等字段
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

export interface Template {
  name: string
  description: string
  prompt: string         // 启用模板时发给 AI 的初始提示
  createdAt: string
  tags?: string[]
}

const TEMPLATES_DIR = join(homedir(), '.lelecode', 'templates')

function ensureDir() {
  mkdirSync(TEMPLATES_DIR, { recursive: true })
}

export function listTemplates(): Template[] {
  ensureDir()
  try {
    return readdirSync(TEMPLATES_DIR)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        try {
          return JSON.parse(readFileSync(join(TEMPLATES_DIR, f), 'utf-8')) as Template
        } catch {
          return null
        }
      })
      .filter(Boolean) as Template[]
  } catch {
    return []
  }
}

export function getTemplate(name: string): Template | null {
  ensureDir()
  const p = join(TEMPLATES_DIR, `${name}.json`)
  if (!existsSync(p)) return null
  try {
    return JSON.parse(readFileSync(p, 'utf-8')) as Template
  } catch {
    return null
  }
}

export function saveTemplate(template: Template): void {
  ensureDir()
  writeFileSync(
    join(TEMPLATES_DIR, `${template.name}.json`),
    JSON.stringify(template, null, 2),
    'utf-8',
  )
}

// 内置模板
const BUILTIN_TEMPLATES: Template[] = [
  {
    name: 'react-app',
    description: 'React + TypeScript 前端项目',
    prompt: '帮我创建一个 React + TypeScript 的现代前端项目，使用 Vite 构建，包含 ESLint、Prettier 配置，以及一个基础的组件结构。',
    createdAt: '2024-01-01',
    tags: ['react', 'typescript', 'frontend'],
  },
  {
    name: 'node-api',
    description: 'Node.js REST API 服务',
    prompt: '帮我创建一个 Node.js + Express + TypeScript 的 REST API 项目，包含路由结构、中间件配置、错误处理和基础的 CRUD 接口示例。',
    createdAt: '2024-01-01',
    tags: ['node', 'api', 'backend'],
  },
  {
    name: 'python-script',
    description: 'Python 数据处理脚本',
    prompt: '帮我创建一个 Python 数据处理脚本项目，包含 requirements.txt、数据读取/清洗/分析/可视化的基础结构。',
    createdAt: '2024-01-01',
    tags: ['python', 'data'],
  },
  {
    name: 'full-stack',
    description: '全栈项目（Next.js + Prisma）',
    prompt: '帮我创建一个全栈项目，前端用 Next.js + React + Tailwind CSS，后端用 Prisma ORM + PostgreSQL，包含用户认证、基础 CRUD 操作示例。',
    createdAt: '2024-01-01',
    tags: ['nextjs', 'fullstack', 'prisma'],
  },
  {
    name: 'cli-tool',
    description: '命令行工具',
    prompt: '帮我创建一个 Node.js + TypeScript 命令行工具项目，使用 commander.js 解析参数，包含帮助信息、颜色输出、进度条等常用功能示例。',
    createdAt: '2024-01-01',
    tags: ['cli', 'node', 'typescript'],
  },
]

export function initBuiltinTemplates(): void {
  ensureDir()
  for (const tpl of BUILTIN_TEMPLATES) {
    const p = join(TEMPLATES_DIR, `${tpl.name}.json`)
    if (!existsSync(p)) {
      writeFileSync(p, JSON.stringify(tpl, null, 2), 'utf-8')
    }
  }
}

export async function call(
  onDone: (result?: string) => void,
  context: { cwd: string },
  args: string,
): Promise<void> {
  const parts = args.trim().split(/\s+/)
  const subCmd = parts[0] ?? 'list'
  const name = parts.slice(1).join(' ')

  initBuiltinTemplates()

  if (subCmd === 'list' || !subCmd) {
    const templates = listTemplates()
    const lines = [
      '📁 乐乐code · 项目模板库',
      '─'.repeat(40),
      '',
      ...templates.map(t =>
        `  • ${t.name.padEnd(16)} ${t.description}${t.tags ? '  [' + t.tags.join(', ') + ']' : ''}`,
      ),
      '',
      '用法：/template use <模板名>   启用模板',
      '      /template save <名称>   将当前 CLAUDE.md 保存为模板',
    ]
    onDone(lines.join('\n'))
    return
  }

  if (subCmd === 'use') {
    if (!name) {
      onDone('用法：/template use <模板名>')
      return
    }
    const tpl = getTemplate(name)
    if (!tpl) {
      onDone(`❌ 未找到模板 "${name}"，运行 /template list 查看可用模板`)
      return
    }
    onDone(`✅ 已选择模板「${tpl.description}」\n\n${tpl.prompt}`)
    return
  }

  if (subCmd === 'save') {
    if (!name) {
      onDone('用法：/template save <名称>')
      return
    }
    // 读取当前目录的 CLAUDE.md 作为模板内容
    const claudeMd = join(context.cwd, 'CLAUDE.md')
    const content = existsSync(claudeMd) ? readFileSync(claudeMd, 'utf-8') : ''
    const tpl: Template = {
      name,
      description: `自定义模板（${new Date().toLocaleDateString('zh-CN')}）`,
      prompt: content || `使用 ${name} 模板初始化项目`,
      createdAt: new Date().toISOString(),
    }
    saveTemplate(tpl)
    onDone(`✅ 已保存模板 "${name}"`)
    return
  }

  onDone(`未知子命令 "${subCmd}"，可用：list / use <名称> / save <名称>`)
}
