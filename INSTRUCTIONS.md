# 网站开发指导手册（legacy）

> 本文档是《AI 智能体安全调研报告》前端展示网站的**开发与维护指导**，面向后续接手维护的同学。
> 内容包括：① 项目结构总览；② 本地部署与查看效果；③ 网页上每一块内容的"封装位置"以及如何修改；
> ④ 生产构建与线上发布；⑤ 常见问题。
>
> 阅读顺序建议：先看【二、项目结构】，再重点看【四、网页内容修改指南】。

---

## 一、项目概述

这是一个把《AI 智能体安全调研报告（2026 版）》从 PDF/LaTeX 转化为**交互式网页**的前端项目。

- **技术栈**：React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + react-router
- **图标库**：lucide-react
- **样式方案**：Tailwind CSS（类名写在 JSX 里）+ 少量自定义 CSS（`src/index.css`）
- **数据方案**：报告正文、表格、参考文献等**全部以 TypeScript 数据文件**的形式封装在 `src/data/` 下，页面组件只负责"读取数据 + 渲染"，因此**改内容几乎不用动页面组件**。

---

## 二、项目结构

```
SecurityReport/
├── index.html                  # HTML 入口（页面标题、favicon）
├── package.json                # 依赖与脚本（dev/build/preview）
├── vite.config.ts              # Vite 配置（React + Tailwind 插件）
├── tsconfig*.json              # TypeScript 配置
├── requirements.txt            # Python 侧需求（用于数据再生成，见第七节）
├── README.md                   # 项目介绍（面向访客）
├── INSTRUCTIONS.md             # 简要开发说明（面向开发者）
├── INSTRUCTIONS_legacy.md      # 本文档（详细指导）
├── UPDATE.md                   # 版本更新记录
│
├── src/                        # ★ 全部前端源码
│   ├── main.tsx                # React 挂载入口
│   ├── App.tsx                 # ★ 路由表（新增/移除页面在这里改）
│   ├── index.css               # 全局样式 + Tailwind 入口
│   │
│   ├── pages/                  # ★ 每个路由对应一个页面组件
│   │   ├── HomePage.tsx              # 首页        (/)
│   │   ├── FullReportPage.tsx        # 报告正文    (/fullreport)
│   │   ├── MethodologyPage.tsx       # 调研方法    (/methodology)
│   │   ├── AcademiaPage.tsx          # 学术现状    (/academia)
│   │   ├── IndustryPage.tsx          # 产业现状    (/industry)
│   │   ├── IncidentsPage.tsx         # 安全事件    (/incidents)
│   │   ├── PolicyPage.tsx            # 政策法规    (/policy)
│   │   ├── FutureDirectionsPage.tsx  # 研究展望    (/futuredirections)
│   │   ├── ReferencesPage.tsx        # 参考文献    (/references)
│   │   ├── TeamPage.tsx              # 团队        (/team，从页头 logo 进入)
│   │   ├── VulnerabilityPage.tsx     # ⚠ 旧版"7章×7阶段×11维度"页（未启用）
│   │   ├── AppendixPage.tsx          # ⚠ 附录文本页（未启用）
│   │   ├── TablesPage.tsx            # ⚠ 全部表格浏览页（路由被注释）
│   │   └── PlaceholderPage.tsx       # "建设中"占位页（通用组件）
│   │
│   ├── components/             # 复用组件
│   │   ├── layout/
│   │   │   ├── Header.tsx      # 顶部导航栏（★ 改导航菜单在这里）
│   │   │   ├── Footer.tsx      # 页脚（基本为空）
│   │   │   └── Sidebar.tsx     # 旧版左侧章节栏（VulnerabilityPage 用）
│   │   ├── report/
│   │   │   ├── DataTable.tsx       # ★ 表格渲染组件（表头/表体）
│   │   │   ├── TableExplorer.tsx   # 表格浏览：筛选 + 搜索
│   │   │   ├── CitationText.tsx    # ★ 正文里的 [12] 引用自动变成可点链接
│   │   │   └── PageIntro.tsx       # 页头介绍条（部分页面已注释不用）
│   │   ├── incidents/          # 旧版事件时间线组件（未启用）
│   │   ├── vulnerability/      # 旧版风险卡片组件（VulnerabilityPage 用）
│   │   └── home/               # 旧版首页组件（未启用）
│   │
│   └── data/                   # ★ ★ 所有网页内容的"数据源"都在这里 ★ ★
│       ├── latestReportData.ts     # ★ 最重要：正文章节、48张表、1143条文献、Bib
│       ├── surveyContent.ts        # 旧版正文数据（VulnerabilityPage 用）
│       ├── reportData.ts           # 旧版 49 单元风险卡片数据
│       ├── incidentsData.ts        # 旧版事件时间线数据（未启用）
│       └── appendixContent.ts      # 附录文本数据（AppendixPage 用）
│
├── public/                     # ★ 静态资源，原样拷贝到网站根目录
│   ├── *.png / *.jpeg / *.svg        # 封面、logo、下载按钮等
│   ├── *.pdf                          # 报告的 PDF 下载文件
│   ├── assets/avatar/*.png            # 团队成员头像
│   ├── assets/hero.png
│   └── report-figures/figure-*.png    # ★ 报告插图（图1.1、图2.1……）
│
├── dist/                       # npm run build 的产物（部署时用这个目录）
│
├── .codex_work/                # ⚠ 数据生成脚本（Python），见第七节
│
└── .github/workflows/          # GitHub Actions 自动部署配置
```

