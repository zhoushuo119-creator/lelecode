/**
 * 乐乐code 多模型支持 & OpenAI 兼容层
 *
 * 支持三种 API 格式：
 * 1. Anthropic 原生格式（默认）
 * 2. OpenAI 兼容格式（如 DeepSeek、GPT-4o via proxy、OneAPI）
 *
 * 配置方式（在 ~/.lelecode/config.json 的 endpoints 里）：
 * {
 *   "name": "deepseek",
 *   "label": "🔮 DeepSeek",
 *   "baseUrl": "https://api.deepseek.com",
 *   "apiKey": "sk-xxx",
 *   "model": "deepseek-chat",
 *   "apiFormat": "openai"   ← 指定为 openai 格式
 * }
 */

// 常见模型的预设配置
export const POPULAR_MODELS = [
  // Anthropic Claude 系列
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 ✦', provider: 'anthropic', recommended: true },
  { id: 'claude-opus-4',     label: 'Claude Opus 4 (最强)', provider: 'anthropic' },
  { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  { id: 'claude-3-5-haiku-20241022',  label: 'Claude 3.5 Haiku (快)', provider: 'anthropic' },
  // OpenAI 系列
  { id: 'gpt-4o',          label: 'GPT-4o',              provider: 'openai', apiFormat: 'openai' },
  { id: 'gpt-4o-mini',     label: 'GPT-4o Mini (快)',    provider: 'openai', apiFormat: 'openai' },
  { id: 'gpt-4-turbo',     label: 'GPT-4 Turbo',        provider: 'openai', apiFormat: 'openai' },
  // DeepSeek
  { id: 'deepseek-chat',        label: 'DeepSeek Chat V3', provider: 'deepseek', apiFormat: 'openai' },
  { id: 'deepseek-reasoner',    label: 'DeepSeek R1 (推理)', provider: 'deepseek', apiFormat: 'openai' },
  // Gemini (via OpenAI compat)
  { id: 'gemini-2.0-flash',     label: 'Gemini 2.0 Flash', provider: 'google', apiFormat: 'openai' },
  { id: 'gemini-1.5-pro',       label: 'Gemini 1.5 Pro',   provider: 'google', apiFormat: 'openai' },
  // 国产模型
  { id: 'qwen-max',          label: 'Qwen Max (通义千问)', provider: 'alibaba', apiFormat: 'openai' },
  { id: 'glm-4',             label: 'GLM-4 (智谱)',       provider: 'zhipu',   apiFormat: 'openai' },
]

export interface ModelPreset {
  id: string
  label: string
  provider: string
  apiFormat?: 'anthropic' | 'openai'
  recommended?: boolean
}

/**
 * 获取当前配置的 API 格式类型
 * 如果是已知 OpenAI 兼容中转站，返回 'openai'
 */
export function detectApiFormat(baseUrl: string): 'anthropic' | 'openai' {
  const openaiPatterns = [
    'openai.com',
    'api.deepseek.com',
    'generativelanguage.googleapis.com',
    'dashscope.aliyuncs.com',
    'open.bigmodel.cn',
    'api.moonshot.cn',
    'api.groq.com',
    'api.together.xyz',
    'api.mistral.ai',
  ]
  const lower = baseUrl.toLowerCase()
  if (openaiPatterns.some(p => lower.includes(p))) return 'openai'
  return 'anthropic'
}

/**
 * 检查当前配置的中转站是否是 OpenAI 格式
 * 读取 LELE_API_FORMAT 环境变量（由 leleconfig.ts 注入）
 */
export function isOpenAICompatMode(): boolean {
  return process.env.LELE_API_FORMAT === 'openai'
}
