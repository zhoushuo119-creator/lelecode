#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════╗
# ║              乐乐code 一键安装脚本                           ║
# ║  用法：curl -fsSL https://raw.githubusercontent.com/        ║
# ║        zhoushuo119-creator/lelecode/main/install.sh | bash  ║
# ╚══════════════════════════════════════════════════════════════╝

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

REPO="zhoushuo119-creator/lelecode"
INSTALL_DIR="$HOME/.lelecode/app"
BIN_DIR="/usr/local/bin"

echo -e "${CYAN}${BOLD}"
echo "  ╔══════════════════════════════════════╗"
echo "  ║   █  ▀▀ █  ▀▀  乐乐code 安装程序     ║"
echo "  ║   █  █▀ █  █▀  AI 编程助手           ║"
echo "  ║   ▀▀ ▄▄ ▀▀ ▄▄  by 乐乐              ║"
echo "  ╚══════════════════════════════════════╝"
echo -e "${NC}"

# ── 检查 bun ──────────────────────────────────────────────────
if ! command -v bun &>/dev/null; then
  echo -e "${YELLOW}⚙️  未找到 bun，正在安装...${NC}"
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
fi

echo -e "${GREEN}✅ bun $(bun --version)${NC}"

# ── 克隆或更新仓库 ────────────────────────────────────────────
if [ -d "$INSTALL_DIR" ]; then
  echo -e "${CYAN}⟳  更新乐乐code...${NC}"
  cd "$INSTALL_DIR"
  git pull origin main
else
  echo -e "${CYAN}⬇️  下载乐乐code...${NC}"
  mkdir -p "$(dirname "$INSTALL_DIR")"
  git clone "https://github.com/$REPO.git" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# ── 安装依赖 ─────────────────────────────────────────────────
echo -e "${CYAN}📦 安装依赖...${NC}"
bun install --frozen-lockfile 2>/dev/null || bun install

# ── 创建启动器 ────────────────────────────────────────────────
echo -e "${CYAN}🔗 创建 lele 命令...${NC}"

LAUNCHER="$BIN_DIR/lele"

cat > /tmp/lele_launcher << LAUNCHER_SCRIPT
#!/usr/bin/env bash
exec "$INSTALL_DIR/lele.sh" "\$@"
LAUNCHER_SCRIPT

if [ -w "$BIN_DIR" ]; then
  mv /tmp/lele_launcher "$LAUNCHER"
  chmod +x "$LAUNCHER"
else
  echo -e "${YELLOW}需要管理员权限安装到 $BIN_DIR${NC}"
  sudo mv /tmp/lele_launcher "$LAUNCHER"
  sudo chmod +x "$LAUNCHER"
fi

echo ""
echo -e "${GREEN}${BOLD}✅ 乐乐code 安装成功！${NC}"
echo ""
echo -e "  运行 ${CYAN}lele${NC} 启动乐乐code"
echo -e "  首次启动会引导你配置 API key"
echo ""