> **核心思想**：`src/data/latestReportData.ts` 是唯一权威数据源。页面组件（如 FullReportPage、ReferencesPage）通过
> `import { SURVEY_CHAPTERS, REPORT_TABLES, REFERENCES, BIB_ENTRIES } from '../data/latestReportData'` 读取。
> 你要改网页上显示的正文/表格/参考文献，**99% 的情况下只需改这一个文件**。

---

## 三、本地部署与查看效果

### 1. 环境要求

```bash
node -v   # 期望 v22.x（本项目在 v22.19.0 上验证）
npm -v    # 期望 10.x
```

### 2. 安装依赖

```bash
cd SecurityReport
npm install
```

### 3. 启动开发服务器（实时预览）

```bash
npm run dev
```

浏览器打开 **http://localhost:5173/** 即可看到网站。

- 开发服务器支持 **HMR（热更新）**：修改 `src/` 下任意 `.tsx/.ts` 文件保存后，浏览器会**自动刷新**，无需重启。
- 修改 `public/` 下的图片/PDF 文件，刷新浏览器即可生效。

### 4. 打包生产版本并本地预览

```bash
npm run build      # 产物输出到 dist/
npm run preview    # 在 http://localhost:4173/ 预览生产构建
```

`npm run build` 会先跑 TypeScript 检查（`tsc -b`）再打包；**如果 TS 报类型错误，构建会失败**，请先修正。

### 5. 修改代码后如何确认生效

| 修改的内容 | 生效方式 |
| --- | --- |
| `src/**/*.ts`、`src/**/*.tsx` | 保存后 HMR 自动热更新，浏览器直接看效果 |
| `public/**`（图片、PDF、logo） | 刷新浏览器即可（无需重启 dev） |
| `package.json`、`vite.config.ts` | 重启 `npm run dev` |

---

## 四、网页内容修改指南（重点）

下面按"网页上看到的一块内容 → 它封装在哪个文件的哪个位置 → 怎么改"逐一说明。

### 4.0 数据文件：`src/data/latestReportData.ts`

整个文件是一个巨型对象 `DATA`，底部通过四行导出供页面使用：

```ts
export const SURVEY_CHAPTERS = DATA.surveyChapters;   // 报告正文（章节/小节/段落/图/表关联）
export const REPORT_TABLES   = DATA.tables;           // 全部表格（48 张）
export const REFERENCES      = DATA.references;       // 参考文献（1143 条）
export const BIB_ENTRIES     = DATA.bib;              // BibTeX 条目（用于引用 key 检索）
```

`DATA` 内部结构：

```ts
DATA = {
  meta: { title, edition, published, mainPaperPages, referenceCount, tableCount, figureCount },  // 报告元信息
  lifecycle: [...],               // 第3~5章"问题-方案-趋势"三列表内容（FullReportPage 未直接渲染，保留数据）
  surveyChapters: [...],          // ★ 正文：7章 + 前置（frontmatter）
  tables: [...],                  // ★ 48 张表
  references: [...],              // ★ 1143 条参考文献
  bib: [...],                     // BibTeX key 条目
}
```

### 4.1 报告正文（`/fullreport` 页面）

- **页面组件**：`src/pages/FullReportPage.tsx`
- **数据源**：`src/data/latestReportData.ts` 的 `DATA.surveyChapters`

每个章节对象的结构：

