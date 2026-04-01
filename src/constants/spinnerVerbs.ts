import { getInitialSettings } from '../utils/settings/settings.js'

export function getSpinnerVerbs(): string[] {
  const settings = getInitialSettings()
  const config = settings.spinnerVerbs
  if (!config) {
    return SPINNER_VERBS
  }
  if (config.mode === 'replace') {
    return config.verbs.length > 0 ? config.verbs : SPINNER_VERBS
  }
  return [...SPINNER_VERBS, ...config.verbs]
}

// Spinner verbs for loading messages - 乐乐code 中文版
export const SPINNER_VERBS = [
  '思考中',
  '分析中',
  '计算中',
  '规划中',
  '推理中',
  '理解中',
  '探索中',
  '研究中',
  '学习中',
  '创作中',
  '编写中',
  '优化中',
  '调试中',
  '检查中',
  '整理中',
  '构建中',
  '生成中',
  '处理中',
  '运行中',
  '执行中',
  '搜索中',
  '查找中',
  '读取中',
  '解析中',
  '理解代码中',
  '脑洞大开中',
  '灵感涌现中',
  '深度思考中',
  '认真研究中',
  '仔细分析中',
  '全力以赴中',
  '开动脑筋中',
  '绞尽脑汁中',
  '冥思苦想中',
  '妙计连连中',
  '奋笔疾书中',
  '精益求精中',
  '字斟句酌中',
  '反复推敲中',
  '大展身手中',
  '施展魔法中',
  '乐在其中',
  '全神贯注中',
  '废寝忘食中',
  '马不停蹄中',
  '一气呵成中',
  '运筹帷幄中',
  '筑梦代码中',
  '乐乐加速中',
  '冲冲冲！',
]
