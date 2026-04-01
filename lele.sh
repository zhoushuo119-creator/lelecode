#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════╗
# ║              乐乐code 一键启动脚本                           ║
# ║  用法：./lele.sh  或  把它安装到 /usr/local/bin/lele         ║
# ╚══════════════════════════════════════════════════════════════╝

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$HOME/.lelecode/config.json"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "  █  ▀▀ █  ▀▀  乐乐code"
echo "  █  █▀ █  █▀  AI 编程助手"
echo "  ▀▀ ▄▄ ▀▀ ▄▄  正在启动..."
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

  read -rp "   请输入 API 地址（如 https://api.duckcoding.ai）: " BASE_URL
  read -rp "   请输入 API Key（sk-xxx）: " API_KEY
  read -rp "   请输入模型名称（直接回车用默认 claude-sonnet-4-6）: " MODEL
  MODEL="${MODEL:-claude-sonnet-4-6}"

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
      "model": "$MODEL"
    }
  ]
}
EOF
  echo -e "\n${GREEN}✅ 配置已保存到 $CONFIG_FILE${NC}\n"
fi

# ── 启动 ───────────────────────────────────────────────────────
cd "$SCRIPT_DIR"
exec bun run src/entrypoints/cli.tsx "$@"