```ts
{
  id: "chapter-1",        // 章节 id（侧边栏高亮依据）
  number: "1",            // 章节号
  title: "绪论",          // 章节标题
  sections: [             // 该章下的小节列表
    {
      id: "1-overview",
      number: "1",        // 小节编号（如 "2.1"）
      title: "本章概述",  // 小节标题
      paragraphs: [...],  // 正文段落数组（每项一段）
      blocks: [...],      // 可选：带小标题的正文块 [{type:'heading'|'paragraph', text}]
      figures: [          // 可选：该节配图
        { number: "1.1", caption: "图注", src: "/report-figures/figure-1-1.png" }
      ],
      tableIds: [...]     // 可选：该节末尾关联展示的表格 id 列表（如 ["table-2-1"]）
    },
    ...
  ]
}
```

**修改示例**：

- **改某个小节的正文段落** → 找到对应 `sections[]` 里的 `paragraphs` 数组，增删改字符串即可。
- **给小节加小标题** → 在 `paragraphs` 之外增加 `blocks` 数组，其中 `{type:"heading", text:"2.1.1 北美……"}` 会渲染为带蓝色左边框的标题行。
- **换插图** → 把新图片放进 `public/report-figures/`，修改该节的 `figures` 数组里的 `src`。
- **小节末尾挂表格** → 在 `tableIds` 里加表格 id（表格定义在 `DATA.tables` 中，见 4.2）。

**正文里的引用标注**：段落中形如 `[12]`、`[12], [13]` 的文本会被组件 `CitationText.tsx` 自动识别，渲染为
蓝色可点击链接（有 URL 直接打开外部来源，无 URL 跳转到 `/references#ref-12`）。**因此正文里直接写 `[数字]` 即可，无需额外处理。**

### 4.2 表格

- **渲染组件**：`src/components/report/DataTable.tsx`（表头、表体、居左样式）
- **浏览组件**：`src/components/report/TableExplorer.tsx`（"筛选 + 搜索"工具栏）
- **数据源**：`src/data/latestReportData.ts` 的 `DATA.tables`

每张表的结构：

```ts
{
  id: "table-2-1",          // 表 id（正文 section.tableIds 用它关联）
  number: "2.1",            // 表编号（显示为 "表 2.1"）
  title: "北美顶尖高校 AI 智能体安全学术研究汇总",
  category: "research",     // 分类，用于页面筛选
  columns: ["国家", "高校", "实验室/研究团队", "AI智能体安全核心研究方向"],
  rows: [                   // 数据行，每行 cell 数量必须与 columns 一致
    ["美国", "麻省理工学院(MIT)", "DRL[33]", "……"],
    ...
  ]
}
```

**修改示例**：新增/删除一行 → 在 `rows` 数组中加/删一个等长的字符串数组即可；
新增一张表 → 复制一张现有表的对象、改 `id/number/title/category/columns/rows`，插入到 `tables` 数组里。

**表格分类（category）约定**（供 TableExplorer 筛选和页面过滤使用）：

| category | 含义 | 用到的页面 |
| --- | --- | --- |
| `research` | 学术研究 | 学术现状、报告正文 |
| `products` | 产品 | 产业现状 |
| `collaboration` | 产学协同 | 学术现状 |
| `hardware` | 硬件芯片 | 学术现状 |
| `incidents` / `vulnerabilities` / `tools` | 事件 / 漏洞 / 攻击工具 | 安全事件页 |
| `policy` | 政策法规 | 政策法规页 |
| `research-directions` | 重点研究方向 | 研究展望页 |
| `bottlenecks` / `six-dimension` | 产业瓶颈 / 六维分析 | （TablesPage 用） |

### 4.3 参考文献（`/references` 页面）

- **页面组件**：`src/pages/ReferencesPage.tsx`
- **数据源**：`DATA.references`（列表）+ `DATA.bib`（BibTeX key 卡片）

```ts
// references 条目
{ number: 1, key: "mitAIRiskRepo2026", citation: "P. Slattery et al., “The AI risk repository…”, Patterns, 2026.", url: "" }
// bib 条目
{ key: "steinberger2026openclaw", type: "misc", title: "…", author: "…", year: "2026", venue: "", url: "…" }
```

**修改示例**：
- 新增一条文献 → 在 `references` 数组末尾加一条（`number` 用下一个序号），如需要引用 key 再同步加一条 `bib` 条目。
- 修改文献信息 → 直接改对应条目的 `citation` / `url`。
- **注意**：正文里写 `[数字]` 时，该数字必须对应 `references` 里存在的 `number`，否则链接无法解析。

