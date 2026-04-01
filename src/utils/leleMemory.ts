/**
 * 乐乐code 本地记忆系统
 *
 * 跨会话记住用户偏好、项目信息、常用指令等
 * 存储位置：~/.lelecode/memory.json
 *
 * 自动注入到系统提示词，让 AI 记住你的习惯
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const MEMORY_DIR = join(homedir(), '.lelecode')
const MEMORY_FILE = join(MEMORY_DIR, 'memory.json')

export interface MemoryEntry {
  key: string
  value: string
  category: 'preference' | 'project' | 'fact' | 'habit'
  createdAt: string
  updatedAt: string
}

export interface LelecodeMemory {
  version: '1'
  userName?: string          // 用户名
  preferredLanguage?: string // 偏好语言（如 TypeScript、Python）
  codeStyle?: string         // 代码风格偏好
  entries: MemoryEntry[]     // 自定义记忆条目
}

function ensureDir(): void {
  mkdirSync(MEMORY_DIR, { recursive: true })
}

export function readMemory(): LelecodeMemory {
  ensureDir()
  if (!existsSync(MEMORY_FILE)) {
    return { version: '1', entries: [] }
  }
  try {
    return JSON.parse(readFileSync(MEMORY_FILE, 'utf-8')) as LelecodeMemory
  } catch {
    return { version: '1', entries: [] }
  }
}

export function writeMemory(mem: LelecodeMemory): void {
  ensureDir()
  writeFileSync(MEMORY_FILE, JSON.stringify(mem, null, 2), 'utf-8')
}

export function addMemory(
  key: string,
  value: string,
  category: MemoryEntry['category'] = 'fact',
): void {
  const mem = readMemory()
  const now = new Date().toISOString()
  const existing = mem.entries.findIndex(e => e.key === key)
  if (existing >= 0) {
    mem.entries[existing]!.value = value
    mem.entries[existing]!.updatedAt = now
  } else {
    mem.entries.push({ key, value, category, createdAt: now, updatedAt: now })
  }
  writeMemory(mem)
}

export function deleteMemory(key: string): boolean {
  const mem = readMemory()
  const before = mem.entries.length
  mem.entries = mem.entries.filter(e => e.key !== key)
  if (mem.entries.length < before) {
    writeMemory(mem)
    return true
  }
  return false
}

/**
 * 生成注入到系统提示词的记忆摘要
 * 在每次对话开始时附加到系统提示
 */
export function getMemorySystemPrompt(): string {
  const mem = readMemory()
  const lines: string[] = []

  if (mem.userName) {
    lines.push(`用户名称：${mem.userName}`)
  }
  if (mem.preferredLanguage) {
    lines.push(`偏好编程语言：${mem.preferredLanguage}`)
  }
  if (mem.codeStyle) {
    lines.push(`代码风格：${mem.codeStyle}`)
  }

  const grouped: Record<string, MemoryEntry[]> = {}
  for (const e of mem.entries) {
    grouped[e.category] = grouped[e.category] ?? []
    grouped[e.category]!.push(e)
  }

  const categoryLabels: Record<MemoryEntry['category'], string> = {
    preference: '用户偏好',
    project: '项目信息',
    fact: '已知事实',
    habit: '工作习惯',
  }

  for (const [cat, entries] of Object.entries(grouped)) {
    const label = categoryLabels[cat as MemoryEntry['category']] ?? cat
    lines.push(`\n${label}：`)
    for (const e of entries) {
      lines.push(`  - ${e.key}：${e.value}`)
    }
  }

  if (lines.length === 0) return ''

  return `\n\n## 关于用户的记忆（乐乐code 记忆系统）\n${lines.join('\n')}`
}
