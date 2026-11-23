# 74-8 虎扑云端数据更新

应用 app_cc42df721e（用户已确认）。环境 app-cc42df721e-d3gre7iet325800bf。

已部署 Event 函数 basketball_dataset_sync，触发器 basketball_midnight_beijing，七段 Cron `0 0 0 * * * *`，北京时间每天 00:00。无需开发者电脑开机。事件函数不暴露公网拉数接口。

使用现有 activity_api 增加公开 GET /api/league/snapshot，其他路由和业务保留。路由 enableSafeDomain=true，enablePathTransmission=true。H5 仅使用 ColorboxAI.cloud.request 读取准备好的快照；不直接批量请求原始业务接口。

PostgreSQL basketball_snapshot 保存完整快照；更新取得租约，全部 30 队校验通过后原子发布，异常保留旧快照。按北京时间自然日去重，避免任务耗时波动让严格的滚动 24 小时检查跳过次日零点（按用户明确的每天零点要求实现）。本次实际更新返回 30 队、531 人，再次调用正确跳过。

截图评分与其他已有能力字段来自随函数部署的 league.json，更新只改变现有球员 stats 与球队名单、胜负。新球员按同位置、相近场均表现参考建模并标为 estimated。前端再次锁定包内所有已有球员评分。

启动立即使用内置数据/已验证缓存。后台快照读取完成后缓存，下次进入生效，不在正在进行的比赛里更换阵容。网络或 SDK 不可用时仍可玩；无启动倒计时。图片仍从虎扑图片域名加载，无网络时图片可能不显示。

后端首次已完成一次真实更新。定时器的下一次自然触发尚未到时间；已核对云端 Cron 配置。

部署凭据仅在本机绑定技能目录与工作目录中使用，不包含在上传 ZIP 或本目录。

## 按日期配置今日之队（2026-11-21）
- `basketball_daily_lineups` 按北京时间日期保存五名首发 ID，顺序 PG/SG/SF/PF/C。仅管理员可写，玩家没有写入口。
- 已有 `/api/league/snapshot` 返回 `dailyLineups`，不增加外部域名、不改变评分。原有每日统计同步不写此表。
- 提前配置明天名单即可在北京时间 00:00 生效，无需重新发包。未配置日期使用包内确定性阵容；断网先用缓存/内置名单，不阻塞启动。联网后台每分钟刷新；进行中的选秀/比赛不替换对手。
- 更新：在工作区根目录执行 `node outputs/quick-game/deployment/hupu-cloud/prepare-daily-lineup.mjs 日期 控卫ID 分卫ID 小前ID 大前ID 中锋ID > work/cloud-sync/lineup-update.json`，然后 `node work/cloud-sync/mcp.mjs work/cloud-sync/lineup-update.json work/cloud-sync/lineup-update-result.json`。检查迁移 verified，再读取 snapshot 核对。
- 配置仅接受固定每日球员池内、位置对应、互不重复的五人。替补仍自动按日期生成且总评不超过 82。截图评分文件不改动。
