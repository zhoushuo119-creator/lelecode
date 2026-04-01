import * as React from 'react'
import { Box, Text } from '../../ink.js'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

function getClaudeDir() {
  return process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude')
}

function sanitizePath(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '-')
}

interface HistoryEntry {
  display: string
  timestamp: number
  project: string
  sessionId?: string
}

function searchHistory(keyword: string): HistoryEntry[] {
  const historyFile = join(getClaudeDir(), 'history.jsonl')
  if (!existsSync(historyFile)) return []

  const lines = readFileSync(historyFile, 'utf-8').split('\n').filter(Boolean)
  const results: HistoryEntry[] = []
  const kw = keyword.toLowerCase()

  for (const line of lines) {
    try {
      const entry = JSON.parse(line) as HistoryEntry
      if (!keyword || entry.display?.toLowerCase().includes(kw)) {
        results.push(entry)
      }
    } catch {
      // skip malformed lines
    }
  }

  return results.slice(-50).reverse() // 最近50条
}

function searchTranscripts(keyword: string): Array<{ project: string; session: string; text: string; timestamp: string }> {
  const projectsDir = join(getClaudeDir(), 'projects')
  if (!existsSync(projectsDir)) return []

  const results: Array<{ project: string; session: string; text: string; timestamp: string }> = []
  const kw = keyword.toLowerCase()

  try {
    const projects = readdirSync(projectsDir)
    for (const proj of projects.slice(-10)) { // 只搜最近10个项目
      const projDir = join(projectsDir, proj)
      const files = readdirSync(projDir).filter(f => f.endsWith('.jsonl'))
      for (const file of files.slice(-3)) { // 每个项目最近3个会话
        const filePath = join(projDir, file)
        const lines = readFileSync(filePath, 'utf-8').split('\n').filter(Boolean)
        for (const line of lines.slice(-200)) {
          try {
            const entry = JSON.parse(line)
            const role = entry.message?.role
            const contentArr = entry.message?.content
            if (!Array.isArray(contentArr)) continue
            for (const block of contentArr) {
              const text = typeof block === 'string' ? block : block?.text
              if (typeof text === 'string' && text.toLowerCase().includes(kw)) {
                results.push({
                  project: proj.replace(/-/g, '/').replace(/^\//, ''),
                  session: file.replace('.jsonl', '').slice(0, 8),
                  text: text.slice(0, 120).replace(/\n/g, ' '),
                  timestamp: entry.timestamp ?? '',
                })
                break
              }
            }
          } catch { /* skip */ }
        }
      }
    }
  } catch { /* skip */ }

  return results.slice(0, 20)
}

export async function call(
  onDone: () => void,
  _context: unknown,
  args: string,
): Promise<void> {
  const keyword = args.trim()

  function HistoryView() {
    const histResults = searchHistory(keyword)
    const transcriptResults = keyword ? searchTranscripts(keyword) : []

    return (
      <Box flexDirection="column" marginTop={1}>
        <Text bold color="clawd_body">
          {'🔍 乐乐code · 历史搜索'}
          {keyword ? ` — "${keyword}"` : ' — 最近记录'}
        </Text>
        <Text dimColor>{'─'.repeat(50)}</Text>

        {/* 输入历史 */}
        <Box flexDirection="column" marginTop={1}>
          <Text bold color="permission">📝 输入历史 ({histResults.length} 条)</Text>
          {histResults.length === 0 ? (
            <Text dimColor>  暂无记录</Text>
          ) : (
            histResults.slice(0, 15).map((r, i) => (
              <Box key={i} flexDirection="row" gap={2}>
                <Text dimColor>{new Date(r.timestamp).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</Text>
                <Text>{r.display?.slice(0, 80) ?? ''}</Text>
              </Box>
            ))
          )}
        </Box>

        {/* 对话内容搜索（仅当有关键词时） */}
        {keyword && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold color="permission">💬 对话内容 ({transcriptResults.length} 条匹配)</Text>
            {transcriptResults.length === 0 ? (
              <Text dimColor>  未找到匹配内容</Text>
            ) : (
              transcriptResults.map((r, i) => (
                <Box key={i} flexDirection="column" marginBottom={1}>
                  <Text dimColor>  [{r.session}] {r.project.slice(-40)}</Text>
                  <Text>  …{r.text.slice(0, 100)}…</Text>
                </Box>
              ))
            )}
          </Box>
        )}

        <Box marginTop={1}>
          <Text dimColor>用法：/history [关键词]  |  按 Esc 退出</Text>
        </Box>
      </Box>
    )
  }

  // @ts-ignore -- Ink rendering via setToolJSX
  onDone()
  return
}
