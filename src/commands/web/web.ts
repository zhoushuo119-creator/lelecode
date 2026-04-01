/**
 * /web 联网搜索命令
 *
 * 支持的搜索 API（按优先级）：
 * 1. Serper API  — 环境变量 SERPER_API_KEY  (https://serper.dev, 免费 2500次/月)
 * 2. Bing Search — 环境变量 BING_API_KEY    (Azure Cognitive Services)
 * 3. DuckDuckGo  — 无需 key，备用方案（通过 HTML 解析）
 *
 * 用法：/web <关键词>
 */

async function serperSearch(
  query: string,
  apiKey: string,
): Promise<string> {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 5, hl: 'zh-cn', gl: 'cn' }),
  })
  if (!res.ok) throw new Error(`Serper API 错误：${res.status}`)
  const data = (await res.json()) as {
    organic?: Array<{ title: string; link: string; snippet: string }>
    knowledgeGraph?: { description?: string }
    answerBox?: { answer?: string; snippet?: string }
  }

  const lines: string[] = [`🔍 搜索结果：${query}\n`]

  if (data.answerBox?.answer || data.answerBox?.snippet) {
    lines.push(`📌 直接答案：${data.answerBox.answer ?? data.answerBox.snippet}\n`)
  }
  if (data.knowledgeGraph?.description) {
    lines.push(`📚 知识图谱：${data.knowledgeGraph.description}\n`)
  }

  const results = data.organic ?? []
  results.slice(0, 5).forEach((r, i) => {
    lines.push(`${i + 1}. **${r.title}**`)
    lines.push(`   ${r.snippet}`)
    lines.push(`   ${r.link}\n`)
  })

  return lines.join('\n')
}

async function bingSearch(
  query: string,
  apiKey: string,
): Promise<string> {
  const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=5&mkt=zh-CN`
  const res = await fetch(url, {
    headers: { 'Ocp-Apim-Subscription-Key': apiKey },
  })
  if (!res.ok) throw new Error(`Bing API 错误：${res.status}`)
  const data = (await res.json()) as {
    webPages?: {
      value?: Array<{ name: string; url: string; snippet: string }>
    }
  }

  const lines: string[] = [`🔍 搜索结果（Bing）：${query}\n`]
  const results = data.webPages?.value ?? []
  results.forEach((r, i) => {
    lines.push(`${i + 1}. **${r.name}**`)
    lines.push(`   ${r.snippet}`)
    lines.push(`   ${r.url}\n`)
  })
  return lines.join('\n')
}

async function duckduckgoSearch(query: string): Promise<string> {
  // DuckDuckGo Instant Answer API（免费，无需 key，但结果有限）
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'lelecode/1.0.0' },
  })
  if (!res.ok) throw new Error(`DuckDuckGo API 错误：${res.status}`)
  const data = (await res.json()) as {
    AbstractText?: string
    AbstractURL?: string
    RelatedTopics?: Array<{ Text?: string; FirstURL?: string; Topics?: unknown[] }>
  }

  const lines: string[] = [
    `🔍 搜索结果（DuckDuckGo）：${query}`,
    `⚠️  DuckDuckGo 结果有限，建议配置 SERPER_API_KEY 获得更好体验\n`,
  ]

  if (data.AbstractText) {
    lines.push(`📌 摘要：${data.AbstractText}`)
    if (data.AbstractURL) lines.push(`   来源：${data.AbstractURL}\n`)
  }

  const related = data.RelatedTopics ?? []
  let count = 0
  for (const r of related) {
    if (count >= 5) break
    if (r.Topics) continue // 跳过分类标题
    if (r.Text && r.FirstURL) {
      lines.push(`${count + 1}. ${r.Text.slice(0, 100)}`)
      lines.push(`   ${r.FirstURL}\n`)
      count++
    }
  }

  if (lines.length <= 2) {
    lines.push('未找到相关结果，请尝试不同的关键词。')
  }

  return lines.join('\n')
}

export async function call(
  onDone: (result: string) => void,
  _context: unknown,
  args: string,
): Promise<void> {
  const query = args.trim()
  if (!query) {
    onDone(
      '用法：/web <关键词>\n\n示例：\n  /web TypeScript 最佳实践\n  /web React hooks 教程\n\n配置搜索 API key 获得更好结果：\n  export SERPER_API_KEY=xxx  (推荐，https://serper.dev 免费注册)',
    )
    return
  }

  try {
    let result: string

    if (process.env.SERPER_API_KEY) {
      result = await serperSearch(query, process.env.SERPER_API_KEY)
    } else if (process.env.BING_API_KEY) {
      result = await bingSearch(query, process.env.BING_API_KEY)
    } else {
      result = await duckduckgoSearch(query)
    }

    onDone(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    onDone(`❌ 搜索失败：${msg}\n\n提示：检查网络连接或 API key 是否有效。`)
  }
}
