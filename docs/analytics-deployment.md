# Analytics 配置与 V1.2.0 发布

此版本作为 V1.2.0 发布。公开页面和接口可在未配置真实统计凭据时运行，但会显示未配置/不可用状态，不会伪造流量。

## 页面与接口

- 页面：`/analytics`。顶栏主要入口常驻；窄屏保留图标、名称提示，Explore 同时提供文字入口。
- 公开只读接口：`GET /api/analytics?days=7`，仅允许 7、14、30、365。
- 五项指标：总请求、周期独立访问、页面浏览、缓存命中率、响应字节。
- 小时图：最近三个 UTC 日历日；每日图：所选周期。支持指针查看、键盘滑块、每日数据表和 JSON 导出。
- 示例模式必须由访客主动选择，具有横幅、状态标签和图表水印。真实统计失败不自动替换示例或零值。

## 真实统计配置

1. 在 Cloudflare Dashboard 的 `nextfield.top` 概览页找到 Zone ID。
2. 按 [Cloudflare 官方统计令牌指南](https://developers.cloudflare.com/analytics/graphql-api/getting-started/authentication/api-token-auth/) 创建专用只读 API Token，限制到目标 Zone。当前集成验证要求 Zone Analytics Read；不要使用 Global API Key 或部署令牌。
3. 本地在被 Git 忽略的 `.env.local` 中配置以下变量，然后重启开发服务：

```dotenv
ANALYTICS_ENABLED=true
CLOUDFLARE_ANALYTICS_ZONE_ID=你的32位ZoneID
CLOUDFLARE_ANALYTICS_API_TOKEN=你的专用只读令牌
```

不要把令牌发到聊天里，不要加 `NEXT_PUBLIC_` 前缀，不要提交 `.env.local`。

4. 打开 `/analytics` 验证真实数据，逐项与 Cloudflare Dashboard 对照，特别核对周期、UTC 时区和独立访问口径。
5. 生产环境通过 Wrangler Secret 或 Dashboard 设置令牌；Zone ID 与开关也只需服务端配置。部署命令会更新配置，若将开关和 Zone ID 放入 Wrangler vars，应同步维护配置，避免被覆盖。不要在仓库写入令牌。

## 数据口径

- 数据源是 Zone HTTP Analytics，不是 Workers 调用统计，也不是额外部署的客户端 Web Analytics beacon。
- Zone 数据涵盖该 Zone 的代理主机；如果域名还承载其他子域应用，不能声称仅对应本站页面。
- API 查询 `httpRequests1dGroups` 和 `httpRequests1hGroups`。套餐、数据集权限和保留期限可能限制 14/30/365 天或小时范围；不可用时显示明确状态，不缩短范围后假称完整周期。
- 周期独立访问单独查询无时间维度的聚合，不将每日或每小时 uniques 相加；该指标不等于经过验证的人数。
- 页面浏览遵循 Cloudflare 数据集定义，不是 Next.js 客户端导航点击计数。
- 缓存命中率为缓存请求数 / 总请求数，不平均各小时百分比；零请求时显示未定义符号。
- 带宽使用响应字节和十进制 KB/MB/GB，不代表费用。
- 查询采用五分钟时间桶与 fetch 缓存；API 正常响应可缓存，错误不缓存。数据存在统计延迟，当前 UTC 日尚未完整。
- 不采集 IP、Referer、UA 明细，不新增追踪脚本或访客 Cookie。只公开列出的汇总字段。

## 验收

- [ ] 顶栏能从任意页面进入 Analytics，选中状态正确。
- [ ] 中文、英文、移动端、深色主题均可读。
- [ ] 未配置时展示未配置状态；指标为「—」，不是伪造零值。
- [ ] 主动进入示例模式后，每个时间范围、图表、滑块、表格、导出均可用。
- [ ] 快速切换范围不会让旧请求覆盖新选择。
- [ ] 返回真实统计不会保留示例数字。
- [ ] 真实令牌配置后，与 Cloudflare Dashboard 对照数据。
- [ ] 长周期受限、上游超时、权限不足、空数据和无效响应都有明确反馈。
- [ ] 浏览器响应、导出文件和客户端 bundle 不含令牌或 Zone ID。
- [ ] 实际令牌与套餐集成尚需真实环境验证，模拟检查不能替代它。

## 检查命令

```powershell
npm run typecheck
npm run lint
node scripts/test-analytics.cjs
npm run build
```
