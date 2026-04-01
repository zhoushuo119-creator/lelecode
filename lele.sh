#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════╗
# ║              乐乐code 一键启动脚本 v2.0                      ║
# ║  用法：./lele.sh  或全局命令 lele                            ║
# ╚══════════════════════════════════════════════════════════════╝

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$HOME/.lelecode/config.json"

# 颜色
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; MAGENTA='\033[0;35m'; BOLD='\033[1m'; DIM='\033[2m'; NC='\033[0m'

echo -e "${MAGENTA}${BOLD}"
echo "  █  ▀▀ █  ▀▀  乐乐code"
echo "  █  █▀ █  █▀  AI 编程助手"
echo "  ▀▀ ▄▄ ▀▀ ▄▄  by 乐乐"
echo -e "${NC}"

# ── 检查 bun ──────────────────────────────────────────────────
if ! command -v bun &>/dev/null; then
  echo -e "${RED}❌ 未找到 bun，请先安装：${NC}"
  echo "   curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

# ── 首次运行：引导配置 ─────────────────────────────────────────
if [ ! -f "$CONFIG_FILE" ]; then
  echo -e "${YELLOW}👋 欢迎首次使用乐乐code！${NC}"
  echo -e "   需要配置一个 API 中转站才能使用。\n"

  # 提供常见中转站预设
  echo -e "${CYAN}常见中转站：${NC}"
  echo -e "  1. 自定义（手动输入地址）"
  echo -e "  2. OpenRouter  - https://openrouter.ai/api/v1"
  echo -e "  3. DeepSeek    - https://api.deepseek.com"
  echo -e "  4. One-API 自建 - http://localhost:3000"
  echo ""
  read -rp "   选择预设或自定义 (1-4，默认1): " PRESET
  PRESET="${PRESET:-1}"

  case "$PRESET" in
    2) BASE_URL="https://openrouter.ai/api/v1" ;;
    3) BASE_URL="https://api.deepseek.com" ;;
    4) read -rp "   请输入你的 One-API 地址: " BASE_URL ;;
    *) read -rp "   请输入 API 地址（如 https://api.duckcoding.ai）: " BASE_URL ;;
  esac

  read -rp "   请输入 API Key（sk-xxx）: " API_KEY
  read -rp "   请输入模型名称（直接回车用默认 claude-sonnet-4-6）: " MODEL
  MODEL="${MODEL:-claude-sonnet-4-6}"

  # 检测 API 格式
  API_FORMAT="anthropic"
  if echo "$BASE_URL" | grep -qiE "openai\.com|deepseek\.com|openrouter\.ai|groq\.com|moonshot\.cn|mistral\.ai"; then
    API_FORMAT="openai"
    echo -e "${DIM}   (检测到 OpenAI 兼容接口，已自动设置格式)${NC}"
  fi

  mkdir -p "$HOME/.lelecode"
  cat > "$CONFIG_FILE" <<EOF
{
  "defaultEndpoint": "default",
  "defaultModel": "$MODEL",
  "endpoints": [
    {
      "name": "default",
      "label": "默认中转站",
      "baseUrl": "$BASE_URL",
      "apiKey": "$API_KEY",
      "model": "$MODEL",
      "apiFormat": "$API_FORMAT"
    }
  ]
}
EOF
  echo -e "\n${GREEN}✅ 配置已保存到 $CONFIG_FILE${NC}\n"
fi

# ── 读取配置显示当前状态 ───────────────────────────────────────
if command -v python3 &>/dev/null; then
  CURRENT_LABEL=$(python3 -c "
import json, sys
try:
    c = json.load(open('$CONFIG_FILE'))
    ep = next((e for e in c.get('endpoints',[]) if e['name']==c.get('defaultEndpoint')), None)
    if ep:
        model = ep.get('model') or c.get('defaultModel','未知')
        print(f\"{ep['label']}  |  {model}\")
except: pass
" 2>/dev/null)
  if [ -n "$CURRENT_LABEL" ]; then
    echo -e "${DIM}  当前配置：${CURRENT_LABEL}${NC}"
    echo ""
  fi
fi

# ── 快捷操作提示 ──────────────────────────────────────────────
echo -e "${DIM}  管理配置：bun run setup  |  切换模型：/model  |  查看帮助：/help${NC}"
echo ""

# ── 启动 ───────────────────────────────────────────────────────
cd "$SCRIPT_DIR"
exec bun run src/entrypoints/cli.tsx "$@"
