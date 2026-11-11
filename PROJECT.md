# Stack o' Lantern — 项目一页纸

> 状态：**方向已定稿待用户确认**（备选 B/C 见文末）｜ 类别：**Resurrection** ｜ 工作名可换

## 一句话

**HyperCard 死了二十年。我们把它复活成 agent 原生的创作介质：每张卡片里住着一个"鬼"（agent），不会写代码的人靠对话就能造出可分享的互动作品——卡组是纯文件，鬼可以随时换（任何 MCP agent 都能"附身"）。**

## 为什么是它（四个理由）

1. **叙事完美命中 Resurrection**：HyperCard（1987-2004）是"人人创作软件"的祖师爷，Bill Atkinson 的遗产；复活它 = 复活一段真实的计算史，不是空想复古。
2. **2025 得奖者做不到的三件事（时间给的护城河）**：① agent 住在作品**里**（不只是用来建作品）；② **双向 MCP**——卡组本身是 MCP server，任何 agent 可附身（Google Agents Challenge 顶级提交的核心模式）；③ 长期记忆的"家养鬼"——鬼记得这张 stack 的历史。
3. **哲学顶配**：tofuswang《Developers of Lived Experience》（2026-11-11 发表）的 constructionism 谱系（Papert→Resnick→"先入角再长能"）正是 HyperCard 的精神源头；"file over app"（Ango）= 卡组即纯文件。三篇灵感全部内化进产品而非贴金。
4. **Kiro 深度的天然舞台**：HauntedTalk 解释器 = PBT 的正当用武之地；复杂 IDE 级应用 = spec-driven 最佳案例；hooks/steering/custom agents/Crew 全部有真实用途（见九问映射）。

## 产品骨架（scope 砍刀已备）

- **Stack** = 文件夹：`cards/*.md`（卡片=markdown+布局 YAML）+ `stack.yaml`；git 可版本化，纯文件即作品（Ango）
- **HauntedTalk**：HyperTalk 子集解释器/编译器（v0 只做消息传递+属性+简单控制流；**不做完整兼容**）
- **1-bit 视觉系统**：Macintosh 1987 抖动美学——高识别度、低成本高打磨（Design 分）
- **Ghost 运行时**：卡组暴露 MCP tools（读/改卡片、跑脚本、截图）→ 任何 agent 可附身；内置一个"家养鬼"人设（记住 stack 历史）
- **Showcase 内容**：3 个万圣节主题示范卡组（占卜卡 / 鬼屋导览 / 南瓜宠物），供评委 30 秒上手

## 30 秒 hook（视频开场）

"1987 年，一个工具承诺：人人都能做软件。它教会了一代人编程，然后死在 2004。我们把它复活了——并且在每张卡里放了一只鬼。看：[画一张卡 → 对鬼说'让南瓜倒数到午夜并嚎叫' → 鬼写脚本 → 运行 → 一键分享链接]"

## Kiro 九问映射（真实用途，表演即死）

| Kiro 能力 | 本项目的真实用途 |
|---|---|
| spec-driven | 三个 spec：解释器 / 渲染编辑器 / ghost 运行时；spec 文档即 `/.kiro/` 素材 |
| PBT | HauntedTalk 解释器性质测试：任意脚本 parse-eval 幂等、无崩溃、消息有序 |
| hooks | 保存即跑测试+预览刷新；build log 自动追加 |
| steering | 1-bit 设计语言守则 + "极简 1987"原则，防 UI 漂移 |
| custom agents | ghost 人设 agent、playtest agent（用卡组找 bug） |
| MCP | 卡组即 MCP server（双向）；anysearch 抓素材 |
| Crew | 并行开发三 spec；playtest 团队 |
| powers | 按需引入（用后写体会） |
| IDE/CLI/Web/Crew | 全链路真实使用并记录差异 |

## 里程碑（今天 2026-11-12，截止 12-04 14:00 PT）

| 日期 | 里程碑 | 验证 |
|---|---|---|
| D1-2 (11/12-13) | 方向确认 + Kiro 立项 spec + **申请 4000 credits（今天！）** | spec v0 过审 |
| D3-5 (11/14-16) | Spike：stack 文件格式 + 卡片渲染 + 解释器 v0 + 单工具 MCP | 画卡→对话→能跑 |
| D6-14 (11/17-25) | 三 spec 核心冲刺（Crew 并行）+ hooks 日常化 | 每日测试过绿 + build log |
| D15-18 (11/26-29) | 打磨 + 3 个 showcase + 3 名真实用户测试 | 用户独立完成一个卡组 |
| D19-20 (11/30-12/1) | 视频拍摄剪辑 + 英文文案 + devlog 博客 | 3 分钟成片 |
| D21 (12/02) | **提交演练 dry run**（/.kiro、license、YouTube、GitHub public） | 全清单过 |
| D22-23 (12/03-04) | 缓冲 + 提交（**不拖 deadline**） | Devpost 确认号 |

## Bonus 扫荡矩阵（Category 之外全部可叠加）

| Bonus | 动作 | 死线 |
|---|---|---|
| Best Demo $1k | 视频按 top10% 标准打磨（30s hook + 真人声） | 随主提交 |
| Blog（2000 credits × 100 名） | devlog 发第三方平台，**必须提及 Kiroween Hackathon 2026** | 提交期内发布 |
| Social Blitz（Pro+ × 5） | 帖子**开头**带 #KiroweenHackathon26，真人感悟，附截图 | 提交期内发帖 |
| Kiro Crew App $1k | ghost 运行时打包为独立 Crew app 仓库（同一 GitHub 账号） | 随主提交 |
| Startup $10k / Student | 视用户身份决定（问用户） | 随主提交 |

## 备选方向（如推翻 A）

- **B. Code Séance（Resurrection）**：给死去的开源仓库"招魂"——git 考古重建其设计意图为可对话的 agent 灵体，解决 legacy 接手难题。稳但受众窄（纯开发者），叙事不如 A 有普世性。
- **C. Agent 骨架（Skeleton Crew）**：内置 hooks/skills/MCP 的 agent 应用精简模板 + 两个示范 app。稳妥但视频 wow 度低，且"模板"在 12k 参赛者里难出头。

## Build Log

- 2026-11-12：完成规则研读、2025 获奖调研、三篇灵感消化；AGENTS.md 重写为黑客松版；本项目立项，方向 A 定稿待确认。
