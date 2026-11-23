#!/bin/zsh
cd -- "$(dirname -- "$0")"
if ! command -v node >/dev/null; then
  echo '需要 Node.js 20 或更新版本。安装后重新打开此文件。'
  read -k 1
  exit 1
fi
node scripts/serve.mjs --open