### 4.4 首页（`/`）

- **页面组件**：`src/pages/HomePage.tsx`（所有首页文案都在这个文件里，属于"硬编码"，直接改 JSX）

| 首页区域 | 封装位置（均在 HomePage.tsx） |
| --- | --- |
| 顶部大标题"AI 智能体安全调研报告 (2026)"、副标题、下载 PDF 按钮（`download-logo.png`）、CNIC 链接 | `export default function HomePage()` 中的 hero `<section>` |
| 封面轮播图（report-cover / report_motivation / report_architecture） | `CoverCarousel` 组件里的 `covers` 数组 |
| 四个统计数字（页数 171 / 表格 48 / 图片 22 / 参考文献 1143） | 文件顶部的 `REPORT_STATS` 常量 |
| 三张统计图（figure-1-3 / 1-4 / 1-5）及其注释 | `HomePage` 中 `<img src="/report-figures/figure-1-3.png">` 附近 |
| 调研方法大图（figure-1-2） | 页面中部 `figure-1-2.png` |
| 六个入口卡片（调研方法/学术现状/产业现状/安全事件/政策法规/研究展望） | 文件顶部的 `ENTRY_POINTS` 常量（改 `route` 可改跳转地址） |
| 底部"关于本报告"横幅文字 | 页面末尾"关于本报告" `<section>` |
| 页脚版权（© 2026 钱政希、杨琨 …） | HomePage 末尾 `<footer>` |

> 首页的"阅读调研正文"按钮跳转 `/survey`，但该路由在 App.tsx 中不存在，会落到 `*` 通配重定向回首页。
> 如需修正，可把 `to="/survey"` 改为 `to="/fullreport"`。

### 4.5 顶部导航栏（所有页面共用）

- **组件**：`src/components/layout/Header.tsx`
- 导航菜单项定义在文件顶部：

```ts
const NAV_ITEMS = [
  { label: '报告正文', enLabel: 'FullReport', path: '/fullreport' },
  { label: '调研方法', enLabel: 'Methodology', path: '/methodology' },
  ...
];
```

- **修改示例**：改菜单文字 → 改 `label`；调整跳转目标 → 改 `path`；新增菜单项 → 加一个对象（需同时在 `App.tsx` 注册对应路由）。
- 页头右侧的 GitHub 链接、团队 logo（`team-logo.png`，跳 `/team`）也在本文件。

### 4.6 各专题页的"页头介绍段落"

学术现状、产业现状、安全事件、政策法规、研究展望等页面的**顶部介绍文字**，直接写在对应页面组件的
`<p className="leading-7 text-slate-600">…</p>` 中（位于页面组件开头附近的 `<section>` 里），直接编辑 JSX 文本即可。

- 学术现状（`/academia`）→ `src/pages/AcademiaPage.tsx`
- 产业现状（`/industry`）→ `src/pages/IndustryPage.tsx`
- 安全事件（`/incidents`）→ `src/pages/IncidentsPage.tsx`
- 政策法规（`/policy`）→ `src/pages/PolicyPage.tsx`
- 研究展望（`/futuredirections`）→ `src/pages/FutureDirectionsPage.tsx`
- 调研方法（`/methodology`）→ `src/pages/MethodologyPage.tsx`

这些页面下方展示的表格由页面顶部的 filter 决定：

```ts
// 例：产业现状只显示 category === 'products' 的表
const TABLES = REPORT_TABLES.filter((table) => table.category === 'products');
```

### 4.7 安全事件页（`/incidents`）

- **页面组件**：`src/pages/IncidentsPage.tsx`，三个 Tab：事件时间线 / 主要漏洞 / 攻击工具。
- **数据源**：全部来自 `DATA.tables`，页面顶部按分类取出：

```ts
const INCIDENT_TABLE     = REPORT_TABLES.find((t) => t.category === 'incidents');      // 时间线
const VULNERABILITY_TABLE = REPORT_TABLES.find((t) => t.category === 'vulnerabilities'); // 漏洞
const TOOL_TABLE         = REPORT_TABLES.find((t) => t.category === 'tools');           // 攻击工具
```

- **事件时间线**的每一行结构：`[日期, 事件名称, 类型标签(红色), 攻击/异常手法, 核心损失与影响]`。
  新增一条事件 → 在 `incidents` 分类的表格 `rows` 末尾加一行 5 列数据。

