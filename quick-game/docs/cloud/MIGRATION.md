# 云端每日更新

目标仓库：Bruuuucy101/NBA，游戏代码位于独立 quick-game/ 目录，原项目根目录文件保持原样。

GitHub Actions 工作流 .github/workflows/quick-game-daily.yml 每天 UTC 16:00（北京时间次日 00:00）执行，也支持手动运行。GitHub 队列可能延迟；不依赖个人电脑开机。

## 数据保护

只自动更新球队名单、战绩和场均统计。同步前保存评分基准；同步后按球员 ID 保留截图来源的总评、六项能力、评分来源及位置。再次独立逐项核验全部 300 名截图球员，并检查 ratings.txt 的 SHA-256 未变。任何缺失、变化、资料不完整或测试失败都会阻止提交；远端保留上一次成功的数据。

游戏启动时优先读取仓库内已验证的数据，网络不可用或数据不完整时回退到随包数据。已打开的比赛不会被中途修改，刷新页面后读取新数据。GitHub 原始文件缓存可能造成短暂延迟。

## 运维

运行日志：https://github.com/Bruuuucy101/NBA/actions/workflows/quick-game-daily.yml

最后成功时间：quick-game/data/update-status.json。
当前统计源：虎扑篮球 API。当前同步目标赛季固定为 2026-2027，新赛季需调整配置。源站故障或遗漏受保护球员时更新会失败并保留旧数据。

首次云端执行验证结果以 Actions 日志为准；工作流会生成可下载的 quick-game-site 静态游戏包。独立网页托管尚未配置。
