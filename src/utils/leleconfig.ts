/**
 * 乐乐code 配置文件管理
 *
 * 配置文件位置：~/.lelecode/config.json
 *
 * 支持配置项：
 * - defaultEndpoint: 默认使用的中转站名称
 * - endpoints: 中转站列表（支持多个）
 * - defaultModel: 默认模型
 *
 * 示例配置：
 * {
 *   "defaultEndpoint": "duckcoding",
 *   "defaultModel": "claude-sonnet-4-6",
 *   "endpoints": [
 *     {
 *       "name": "duckcoding",
 *       "label": "🦆 DuckCoding",
 *       "baseUrl": "https://api.duckcoding.ai",
 *       "apiKey": "sk-xxx"
 *     },
 *     {
 *       "name": "openrouter",
 *       "label": "🌐 OpenRouter",
 *       "baseUrl": "https://openrouter.ai/api/v1",
 *       "apiKey": "sk-or-xxx"
 *     }
 *   ]
 * }
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

export interface LelecodeEndpoint {
  name: string      // 唯一标识，如 "duckcoding"
  label: string     // 显示名称，如 "🦆 DuckCoding"
  baseUrl: string   // API 地址，如 "https://api.duckcoding.ai"
  apiKey: string    // API Key
  model?: string    // 该端点专用模型（可选，优先级高于 defaultModel）
  apiFormat?: 'anthropic' | 'openai'  // API 格式（默认 anthropic）
}

export interface LelecodeConfig {
  defaultEndpoint?: string      // 默认使用的端点 name
  defaultModel?: string         // 默认模型
  endpoints?: LelecodeEndpoint[]
}

const CONFIG_DIR = join(homedir(), '.lelecode')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')

/**
 * 读取配置文件，不存在则返回空对象
 */
export function readLelecodeConfig(): LelecodeConfig {
  try {
    if (!existsSync(CONFIG_FILE)) {
      return {}
    }
    const raw = readFileSync(CONFIG_FILE, 'utf-8')
    return JSON.parse(raw) as LelecodeConfig
  } catch {
    return {}
  }
}

/**
 * 写入配置文件，目录不存在时自动创建
 */
export function writeLelecodeConfig(config: LelecodeConfig): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true })
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')
}

/**
 * 获取当前生效的端点配置
 * 优先级：环境变量 > config.defaultEndpoint > endpoints[0]
 */
export function getActiveEndpoint(): LelecodeEndpoint | null {
  // 如果环境变量已经设置，不强制覆盖
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_BASE_URL) {
    return null
  }

  const config = readLelecodeConfig()
  if (!config.endpoints || config.endpoints.length === 0) {
    return null
  }

  // 优先使用 defaultEndpoint
  if (config.defaultEndpoint) {
    const found = config.endpoints.find(e => e.name === config.defaultEndpoint)
    if (found) return found
  }

  // 否则用第一个
  return config.endpoints[0] ?? null
}

/**
 * 将配置文件中的端点注入到环境变量
 * 在程序启动最早期调用
 */
export function applyLelecodeConfig(): void {
  const endpoint = getActiveEndpoint()
  if (!endpoint) return

  if (!process.env.ANTHROPIC_API_KEY) {
    process.env.ANTHROPIC_API_KEY = endpoint.apiKey
  }
  if (!process.env.ANTHROPIC_BASE_URL) {
    process.env.ANTHROPIC_BASE_URL = endpoint.baseUrl
  }

  // 模型：端点专属模型 > config.defaultModel
  if (!process.env.ANTHROPIC_MODEL) {
    const config = readLelecodeConfig()
    const model = endpoint.model ?? config.defaultModel
    if (model) {
      process.env.ANTHROPIC_MODEL = model
    }
  }

  // API 格式：自动检测或从配置读取，注入环境变量供后续使用
  if (!process.env.LELE_API_FORMAT) {
    // 1. 优先用配置中显式声明的格式
    if (endpoint.apiFormat) {
      process.env.LELE_API_FORMAT = endpoint.apiFormat
    } else {
      // 2. 根据 baseUrl 自动检测（OpenAI 兼容中转站）
      const lower = endpoint.baseUrl.toLowerCase()
      const openaiPatterns = [
        'openai.com', 'deepseek.com', 'generativelanguage.googleapis.com',
        'dashscope.aliyuncs.com', 'open.bigmodel.cn', 'moonshot.cn',
        'groq.com', 'together.xyz', 'mistral.ai', 'openrouter.ai',
      ]
      if (openaiPatterns.some(p => lower.includes(p))) {
        process.env.LELE_API_FORMAT = 'openai'
      }
    }
  }
}

/**
 * 初始化默认配置文件（首次运行时调用）
 */
export function initDefaultConfig(params: {
  baseUrl: string
  apiKey: string
  model?: string
  name?: string
  label?: string
}): void {
  const config = readLelecodeConfig()
  const endpoint: LelecodeEndpoint = {
    name: params.name ?? 'default',
    label: params.label ?? '默认中转站',
    baseUrl: params.baseUrl,
    apiKey: params.apiKey,
    model: params.model,
  }

  config.endpoints = config.endpoints ?? []
  const idx = config.endpoints.findIndex(e => e.name === endpoint.name)
  if (idx >= 0) {
    config.endpoints[idx] = endpoint
  } else {
    config.endpoints.push(endpoint)
  }
  config.defaultEndpoint = config.defaultEndpoint ?? endpoint.name
  writeLelecodeConfig(config)
}

export { CONFIG_FILE, CONFIG_DIR }
