#!/usr/bin/env bun
/**
 * 乐乐code 配置向导
 * 运行：bun run setup
 */

import { createInterface } from 'readline'
import {
  readLelecodeConfig,
  writeLelecodeConfig,
  CONFIG_FILE,
  type LelecodeEndpoint,
} from '../utils/leleconfig.js'

const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = (q: string): Promise<string> =>
  new Promise(resolve => rl.question(q, resolve))

const CYAN = '\x1b[36m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const BOLD = '\x1b[1m'
const DIM = '\x1b[2m'
const NC = '\x1b[0m'

console.log(`\n${CYAN}${BOLD}`)
console.log('  █  ▀▀ █  ▀▀  乐乐code 配置向导')
console.log('  █  █▀ █  █▀')
console.log(`  ▀▀ ▄▄ ▀▀ ▄▄  ${DIM}config: ${CONFIG_FILE}${NC}\n`)

const config = readLelecodeConfig()
const endpoints = config.endpoints ?? []

console.log(`${BOLD}当前已配置的中转站：${NC}`)
if (endpoints.length === 0) {
  console.log(`  ${DIM}（尚未配置）${NC}`)
} else {
  for (let i = 0; i < endpoints.length; i++) {
    const e = endpoints[i]!
    const isDefault = e.name === config.defaultEndpoint
    console.log(
      `  ${i + 1}. ${e.label} ${isDefault ? `${GREEN}[默认]${NC}` : ''}`,
    )
    console.log(`     地址：${DIM}${e.baseUrl}${NC}`)
    console.log(`     Key： ${DIM}${e.apiKey.slice(0, 8)}****${NC}`)
    if (e.model) console.log(`     模型：${DIM}${e.model}${NC}`)
  }
}

console.log(`\n${BOLD}操作：${NC}`)
console.log('  1. 添加/更新中转站')
console.log('  2. 切换默认中转站')
console.log('  3. 删除中转站')
console.log('  4. 退出')

const action = await ask('\n请选择操作 (1-4): ')

if (action === '1') {
  console.log(`\n${BOLD}添加/更新中转站${NC}`)
  const name = await ask('  标识名（如 duckcoding）: ')
  const label = await ask('  显示名称（如 🦆 DuckCoding）: ')
  const baseUrl = await ask('  API 地址（如 https://api.duckcoding.ai）: ')
  const apiKey = await ask('  API Key（sk-xxx）: ')
  const model = await ask(
    '  默认模型（直接回车跳过，如 claude-sonnet-4-6）: ',
  )

  const endpoint: LelecodeEndpoint = {
    name: name.trim(),
    label: label.trim(),
    baseUrl: baseUrl.trim().replace(/\/$/, ''),
    apiKey: apiKey.trim(),
    ...(model.trim() ? { model: model.trim() } : {}),
  }

  const idx = endpoints.findIndex(e => e.name === endpoint.name)
  if (idx >= 0) {
    endpoints[idx] = endpoint
    console.log(`\n${GREEN}✅ 已更新中转站 "${endpoint.label}"${NC}`)
  } else {
    endpoints.push(endpoint)
    console.log(`\n${GREEN}✅ 已添加中转站 "${endpoint.label}"${NC}`)
  }

  config.endpoints = endpoints
  if (!config.defaultEndpoint) {
    config.defaultEndpoint = endpoint.name
  }
  writeLelecodeConfig(config)
} else if (action === '2') {
  if (endpoints.length === 0) {
    console.log(`\n${YELLOW}⚠️  没有可切换的中转站，请先添加。${NC}`)
  } else {
    console.log(`\n${BOLD}选择默认中转站：${NC}`)
    for (let i = 0; i < endpoints.length; i++) {
      console.log(`  ${i + 1}. ${endpoints[i]!.label}`)
    }
    const idx = parseInt(await ask('请输入编号: ')) - 1
    if (idx >= 0 && idx < endpoints.length) {
      config.defaultEndpoint = endpoints[idx]!.name
      writeLelecodeConfig(config)
      console.log(
        `\n${GREEN}✅ 已将默认中转站切换为 "${endpoints[idx]!.label}"${NC}`,
      )
    } else {
      console.log(`\n${YELLOW}⚠️  无效编号${NC}`)
    }
  }
} else if (action === '3') {
  if (endpoints.length === 0) {
    console.log(`\n${YELLOW}⚠️  没有可删除的中转站。${NC}`)
  } else {
    console.log(`\n${BOLD}选择要删除的中转站：${NC}`)
    for (let i = 0; i < endpoints.length; i++) {
      console.log(`  ${i + 1}. ${endpoints[i]!.label}`)
    }
    const idx = parseInt(await ask('请输入编号: ')) - 1
    if (idx >= 0 && idx < endpoints.length) {
      const removed = endpoints.splice(idx, 1)[0]!
      config.endpoints = endpoints
      if (config.defaultEndpoint === removed.name) {
        config.defaultEndpoint = endpoints[0]?.name
      }
      writeLelecodeConfig(config)
      console.log(`\n${GREEN}✅ 已删除 "${removed.label}"${NC}`)
    } else {
      console.log(`\n${YELLOW}⚠️  无效编号${NC}`)
    }
  }
} else {
  console.log(`\n${DIM}已退出。${NC}`)
}

rl.close()