### 4.8 团队页（`/team`）

- **页面组件**：`src/pages/TeamPage.tsx`
- **数据源**：文件顶部的 `TEAM_DATA` 常量（不属于 latestReportData）。

```ts
type TeamMember = { name: string; title: ReactNode; avatar: string; research: string; link?: string };
type TeamGroup   = { label: ReactNode; key: string; footnote?: string; members: TeamMember[] };
```

- 修改示例：换成员头像 → 图片放到 `public/assets/avatar/`，改 `avatar` 路径；
  改个人主页 → 改 `link`；新增成员 → 在对应组的 `members` 数组加对象。

### 4.9 页面标题、图标、favicon

- **位置**：`index.html`
- 网页标题 `AI智能体安全调研报告 (2026)`、favicon（`/agentsec-logo.png`）、meta 描述都在这里改。

### 4.10 旧版/未启用页面的数据（一般不需要动）

以下页面**路由未注册**（`App.tsx` 中无对应 `<Route>`），但在代码仓库中保留：

| 文件 | 数据源 | 说明 |
| --- | --- | --- |
| `src/pages/VulnerabilityPage.tsx` | `src/data/reportData.ts`（`CHAPTER_PHASE_DATA`，7章×7阶段×11维度共 49 单元风险卡片）+ `src/data/surveyContent.ts`（`SURVEY_CONTENT` / `PHASE_DETAIL_CONTENT` / `PHASE_UNIT_CONTENT`） | 旧版多维分析页 |
| `src/pages/AppendixPage.tsx` | `src/data/appendixContent.ts`（`APPENDIX_FILTERS` / `APPENDIX_TEXTS`） | 附录文本页 |
| `src/pages/TablesPage.tsx` | `REPORT_TABLES` | 全部表格浏览页（路由在 App.tsx 中被注释） |
| `src/components/incidents/` | `src/data/incidentsData.ts`（`INCIDENTS` 时间线数据） | 旧版事件时间线组件（无页面引用） |
| `src/components/home/` | — | 旧版首页组件（无页面引用） |

如需启用：在 `src/App.tsx` 的 `<Routes>` 中取消注释/添加 `<Route path="/xxx" element={<XxxPage/>}/>` 即可。

### 4.11 新增一个页面的完整步骤

1. 在 `src/pages/` 新建 `MyPage.tsx`（可参考 `PolicyPage.tsx` 的模板：`<div className="min-h-screen bg-white"> <Header/> 内容 <Footer/> </div>`）。
2. 在 `src/App.tsx` 中 `import` 并注册 `<Route path="/mypage" element={<MyPage/>}/>`。
3. （可选）在 `src/components/layout/Header.tsx` 的 `NAV_ITEMS` 加菜单项。
4. 保存后浏览器自动热更新即可预览。

---

## 五、路由一览表

| 路由 | 页面 | 导航入口 |
| --- | --- | --- |
| `/` | 首页 | 点击左上角 logo / "首页" |
| `/fullreport` | 报告正文（章/节/图/表） | 导航栏"报告正文" |
| `/methodology` | 调研方法 | 导航栏"调研方法" |
| `/academia` | 学术现状 | 导航栏"学术现状" |
| `/industry` | 产业现状 | 导航栏"产业现状" |
| `/incidents` | 安全事件（时间线/漏洞/工具） | 导航栏"安全事件" |
| `/policy` | 政策法规 | 导航栏"政策法规" |
| `/futuredirections` | 研究展望 | 导航栏"研究展望" |
| `/references` | 参考文献 | 导航栏"参考文献" |
| `/team` | 团队 | 页头右侧团队 logo |
| `*` | 重定向到 `/` | — |
| `/survey` 等 | 不存在（App.tsx 未注册，首页"阅读调研正文"按钮当前指向它，会跳回首页） | — |

---

## 六、构建与线上部署

### 1. 本地构建

```bash
npm run build
```

产物在 `dist/`（`dist/index.html` + `dist/assets/*.js/css` + `dist` 下的静态资源）。
> 注：`vite build` 会把 `public/` 下所有文件原样复制到 `dist/`，所以新加的图片/PDF 只要放进 `public/` 就会自动包含。

### 2. 部署到 GitHub Pages

仓库已配置 GitHub Actions（`.github/workflows/static.yml`）：**推送（push）到 `master` 分支时自动部署整个仓库到 GitHub Pages**。
因此日常发布流程：

```bash
git add -A
git commit -m "更新内容"
git push origin master   # 触发自动部署
```

