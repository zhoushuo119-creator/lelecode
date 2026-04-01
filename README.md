# 乐乐code 🐱

> **乐乐code** 是基于 Claude Code 改造的 AI 编程助手，由乐乐创建。
> 支持任意第三方 API 中转站，全中文界面，开箱即用。

```
  █  ▀▀ █  ▀▀  乐乐code v1.0.0
  █  █▀ █  █▀  claude-sonnet-4-6 · API
  ▀▀ ▄▄ ▀▀ ▄▄  ~/your-project
```

---

## ✨ 特性

| 特性 | 说明 |
|------|------|
| 🌐 **中转站支持** | 支持任意兼容 Anthropic API 格式的中转站（one-api、new-api、OpenRouter 等） |
| 📝 **配置文件** | `~/.lelecode/config.json` 永久保存配置，无需每次设置环境变量 |
| 🔀 **多中转站** | 支持配置多个中转站，一键切换 |
| 🈶 **中文界面** | 界面提示语全部汉化 |
| 🛠️ **配置向导** | `bun run setup` 交互式配置向导 |
| 📦 **一键启动** | `lele.sh` 脚本，首次运行自动引导配置 |

---

## 🚀 快速开始

### 1. 安装依赖

```bash
# 先安装 bun（如果没有的话）
curl -fsSL https://bun.sh/install | bash

# 克隆项目
git clone https://github.com/zhoushuo119-creator/lelecode.git
cd lelecode

# 安装依赖
bun install
```

### 2. 配置 API（三种方式选一）

#### 方式一：使用配置向导（推荐）
```bash
bun run setup
```
按提示填入你的中转站地址和 API Key，配置会保存到 `~/.lelecode/config.json`。

#### 方式二：手动编辑配置文件
```bash
mkdir -p ~/.lelecode
cat > ~/.lelecode/config.json << 'EOF'
{
  "defaultEndpoint": "my-api",
  "defaultModel": "claude-sonnet-4-6",
  "endpoints": [
    {
      "name": "my-api",
      "label": "🌐 我的中转站",
      "baseUrl": "https://你的中转站地址.com",
      "apiKey": "sk-你的密钥"
    }
  ]
}
EOF
```

#### 方式三：临时环境变量
```bash
export ANTHROPIC_BASE_URL="https://你的中转站地址.com"
export ANTHROPIC_API_KEY="sk-你的密钥"
```

### 3. 启动

```bash
# 方式一：npm 脚本
bun run start

# 方式二：一键脚本（首次运行自动引导配置）
chmod +x lele.sh
./lele.sh

# 方式三：安装为系统命令
chmod +x lele.sh
sudo cp lele.sh /usr/local/bin/lele
lele
```

---

## ⚙️ 配置说明

配置文件位置：`~/.lelecode/config.json`

```json
{
  "defaultEndpoint": "duckcoding",
  "defaultModel": "claude-sonnet-4-6",
  "endpoints": [
    {
      "name": "duckcoding",
      "label": "🦆 DuckCoding",
      "baseUrl": "https://api.duckcoding.ai",
      "apiKey": "sk-xxx",
      "model": "claude-sonnet-4-6"
    },
    {
      "name": "openrouter",
      "label": "🌐 OpenRouter",
      "baseUrl": "https://openrouter.ai/api/v1",
      "apiKey": "sk-or-xxx"
    }
  ]
}
```

| 字段 | 说明 |
|------|------|
| `defaultEndpoint` | 默认使用的中转站名称（对应 `name` 字段） |
| `defaultModel` | 全局默认模型 |
| `endpoints[].name` | 唯一标识，用于 `defaultEndpoint` 引用 |
| `endpoints[].label` | 显示名称 |
| `endpoints[].baseUrl` | API 地址（不含 `/v1/messages`） |
| `endpoints[].apiKey` | API Key |
| `endpoints[].model` | 该端点专用模型（可选，优先级高于 `defaultModel`） |

**优先级**：环境变量 > 配置文件 > 默认值

---

## 🛠️ 管理命令

```bash
# 配置向导（添加/切换/删除中转站）
bun run setup

# 查看版本
bun run start -- --version

# 打包为单文件可执行程序
bun run build:bin
# 生成 ./lele 可执行文件，可直接运行，不需要安装 bun
```

---

## 🌐 常见中转站配置

| 中转站 | baseUrl | 说明 |
|--------|---------|------|
| DuckCoding | `https://api.duckcoding.ai` | 支持 Claude 全系列 |
| OpenRouter | `https://openrouter.ai/api/v1` | 聚合多家模型 |
| one-api 自建 | `http://你的IP:3000/v1` | 自建聚合网关 |
| new-api 自建 | `http://你的IP:3000` | 自建聚合网关 |
| LiteLLM | `http://你的IP:8000` | 开源代理网关 |

---

## 📝 常见问题

**Q: 报错 "No available channel for model xxx"**

A: 你的中转站没有配置这个模型，换一个该中转站支持的模型名，或者在 `endpoints[].model` 里指定正确的模型名。

**Q: 报错 "请勿在 Claude Code CLI 之外使用接口"**

A: 该中转站限制了 User-Agent，乐乐code 已内置正确的 User-Agent，如果仍然报错说明该中转站有额外限制。

**Q: 怎么切换模型？**

A: 启动后输入 `/model` 命令，或者修改配置文件里的 `defaultModel`，或者启动时设置 `export ANTHROPIC_MODEL=模型名`。

---

## 📄 免责声明

本项目基于 [claude-code-rebuilt](https://github.com/weikma/claude-code-rebuilt) 改造，原始代码为 Anthropic 知识产权，仅供学习研究使用，不得用于商业用途。

---

*乐乐code，乐在编程 🎉*