> 该 workflow 是"把整个仓库作为静态站点发布"（path: '.'），即直接把仓库里的 `dist/` 等目录在线可见。
> 若希望只发布构建产物，可把 workflow 改为：`npm ci && npm run build` 后 `actions/upload-pages-artifact` 上传 `dist/`。

---

## 七、数据是怎么生成的（进阶，可选阅读）

`src/data/latestReportData.ts` 等数据文件最初由 `.codex_work/` 下的 Python 脚本从 PDF/LaTeX 提取生成，
脚本使用 `pdfplumber` 等库（见根目录 `requirements.txt`）：

| 脚本 | 作用 |
| --- | --- |
| `.codex_work/build_latest_report_data.py` | 从 PDF（`E:\下载\AI_智能体安全调研报告.pdf`）和 `chapter2.tex`、references.bib 生成 `src/data/latestReportData.ts` |
| `.codex_work/generate_survey_content.py` | 生成 `src/data/surveyContent.ts` |
| `.codex_work/build_final_report_data.py` | 旧版数据生成 |
| `.codex_work/extract_appendix_tables.py` / `dump_appendix_text.py` | 生成附录表格 / 文本 |
| `.codex_work/visual_qa.cjs` | 浏览器视觉回归检查 |

> **日常维护建议**：直接手改 `src/data/*.ts` 数据文件即可，不必重跑脚本（脚本依赖的源 PDF 路径是写死的本地路径）。
> 只有需要"重新从新版本报告 PDF 全量提取"时才考虑运行这些脚本。

---

## 八、常见问题（FAQ）

**Q1：改了 `src/data/latestReportData.ts`，浏览器没变化？**
保存后 HMR 会自动更新；若没反应，手动刷新页面；还不行就重启 `npm run dev`。

**Q2：表格里某一格文字带 `\n` 换行符，页面不换行？**
`DataTable.tsx` 的单元格用了 `whitespace-pre-line` 类，含 `\n` 的文本会自动换行，直接写 `\n` 即可。

**Q3：正文里的 `[12]` 没有变成蓝色链接？**
检查 `DATA.references` 中是否存在 `number: 12` 的条目；`CitationText.tsx` 只对能匹配到参考文献的数字渲染成链接。

**Q4：新增表格/文献后，页面没显示？**
- 表格：检查 `category` 是否属于目标页面的过滤分类（见 4.2 表格）；
  报告正文里展示需在对应 `section.tableIds` 中加上表格 id。
- 文献：ReferencesPage 默认展示全部，新增后应直接可见。

**Q5：`npm run build` 报 TS 类型错误？**
先运行 `npx tsc -b` 查看具体错误。常见原因：`rows` 数组里某行 cell 数量与 `columns` 不一致、
给对象加了多余字段等。修正后再 build。

**Q6：图片不显示？**
确认图片在 `public/` 下，且路径以 `/` 开头（如 `/report-figures/figure-1-1.png`）。`public/` 目录本身就是网站根目录。

**Q7：想整体换一套配色 / 字体？**
Tailwind 主题在 `src/index.css`（`@import "tailwindcss"` 附近）；页面颜色大部分是 JSX 里的 Tailwind 类名，全局替换需逐页修改。

---

## 九、快速修改速查表

| 我想改…… | 去哪个文件 |
| --- | --- |
| 报告正文段落 / 小节标题 / 配图 / 挂表 | `src/data/latestReportData.ts` → `DATA.surveyChapters` |
| 任意一张表格的内容 | `src/data/latestReportData.ts` → `DATA.tables` |
| 参考文献列表 | `src/data/latestReportData.ts` → `DATA.references`（+ `DATA.bib`） |
| 首页统计数字 / 入口卡片 / 轮播图 / 文案 | `src/pages/HomePage.tsx` |
| 导航栏菜单 | `src/components/layout/Header.tsx` → `NAV_ITEMS` |
| 专题页顶部介绍文字 | 对应页面组件（Academia/Industry/Incidents/Policy/FutureDirections/Methodology） |
| 团队页成员 | `src/pages/TeamPage.tsx` → `TEAM_DATA` |
| 图片 / PDF / 头像 / logo | 放入 `public/`（路径以 `/` 开头引用） |
| 页面标题 / favicon | `index.html` |
| 路由（新增/隐藏页面） | `src/App.tsx` |
| 表格的筛选分类 | `DATA.tables[].category`（各页面按 category filter） |
