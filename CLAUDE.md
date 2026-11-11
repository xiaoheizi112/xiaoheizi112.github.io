# 博客项目规则（jiejoe 风 deck 架构）

站：`xiaoheizi112.github.io` —— Hugo extended 0.166 纯静态单页 deck，无主题、无框架、无 JS 打包器。
定调：**黑底 `#050607` + 荧光绿 `#3ae35c` + Anton 大字 + JetBrains Mono 小字**，深色为唯一主题（不再有深浅色切换）。

## 铁律

- **不自动 commit / push**；删文件、改 CI、改 `hugo.toml`、rebase/reset 一律先问站主。
- 验证构建只用 `hugo --quiet -D -d _smoke`（临时目录），**绝不 `hugo` 直接构建到 `public/`**——那会把线上绝对链接写进本地服务器正在服务的目录，点一下就串到 github.io。用完删临时目录。
- 并行子代理各改各的文件，禁止跨区编辑；发现别处 bug 只汇报不动手。

## 优化定调（每次界面优化的主体方向，站主 2026-11 定）

任何界面改动——入场、转场、卡内组件、排版——都按这三格自检，缺一格不算做完：

- **赛博科技（语法唯一）**：只用「工程机界面」这一套语言——HUD 角括号、等宽读数、透视网格地板、扫描线、酸绿辉光、噪点、真实数据读数。不许混进第三种语言（彩色渐变、圆角大卡片、拟物、通用 spinner、无因果的随机色块动画）。新效果**优先复用已有件**：`#laser` 一个 canvas 管全站特效（线框核心走 SVG 就是这个理由），音效走 `fx.blip`，反馈走 glint / magnet / tilt，背景走 `.grid-floor` / `.scan` / `.hud-frame` / `.grain`。
- **视觉体验（构图与因果）**：动手前先回答「这一屏第一眼是什么」——一个画面只允许一个主角，boldness 花在一处，其余保持安静。动效必须有**因果链**：谁触发谁、谁跟着谁；不许几段互不相干的动画排队各演各的（旧入场「黑墙 → 四格绿幕假 LOADING → 粒子」就是这么散架的）。入场/转场类总时长 ≤2.2s，一次只让眼睛追一个东西。
- **交互体验（真实优先于装饰）**：可点的必须有即时反馈（hover / active / 音效 / 辉光 / 磁吸）；等待型界面必须给「我按到了」的确认。进度、读数、时间戳一律取**真 API**——`document.fonts.ready`、`document.readyState`、`performance.now()`、`PerformanceObserver` 的 `first-contentful-paint`、`hardwareConcurrency` / `deviceMemory`、`document.lastModified`、`.card` 计数。**取不到真值的行整行不显示，读数如实写 `PRESENTED` / `NATIVE` / `FALLBACK`，绝不编一个数字冒充**；未就绪时不锁死交互——照常可进并如实标一行 `OVERRIDE`。

三条降级是**验收项**，不是补丁：`prefers-reduced-motion: reduce`（跳门、静态成品、内容完整可读）、`(hover: none)` / 触屏（不挂鼠标层、`backdrop-filter` 这类易掉帧的写法要退成更实暗玻璃）、窄屏 ≤880/≤720/≤480 与矮视口 ≤560——全部写在 `90-media.css`，不改原文件。

改完必须 **Playwright 截图走查**三档：桌面 1440×900、390×844 触屏、模拟 reduce。入场/转场这类时间相关的，要**逐帧抓时间线**（每 150~300ms 一张）——看单帧永远看不出「三段各演各的」这种问题。

## 视觉工艺：参照系 → 试验田 → 渲染闭环（2026-11 站主定，治「AI 味」）

「效果跟真实作品差距大」的根因不是模型不行，是**没参照系、没看见自己产出、动效没导演、技术天花板低**。以下四条是流程硬约束，不是建议。

**1. 参照系先行（禁止用形容词开工）**
动手前必须有一个「真实存在的参照」：具体站点 + 它具体用了什么技术。「高级感 / 赛博感 / 有创意」不算决定，`clip-path: inset(100% 0 0) → inset(0)`、错峰 24ms、`cubic-bezier(.645,.045,.355,1)` 才算。
扒法：`curl` 抓 HTML + 它引用的每个 CSS/JS 分册落盘，再 grep 技术关键词**计数**（`feTurbulence` / `clip-path` / `mask-image` / `@property` / `animation-timeline` / `lenis` / `view-transition` / `canvas` 个数）。**只抄技术组合，不抄内容、文案、配色**。
已扒档案（可直接复用结论，勿重复劳动）：**darkroom.engineering** —— 与本站语言同构度最高的参照（黑底 + 等宽主角 + 工程机叙事，首页 **0 canvas / 47 内联 SVG**，特效全长在 DOM/CSS/自定义属性上）。产物已移出仓库，归档在 `C:\Users\admin\AppData\Local\Temp\darkroom-ref\`（dr.css / dr.html / drjs\*.js，21 文件 1.17MB；**仓库根目录不许留这类参照物**）。它的四条纪律：动画包在 `prefers-reduced-motion: no-preference` 里**正向注册**（reduce 时不注册=停在成品态，比负向 `animation:none` 掐在起始帧稳）；hover 层包 `(hover:hover) and (pointer:fine)`，触屏连变量都不挂；19 条 cubic-bezier 全是 `:root` 令牌，keyframes 只消费变量；**转场第一动作是先停掉所有循环动画**（`banner.setSpeed(0)` 再揭幕）。
**扒时序 = 先探针、再录屏抽帧（CSS 里抄不到编排时就得用这个）**：
① 便宜探针（先做这个）：`addInitScript` 里 rAF 每帧采 `document.getAnimations()`，记 `effect.getTiming()` + `getKeyframes()` + 首次出现时刻。darkroom 冷启动实测：**只抓到 6 条，全是 UA 自己的 View Transition 内部动画**（`-ua-view-transition-fade-in/out`、`-ua-view-transition-group-anim-*`、`-ua-mix-blend-mode-plus-lighter`），全挂在 `HTML.lenis` 上，`dur=250ms / ease=linear / fill=both`，首现 1324ms、1572ms 结束；**站点自己一条 CSS 动画都没注册**（`animation:` 简写在 dr.css 里只出现 `animation:none`）。→ 结论：它的逐词/逐行编排跑在 JS（GSAP 类）里写内联样式，扒 CSS 抄时序会**抄空**，探针只能证明「没有 CSS 编排」这一件事。
② 于是上录屏：Playwright `newContext({ recordVideo:{dir, size} })` 录一段 → `ffmpeg -i <webm> -t 3.0 -vf fps=25 fr\f%03d.png` 拆成 40ms 一帧 → 打包 python（`load_workspace_dependencies` 那份，numpy+Pillow）算**逐帧 mean-abs-diff 运动能量曲线**（分区 top/bot/left/right 看先后）→ 挑 3~5 张关键帧 `read_image` 肉眼看编排。**拼图（fps=10 tile 6x6）太粗读不出入场，别做**。darkroom 抽帧实测（1280×720/25fps）：冷启动前 **1.5s 是白屏**（未渲染），内容在 **t=1520ms 一帧到位**，之后只有 t=1880ms 一次 7.6 的底部小动作，全站入场总时长 ≈**360ms** 且分区先后差不到一帧。
③ 教训：**想拿编排毫秒数，得录页内转场 / 滚动触发的段落**，冷启动录屏测到的只是加载；能直接抄的时序令牌来自它 CSS 里的真值（`xddbt8b-B{clip-path:inset(100% 0 0)→inset(0)}` 进 / `xfp45k0-B{inset(0)→inset(0 0 100%)}` 出、`--ease-out-expo cubic-bezier(.19,1,.22,1)` 等 19 条、VT 三件套 `::view-transition-old/new(root){animation-duration:.2s}` + `html:active-view-transition-type(curtain)` 交权 + reduce 段 `::view-transition-*{animation:none}`），不是来自录屏。
④ **curtain 真时序（页内 rAF 逐帧 `getComputedStyle` 探针，比录屏抽帧准——抽帧的 webm→PNG 通道会把绿写成红）**：点击后 `t=10ms` 一块全屏 `clip-path: inset(100% 0 0) → inset(0)` 从下往上盖，**不是贝塞尔而是指数逼近**（逐 33ms 采样比值恒 ≈0.865 → **τ≈230ms**，视觉到位约 1.2s、尾部渐停永不撞线）；同时旧页 `opacity 1→0` + `translateY 0→-360` **同向上滑**；**`t=1856ms` 才 `startViewTransition`**，ready +53ms、finished 2206ms → **VT 只占 350ms 且发生在幕布全遮之后，幕布比 VT 早 1.85s 起跑**；新页 `translateY 720→237` 从下方补上（同向）。总长 ≈2.6s，本站压到 ≈1.26s。两条纪律：**同向**（幕布上盖 / 旧页上滑 / 新页从下补，眼睛只追一个方向，不许回头）与**指数多停近似**（`linear` + 5 停 `0 / .436 / .712 / .889 / 1`，即 `1-e^(-t/τ)` 在 0/25/50/75/100% 的取值；贝塞尔单停要么匀速要么回头）。已移植进 `.wipe`（页间，见 10-base 行）与 `cv-wipe`（08 卡，见 20-deck 行）——**这类减速尾程别再挂贝塞尔令牌**（`--ease-in-out-cubic` 会把指数尾程抹平），`.wipe-out` 的 `transform-origin` 必须是 `top`（`bottom` 等于让幕布缩回起点＝回头）。

**2. 试验田 `_lab.html`（新动效先在这调好再搬进站）**
`D:\blog\_lab.html`（根目录，Hugo 不处理 → 永不进 `public/`；`file:///D:/blog/_lab.html` 直接开）。左手法清单 / 中舞台 + **可拖传输条逐帧** / 右参数台 + 约束自检灯 / 底部**可粘贴实现**与**工单**输出。已收录 8 个手法：逐行遮罩显现、乱码归位、`feTurbulence` 噪声位移、半调阈值显影、噪点跳帧、二阶弹簧、原生 scroll-timeline、真 API 读数。加新手法就往 `FX` 注册表里加一条（`build/lamps/tick|frame|ticket/code`）。
**任何**动效想法先在这里把参数、时长、缓动、降级试到肉眼满意，再把生成的实现搬进站点——不要在生产站里边改边猜。

**3. 渲染闭环（没看图 = 没做完）**
改完必须：`hugo --quiet -D -d _smoke` → 起静态服 → **Playwright 自己开新标签页**（别驱动站主的 1313 页）→ 截图 → **读图** → 不满意就改一轮再来。
时间相关动效必须**拖传输条 / 逐帧抓 3~5 帧**看中间态；只抓终帧等于没验。
两个反复踩的坑：后台标签页 rAF 被节流（读数是假的，别当 bug 查）；CDP `take_screenshot` 在跑 rAF 的页上会 timeout，用 `locator.screenshot(path)`。

**4. 技术阶梯（默认先想左边，CSS transition 是最后手段）**
`SVG 滤镜`（`feTurbulence`+`feDisplacementMap` 有机扭曲 / `feColorMatrix` 阈值半调显影）→ `clip-path: inset()` 行遮罩 → `mask-image` 扫掠 → `@property` 注册数值（让 `--*` 可插值）→ `animation-timeline: scroll()/view()` → WAAPI / 弹簧积分（过冲有物理感）→ `View Transitions` 页间转场。
**canvas 全站只有 `#laser` 一个**：新特效优先 SVG 改坐标（`core.js` 是先例），要加 canvas 先问站主。
缓动曲线一律走 `10-base.css` 令牌；需要新曲线就**先加令牌再消费**，组件里不许写裸 `cubic-bezier`。
一次入场 = 一条因果链（谁触发谁、谁跟着谁），总时长 ≤2.2s；多段动画必须共享同一个起点与同一条缓动，不许各演各的。

**反 AI 味硬清单（出现即返工）**：3 色以上渐变、emoji 当图标、居中 hero 三件套（小 badge + 大标题 + 两个并排按钮）、`ease-in-out`、单层 `box-shadow` 冒充辉光、无因果的随机粒子/随机色块、假数据假读数、通用 spinner、圆角大卡片 + 玻璃拟态混搭进工程机语言。

## 令牌唯一来源

`assets/css/deck/10-base.css` 的 `:root` 是全站唯一配色/字体/缓动来源：
`--d-void #050607`、`--d-void-2`、`--d-card #0d1112`、`--d-white`、`--d-mute`、`--d-dim`、
`--d-acid #3ae35c`、`--d-acid-2`、`--d-acid-soft`、`--d-acid-glow`、`--d-line`、`--d-line-2`、
`--f-display Anton`、`--f-mono "JetBrains Mono"`、`--f-body "Noto Sans SC"`、
`--ease cubic-bezier(.22,1,.36,1)`、`--pad-x clamp(20px,6vw,96px)`；
缓动令牌族（2026-11 从 darkroom 抄来的真值，**组件里不许写裸 `cubic-bezier`**，要新曲线先在这加）：`--ease-out-expo cubic-bezier(.19,1,.22,1)`（遮罩逐行揭开用）、`--ease-in-out-quart cubic-bezier(.77,0,.175,1)`、`--ease-in-out-cubic cubic-bezier(.645,.045,.355,1)`（幕布/擦除转场用）、`--ease-in-out-sine cubic-bezier(.45,.05,.55,.95)`（气闸缝线往复巡扫）、`--ease-sweep cubic-bezier(.42,.04,.3,1)`（`.boot` 扫描通电光带：起步快、落定稳）。
新组件一律引用变量，不要另起色值；字号优先 `clamp()`。字体经 `fonts.loli.net`（`_partials/head.html`）。

## CSS 管线与编号

`_partials/head.html`：`resources.Match "css/deck/*.css" | sort | resources.Concat "css/deck.min.css" | minify | fingerprint`。
文件名按十位编号定序（`sort` 决定层叠顺序，新文件请留空位）：

| 文件 | 职责 |
|---|---|
| `10-base.css` | 令牌、reset、`.display/.hair/.pill/.chrome/.dots/.boot/.wipe`、`.rv` 进场基座。**`.boot` = CRT 通电三段**（站主 2026-11 否掉「2px 光带自上而下扫」＝进度条语言，改显像管开机）：`i` 是屏幕中线 2px 亮线（`top:50%;margin-top:-1px;transform:scaleX(.001)`）先横向撑满（`crt-line .68s var(--ease-sweep)`，17.6%≈120ms 定住），`i::before` 是全屏扫描纹面板（`repeating-linear-gradient` 3px 周期 + 中段压暗，`scaleY(.001)→1` 在 23.5%~47%≈160~320ms 炸开），随后双衰减到 680ms 交还给内容；**总时长 680ms 是硬约束**——fx.js 的粒子显影 `base` 按它对齐，改时长必须同步改 fx.js。注册整段包在 `@media (prefers-reduced-motion: no-preference)`（正向注册：reduce 不注册=停在成品态，比 `animation:none` 掐在起始帧稳），`.boot` 节点名必须保留（50-sub.css 简历打印规则在用）。**`.wipe` 四格页间幕布 = curtain 移植件（2026-11）**：离场 `body.wiping .wipe i { animation: wipe-in .42s linear forwards; transform-origin: bottom }`（**origin 是 bottom**＝每格从自己底边向上盖），错峰 `.046/.092/.138s`（≈0.11×时长，比旧的 `.06/.12/.18` 紧），`@keyframes wipe-in` 走**指数 5 停** `scaleY(0/.436/.712/.889/1)`；到达侧 `html.wipeout .wipe i { transform: scaleY(1); transform-origin: top; animation: wipe-out .52s linear forwards }`（**origin 必须是 top**——`bottom` 会让幕布缩回起点＝回头，违反同向纪律），`@keyframes wipe-out` 是它的镜像 `1/.564/.288/.111/0`；同向位移另有一组 `body.wiping .deck/.sub-wrap { translateY(-4vh)+opacity:0 }` 与 `html.wipeout .deck/.sub-wrap { animation: wipe-rise .62s linear both }`（`5vh→2.82→1.44→.555→0`，与幕布共用同一套 25/50/75% 采样）。**位移目标只能是 `.deck` / `.sub-wrap`，绝不动 `#main`**——`#main` 高度塌成 0 且 `.deck` 是 `position:fixed`，给它加 transform 会把同级的 fixed `.tape` 拽到页顶。时长别挂贝塞尔令牌（见视觉工艺 ④） |
| `20-deck.css` | `#deck` 自然滚动容器（scroll-snap 已退役）、`.card`（100dvh + 纵深姿态层 `--rk-ty/sc/op` + 视差 `[data-par]`）、`.hero/.row-head/.hair-list/.card-body/.sub-wrap/.back-line`、`.card-no` 水印、`.card-meta` 角注、`.cta-center` 08 卡入场幕布（`cv-wipe` 自下 `clip-path:inset(100% 0 0 0)→inset(0)` + `::after` 一条酸绿光带走 `top` 扫过（不吃 transform，防 tilt 抢占）；**2026-11 按 darkroom curtain 改成指数 5 停**：`cv-wipe .72s linear` 的 `inset(100% 0 0 0)→43.3%→17.3%→5.44%→0`，`cv-edge` **必须与它同 .72s 同 linear**（原来 .72s/.8s 两条时长 + 各自贝塞尔，光带与揭开边越走越歪；实测逐停吻合误差 <1px）；降级保险在 `30-fx.css` reduced 段；与逐行揭开同属「正向注册」——只写在 `prefers-reduced-motion: no-preference` 里，reduce/无 JS 不注册即成品态；**不用 `fill:both`**，留着 clip 会裁掉 `.pill` 的 hover 辉光；大字仍交给 `.rv` 的 `--i` 错峰，不另起第二段动画） |
| `30-fx.css` | 辉光、纸飞机光标（`@media (hover:hover)` 下 `cursor:url()` 三态：`plane/link/link-lg/text`，素材 `static/cursors/`，hover 放大 1.25× 用新生成的 `link-lg.png`）、`.scroll-rail` 顶部 2px 进度条、`[data-tilt]/[data-magnet]`、glint、入场气闸 `.gate`（`perspective:1400px` + 半透玻璃双扇 `blur(2px) saturate(1.2)`（**v6 从 blur(9px) 摘掉大半**：糊得太狠会把 `#laser` 粒子与 `.grid-floor` 全抹平，最贵的氛围层被门自己毁掉；bg .55/.72 更实）+ **门内透视地板 `.gate-depth`**（`@property --gd` 驱动 120px/5.5s 流动，比真地板快近 10 倍＝空转的气闸）+ 鼠标牵引 `rotate:y calc(var(--e)*2.4deg)`（左右反号；**必须乘 var**，写 `rotate: y 0deg` 等于初始值会被 minifier 删）+ 有界中缝 `.gate-seam`（只占 13%~87%，≤880 收到 26%~74%，mask 7%/93% 渐隐，配巡扫亮节与鼠标聚能透镜；`.armed` 泄压瞬间 box-shadow 前置 `-3px/3px` 青+品红两项＝全站唯一一次非绿像素，按「光学现象不是配色」放行）+ **`.gate.armed .gh-label` 走 `gh-aberr .12s steps(2,end)` RGB 色散**（打在 `.gh-label` 不打 `.gh-txt`——后者被 `.gate-hint.live .gh-txt{animation:gh-ready}` 同特异度占着，会被呼吸循环顶掉）+ 两侧量尺 `.gate-rungs`（mask 中段挖空让位给缝，`::before/::after` 是四只端头角括号；≤880 收到 30%~70% 免得竖屏读成梯子）+ 自检日志 `.gate-log` + 胶囊即仪表 `.gh-txt`（底边内嵌进度线 `.gh-bar`，近实底 `.94` 防中缝从字里透出）；`--e`/`--my`/`--ready` 由 boot.js 写，`.armed` 泄压 / `.open` 撕裂）、粒子显影 `.pz-hold`、背景层（`.grid-floor` 透视网格（跟速 `--gf-y`）/ `.scan` 扫描线 / `.hud-frame` 四角括号）、全局 `prefers-reduced-motion` 降级（媒体查询降级仍归 90） |
| `40-cards.css` | 卡内组件：`.radio` 电台调谐面板（dial/chan-row/vu/scope/拍立得；**`.ch-tap`**＝04 行 hover 从左擦入的 `↺ TUNE`（2026-11 R4 定稿）——**脱流浮标**压行尾 `right:10px` + `pointer-events:none`（行点击仍归 button），`opacity/clip-path` 只吃 `--tap-o/--tap-cp` 两变量，hover 层包 `(hover:hover) and (pointer:fine)`，`.live` 行让位播放态；hover 时把同行的 `.vu`/`.ch-go` `opacity:0` 淡出让位。**别再改回常驻槽位**：58px 空槽 + 不可缩 artist 合谋把标题挤到腰斩（走查实测 CH-05 只剩 42px）；`.chan-row` 保持 5 列，≤720 `display:none` 拔线并收回 4 列）、`.core-panel` ENGINE CORE 线框反应堆（01 卡右侧，core.js 驱动；`top:44%` 是给 `.badge` 让位的契约，读数 `padding-inline:18px` 让开 `.rm` 角标）、`.htop` LIFE MONITOR 进程表（05 卡：头部 Tasks/Mem/Load、7 列网格行 PID/PROCESS(icon+名)/STATE/CPU/MEM/UPTIME、`.hp-bar` 方块齿条（CPU 酸绿/MEM 暖黄，`i` 宽度=百分比）、hover 酸绿反白 + 底部详情行 + 右下迷你波形、`#hob-sort` 轮播排序 CPU→MEM→UPTIME→NAME、≤860 隐 UPTIME ≤700 隐 MEM ≤540 隐表头 STATE 文字；**data-state/class 必须去空格**（st-HIGHLOAD，Hugo 侧用 `strings.Replace`——裸 `replace` 不存在会静默输出原串）、`.hp-bar.hot` 90%+ 红段在 JS 里加、≤1100 隐藏整块）、`.work-row` 作品行 + 巨 outline 编号、`.marquee`、`.badge`、`.cp`、`.tape` 播放器 |
| `42-works.css` | 05 作品放映机灯箱（`.pj` 全屏 overlay、缩略胶片、glint） |
| `44-radio.css` | 电台机芯注入件：`.cassette` 手绘卡带（grid 右列）、`.vu-meter`（`--vu-max` 控尺寸）、调谐噪音态样式 |
| `46-posts.css` | 07 文章板块：首页卡与 `/posts/` 列表页共用的 `.posts-list/.post-row/.pr-*`（hover 走 `--pr-pl/--pr-line` 自定义属性，别写会被 minifier 删的 `padding-left:0`）、`.posts-cta`、`.posts-stat` 真读数条（列表页顶部有虚线下沿 + `margin-bottom`，否则与首行 `border-top` 挤成双线）、零文章待机面板 `.post-empty/.pe-*`（max-width 880 与 `.md-content` 同宽）、子页 `.page-posts/.post-meta/.post-toc/.post-nav` |
| `48-skills.css` | 02 SKILLS 技能矩阵带（2026-11）：`.sk-band` 三行错位带体 + `.sk-row / .sk-track / .sk-item[aria-hidden=true]` 双层结构（**行是裁剪框、track 才是走的那条**，两者不能合并）；几何全走令牌 `--sk-per / --sk-cell / --sk-gap / --sk-row-gap / --sk-radius`，**`--sk-cell` 必须用 `100cqw`**（配 `.sk-band{container-type:inline-size}` + `@supports` 兜底）量带体真宽——旧 `100vw` 写法比带体宽约 90px，第 10 枚被裁；**R14（2026-11-11 站主令「太扁了要正方形的、底色纯白、外框做成小框形状」）方牌 `aspect-ratio:1/1` + 纯白实心底 `#fff` + 近黑发丝边 `rgba(5,6,7,.28)` + `.sk-art` 72%**（牌高 79→103px、三行带体 337→408px，13 档视口实测不溢出；**`min-width:0;min-height:0` 必写**，图片自带 min-content 会把牌高顶破）；`--sk-radius` 走**百分比 18%** 随牌宽缩放，窄屏不再覆写 px（90-media 那三处已删）；`.sk-name` 在牌外下方；共享读数行 `.sk-readout` + 13 条 `:has()` 精确点亮（默认行与触屏行是两条单行，靠 `(hover:none)` 换显示）；marquee 只注册在 `(hover:hover) and (pointer:fine) and (prefers-reduced-motion: no-preference)`（三行同 `sk-roll 60s linear infinite`、负 delay 错开起点、`translateX(-50%)→0`＝视觉自左向右，hover 行 `animation-play-state:paused`）；**hover / active 只走 `--d-acid` 描边 + 3px 酸绿环 + 上浮 2px**——R13 那道「品牌色 18% 渐变底盘 + 图标品牌色 drop-shadow」R14 已删（白底压不出染色，投影会糊进官方原色），`--si` 由模板照旧输出但 CSS 里已无消费者；横屏矮视口（`orientation:landscape and max-height:520px`）必须把 `--sk-per` 提到 10（844×390 下 per=6 带体 421px 塞不进 390px 视口），**该块要排在 ≤880/≤720/≤480 之后**，否则被 `max-width` 的 per:6 抢走（**`--d-acid-glow` 的值是整条 shadow 简写不是颜色，写进 `box-shadow` 会整条丢弃**，要颜色用 `color-mix()`） |
| `50-sub.css` | 子页正文排版（`.md` 文章体、标题短线、引用、列表） |
| `60-chroma.css` | 代码块 / chroma 高亮配色 |
| `70-giscus.css` | giscus 留言区外壳 |
| `90-media.css` | **所有移动端/窄屏降级只写这里**（1024/720/480 + `hover:none` + 短视口 + reduced-motion 补丁），用媒体查询覆盖前序选择器，不改原文件 |

## JS 引擎（`assets/js/`，经 `minify|fingerprint` 输出，`defer`）

| 文件 | 职责 |
|---|---|
| `boot.js` | 打 `html.js` 标记（渐进增强：无 JS 不隐藏 `.rv`）、**首页限定**首次会话入场气闸 `.gate`（`location.pathname==="/" && !sessionStorage.deck-gate`）：半透玻璃双扇 + 有界中缝（只占 13%~87%，鼠标靠缝能量聚光，`--e`/`--my` 由 pointermove+rAF 写）+ 两侧量尺与端头角括号 + 左下**自检日志**（每行真读数：DOM readyState / `document.fonts.ready` / FCP via PerformanceObserver，外加 BUILD=lastModified、VIEW、CORE、CARDS、AUDIO；取不到就不显示该值，如实写 NATIVE/PRESENTED/FALLBACK）+ 真进度 `--ready`（三扇真闸到位才 100%——胶囊底边那条充电线就是它，未满也能进并补记 OVERRIDE）。**文案动效两件套（ES5，禁 const/let/arrow）**：`scramble(node,target)` 用于胶囊标签（GLYPHS `!<>-/\|(){}[]=+*~#§¤01`、22cps、rAF 节流 ≥80ms/帧＝≤12fps、**未揭示位用占位字符不是空格**否则居中胶囊左右跳，`scrNode/scrToken` 令牌防两轮打架——走查实测 FORCE ENTRY 刚落定被上一轮 SYSTEM CHECK 盖回）；`typeVal(row,node,txt,delay)` 用于日志值（打完才 `.set`，静态行延迟 `600+rowN*130-130` 跟该行淡入一起起跑＝一行行通电）；`setLabel()` 只在文案真变了才重跑。点击链：`+0` 泄压 `.armed`（**同帧 `w.fx.hiss()` 0.35s 白噪**，`blip("up")` 是锁扣的咔、hiss 是气从缝里挤出的嗞；点门这一下本身就是解锁手势所以 ctx 建得起来）→ `+100` 撕裂 `.open` → **`+260` 摘 `html.gate-lock` 并起跑 `body.booting` CRT 通电**（见 10-base：中线亮线 → 全屏扫描纹 → 衰减交还，总 680ms）→ 亮线定住那刻广播 `deck:sweep` → `+940` 摘门。完成信号**两条通道**：`window.__deckSweep` / `deck:sweep`（扫描起跑线，粒子显影认这个——等 boot-done 会让标题晚 1s，因果断线）与 `window.__deckBootDone` / `deck:boot-done`（reduced/无门会话兜底）；12s 兜底必摘 gate-lock（内容绝不能扣在 opacity 0）；reduced 跳门、触屏不挂鼠标层（旧「四格绿幕 + LOADING 假计数」已删）|
| `fx.js` | `#laser` canvas（激光斜线 + 36 点星座网络 + 标题粒子显影——**全站特效只此一个 canvas**）、辉光视差、磁吸、复制胶囊 `[data-copy]`、blip 音效（`localStorage.deck-snd`）、**`hiss(dur,from,to)` 泄压白噪**（复用 blip 的 `ensureCtx()`，**不另建 AudioContext**（Chrome 限额 6）：一次性 `createBuffer` 白噪幅度自乘 `(1-i/len)` 淡出、不 loop → `bandpass Q1.2` 2600→700Hz exponentialRamp → gain 0.0001→0.055(20ms)→0.0001，`src.onended` 里 disconnect 三件；`if (!snd.on) return;` 只在音效开着时响；reduce 档照响——声音不是动效，是该档唯一保留的确认通道）、页间绿幕 wipe 转场（**幕布盖满才换 DOM：`setTimeout(..., 640)`**——实测第四格带 .138s 错峰要到 608ms 才 `scaleY(1)`，旧的 500 会露出一条底边；darkroom 同理，它的 `startViewTransition` 比幕布晚 1.85s 起跑。改 `.wipe` 时长或错峰必须同步改这个数字）。**粒子显影对齐 CRT**：`var base = 130 + (spans.length - 1 - li) * 55;`（面板从中线向上下撑开 → 离中线越近越早通电，所以顺序反过来并让到炸开段之后）、`dur: 470+rand*110`、`endAt+80`；按 2.2s 预算倒推：sweep 在点击后 260ms，最晚落位≈910ms，再吃 `.display` 的 .5s 淡入 ≈1.7s 成稿（实测 full=1713ms）。十字光环光标已删（改纯 CSS 纸飞机，见 30-fx）。**子页返回件落点改写**：带 `[data-home-spot]` 的链接（chrome 的 `←HOME` 胶囊、/resume/ 的 BACK HOME）在 click 时把 href 尾部的 `#c-home` 换成 `sessionStorage.deck-spot`（deck.js 记的停留位）——注册在 wipe 转场**之前**，转场随后读到的就是改写后的地址；无记录/新标签则原样回顶部 |
| `deck.js` | **自然滚动引擎 `scrollStep()`**（rAF：纵深 `--rk-ty/sc/op`、`[data-par]` 视差 `--py`、地板跟速 `--gf-y`、顶部 rail 进度、按卡心距切 `setActive`）、进度点 `.dots` + underlay 胶囊 `moveUnder()`、章节 HUD（`#chap-no/#chap-name/#hud-pct`）、3D tilt、IntersectionObserver 打 `.on`、`[data-scroll]` 锚点、hash 直达、`[data-count]` 数字滚动。拖拽换卡/键盘整卡跳转已随 snap 退役（`go()` 仍供胶囊/锚点平滑滚动）。**停留位记录**：`pagehide` + `visibilitychange(hidden)` 把 active 卡 id 写进 `sessionStorage.deck-spot`，供 fx.js 改写子页 HOME 落点 |
| `tape.js` | 底部 `.tape` 播放器（委托 `.sig-card, .chan-row` 即播——前者是退役扇形卡的兜底，rAF 进度）；暴露 `window.tape = { audio, on }` 事件总线（`"track"`/`"state"`）供 radio.js 订阅；播放条窄列标题用 `data-bar`（短名），`data-title` 留全名给示波器 |
| `radio.js` | 03 电台调谐面板：FM 刻度生成、指针（`--np` 自定义属性驱动 `left:calc(var(--np)*1%)`，**不能用 translate %**——参照自身 2px 宽）、读数窗滚动、WebAudio 示波器（`createMediaElementSource(tape.audio)→AnalyserNode(256)→destination`，首次手势后懒建 AudioContext；不接回 destination 会没声音）、切台 250ms 噪点 burst；**机芯三件套（2026-11 R1/R2/R3）**：R1 手绘 SVG 卡带注入 `.radio-grid` 右列（唯一 rAF 驱动 reel 旋转：播放 ±105°/s、暂停阻尼缓停、切台倒卷半圈；旋转走 SVG `transform="rotate(a cx cy)"` 属性不吃 CSS）；R2 拖指针调谐（白噪 loop→bandpass 800-3200Hz 映射 FM 频段→gain，拖时压 tape，松手吸附最近台 + 咔哒 burst 开播，噪音链独立于示波器链）；R3 VU 表（二阶弹簧摆针，复用示波器 analyser 的 RMS） |
| `htop.js` | 05 LIFE MONITOR 进程表：点 `#hob-sort` 轮播排序 CPU→MEM→UPTIME→NAME（FLIP 位移补偿 + 错峰淡入，`sessionStorage.deck-htop-sort` 记忆）；hover/点按行→酸绿反白 + 底部详情行（`data-desc`）+ 右下按 state 形态的迷你波形（SVG dasharray 动画，SLEEPING 走呼吸）；≥90% 补 `.hp-bar.hot` 红段；触屏把提示语「悬停」换「点按」 |
| `works.js` | 05 作品行 GitHub 仓库实时读数（★star/语言/pushed_at 顶替静态 UPDATED；未认证 API 有 403 限额，失败静默回落静态文案） |
| `proj.js` | 05 作品放映机灯箱：拦截 `.work-row` 点击（无 `shots:` 或按住修饰键则放行原生导航）→ 全屏 `.pj`（大图 82vh + 右列 meta + 缩略胶片），document 捕获层吞按键（灯箱内 deck 方向键失效是有意设计），焦点陷阱+归还 |
| `core.js` | 01 卡 ENGINE CORE：二十面体线框逐帧投影（**纯 SVG 改坐标，不开 canvas**——全站特效 canvas 仍只有 `#laser` 一个）。滚动速度→能量 E（指数衰减飞轮，封顶 3）→转速 `12+E*92 °/s` + 辉光 `--cg`；点击/Enter/Space→OVERCLOCK 1.4s（E=2.8 + `.oc` 爆闪）；rAF 由 IntersectionObserver(01 卡可见)+`visibilitychange`+`matchMedia(≤1100)` 三重门控；读数 SPIN/STATUS/UPTIME 节流 150ms，BUILD 是渲染期真日期。reduced-motion/无 JS → markup 自带 rotY34·rotX22·rotZ9 静态投影兜底 |
| `term.js` | 09 CONTACT 终端会话（2026-11 站主选型方案 A）：首次入屏把 `.hair-list` **整表搬进** `.term-log`（行节点复用零复制），逐字打 `$ contact <alias>` + 输出行（值 + COPY/链接），复制回执 ✓ VERIFIED 打在行尾（剪贴板本体仍归 fx.js `[data-copy]`）；桌面提示符真键盘：help / contact / copy / open / clear / replay（clear 摘行走，replay 复位重打）。**只认 `(hover:hover)` 且非 reduced-motion**，触屏/减弱动效不接管——静态列表 + CSS `::after` 彩蛋即成品；`window.__termBooted` 防双接管。**教训：replaceChild 必须对着 `list.parentElement`（.card-body）做，不是 card** |
| `welcome.js` | 01 hero 循环欢迎语（形式 A，2026-11）：读 `#hero-welcome[data-welcome]`（home.yml `welcome:` jsonify）逐句打字循环（12 CPS 打→2.6s 停→26 CPS 删→歇 0.5s→下一句，全列表循环）；IO(01 卡 0.35)+`visibilitychange` 双门控滚走/切后台不空转；reduced-motion 不接管=静态第一句（服务端直出兜底，无 JS 同）；光标复用 TERM 段 `.term-cursor`；CSS 在 40-cards.css 尾部 WELCOME 段（`min-height:2.6em` 防跳版，≤720 换短提示符 `$`） |

`fx.js` / `deck.js` 都用 `matchMedia("(pointer: coarse)")` 关掉 tilt/磁吸/粒子/星座连线，触屏不触发。`laser` canvas 只判 `prefers-reduced-motion`，触屏仍跑。

## 布局契约

- `baseof.html`：`html[data-theme=dark]`（只有深色）、`body.is-home | .is-sub` + `data-kind`；顺序 `chrome.html → main#main → scripts.html`。
- `_partials/chrome.html` 常驻层：`.fx > #laser.laser + .glow-a/.glow-b + .vignette + .grid-floor + .scan`、`.grain` 噪点、`header.chrome`（`#sound-btn` + `.chrome-actions` 组：`CONTACT` 胶囊；**子页**在其右边再挂一颗酸绿描边的 `←HOME` 胶囊 `.chrome-pill.is-primary[data-home-spot]`——最右＝手指本能落点，落点是**上次停留的那张卡**而不是页面顶部，站主 2026-11 明说「返回页面顶部不需要按键」；起因是他把 CONTACT 当返回键用、每次都被扔到 09 联系方式卡）、`nav.dots`（underlay 胶囊跟随）、`.hud-frame` 四角括号、`.hud` 左下 SCROLL% / 右下 CH.0N·章节名、`.boot` CRT 通电层（**单** `<i>`＝中线亮线，全屏扫描纹面板挂在它自己的 `::before`，节点名保留——50-sub.css 简历打印规则在用）/ `.wipe` 四格页间幕布。（`.cur` 十字光标 DOM 已删，光标改纯 CSS 纸飞机；顶部 `.scroll-rail` 由 deck.js 注入 **body**——`.fx` 是 z-index:0，挂进去会被 deck 盖住。）
- 首页 = 9 个 `section.card#cx[data-num]`：01 home（`.hero > .eyebrow + .hero-lines > 3×span.display.solid/.acid/.outline + .hair + .hero-sub + .hero-welcome`（**循环欢迎语**，2026-11 形式 A：`.hw-prompt` 酸绿提示符 + `.hw-text` 打字句 + 复用 `.term-cursor`；句子在 `home.yml welcome:`，welcome.js 循环；服务端直出第一句兜底；≤720 换短提示符 `.hw-prompt-sm`）、`.eyebrow` 尾部 **站龄读数** `ONLINE DAY 0NN`（2026-11：锚点 `home.yml hero.online_since`=repo created_at 真值 2026-09-22，Hugo 构建日直出，deck.js 尾部每次访问用 Date.now() 重算，非法/负值保留服务端值）、`.marquee` 跑马灯（文案在 `home.yml marquee`，行内含 LAST BUILD 日期）、`.badge` 旋转徽章、`.core-panel` ENGINE CORE 线框核心（`.core-cap` 题注 + `.core-stage[data-tilt]>svg.core-svg`(#core-edges 30 棱/#core-nodes 12 点/.core-ring 轨道+#core-sat/.core-heart) + `.core-read` 四读数，core.js 驱动，≤1100 隐藏，徽章留角当印章；`.scroll-hint` 已删）、02 skills（**2026-11 技能矩阵带**：`.sk-band` 三行错位、每排 10 枚（窄屏 6/5/4，横屏矮视口提到 10）、**方牌 `aspect-ratio:1/1` + 纯白实心底 + 近黑发丝小框**、13 枚图标用各家官方原色原图占牌内 72%、名字在牌外、共享读数行 `.sk-readout` 纯 CSS `:has()` 点亮；hover 亮酸绿描边环 + 上浮，白底不动；CSS 在 `48-skills.css`，数据 `data/skills.yml`）、03 about（**2026-11 全息工牌肖像卡 + 背卡档案**：`.id-grid` = 左 `.id-stage`（悬浮呼吸）> `figure#id-badge`（**不用 data-tilt**——deck.js 整体覆写 transform；id.js 只写 `--bx/--by` 自定义属性，CSS 组合 perspective(900px) rotateX/Y；28px 切角 clip-path 工牌：`.id-body` 内 `/images/avatar.png`（站主证件照为原型的 AI 卡通肖像，Pollinations flux + Pillow 去水印/暗底合成）+ `.id-dissolve` 半调噪点 + `svg.id-mesh` 16 线 36 点面部网格（每 path pathLength=1、`--t` 错峰绘制，默认 .5/hover .92；2026-11-11 依 avatar.png 真人墨线重新手校坐标：眉弓贴眉、眼眶包眼、鼻梁落中线、鼻翼成弧、唇线三段、下巴弧贴下颌线）+ `.id-beam` 扫描光束（走 **top** 关键帧防 transform 抢占）+ `.id-ret` 跟随准星 + `.id-foil` color-dodge 镭射条纹 + `.id-head` ACCESS CREDENTIAL/No.007 + `.id-chip` 触点 + `.id-cap` 状态胶囊 + `.id-conf` CONF 读数 + `.id-glint` translateZ(26px) 玻璃反光；下 `.id-floor` 绿色光池）、右 `.id-file` **PERSONNEL FILE 背卡**（与左工牌同 28px 切角 + 暗玻璃但亮度压一档，不抢主角：`.if-head` PERSONNEL FILE / No.007-B + `.if-sec` 的 `.if-key` PROFILE + `ul.if-rows > li`（`.if-led` 状态灯 / `.if-no` 两位编号 / `.if-name` 名 / `.if-lead` 引导点线 / `.if-val` 值，数据 = `home.yml about.profile`；**2026-11-11 站主令：读数表按语义顺序排、人格测试垫尾，五条读数一律白字（不再有 `key: true` 主读数之分）**）；`id-locked` 后走 **mask-image 自上而下揭开**（不吃 clip-path——切角归壳），因果链是先刷脸、后调档；`.if-foot`（READ FULL BIO 胶囊 + `about.since` + `.if-barcode`）与 `/about/` 页已于 2026-11-11 站主令整体删除，别再往回加；**原 `.id-row`/`.id-hash` 已退役，编造的 `FACE.HASH` 读数撞反 AI 味清单**）；**id.js 状态机**：入屏→`id-pending`(STANDBY)→`id-scanning`(SCANNING，网格逐段绘制+CONF 0→0.98 真缓动计数)→2.5s→`id-locked`(ONLINE，点亮右列+锁闪，桌面 fine 指针才挂鼠标跟随)；reduced/无 JS=静态完成态；CSS 在 40-cards.css 尾部 IDENTITY 段，≤880 单列、hover:none 复位、reduce 降级在 90-media）、04 signals（`.radio[data-nodrag] > .dial(#dial-scale/#needle/#dial-read) + .radio-grid(.chan-list > button.chan-row[data-i/-freq/-src/-title/-bar/-artist/-cover/-desc][data-cursor=TUNE] + .cassette + .scope-box(#scope canvas/#scope-title/#scope-artist/.scope-pola))`，**电台调谐面板**，卡带/VU/拖拽调谐由 radio.js 注入）、05 interests（**htop 进程表**：`.htop > .htop-head(LIFE MONITOR·htop 0.6 / Tasks / Mem+Load) + .htop-cols + .htop-rows > .htop-row[data-name/-state(去空格)/-cpu/-mem/-up/-desc][data-cursor=HI]`（7 列：PID/PROCESS(自绘 line SVG icon)/STATE 灯/CPU 齿条/MEM 齿条/UPTIME）+ `.htop-foot(#htop-hint + #htop-wave[data-wave])`，排序/反白/波形由 htop.js 驱动，`#hob-sort` 在 row-head 右侧；数据 `interests.yml` 字段 icon/state/cpu/mem/uptime/desc）、06 works（`.works-list > a.work-row[href=仓库][data-shots] > .wr-no/.wr-main/.wr-go`——点击被 proj.js 放映机灯箱拦截，按住修饰键才走原生导航；数据 `products.yml`（含 `shots:` 多截图）；列表下 `.works-cta` 三颗 pill：GITHUB HOME(`.solid`)/ALL REPOS/THIS REPO，外链 `target=_blank rel=noopener` + `↗` + `data-magnet`，地址在 `home.yml works:`，零新 JS）、07 posts（**文章板块**，2026-11 新增，站主只要架子、正文待供稿：`.posts-list > a.post-row` = `.pr-no`（`[01]` 等宽编号）+ `.pr-main`（`.pr-title` / `.pr-sum` 摘要两行截断 / `.pr-meta` 日期·分钟·字数）+ `.pr-go`；hover 机制照抄 `.work-row`——`--pr-pl` 4px→18px 吸气 + `::before scaleY(--pr-line)` 酸绿竖线 + 标题染色；下 `.posts-cta`（ALL POSTS `.pill solid` / LATEST 指最新一篇 / 尾注 `.posts-stat` `ENTRIES %03d · SORT DATE▾`）；**零文章**整块换 `_partials/post-empty.html` 待机面板（4×`.rm` 角括号 + `.pe-cap` 呼吸点 STANDBY·NO SIGNAL + `.pe-line` + `.pe-read` 三真读数 ENTRIES/STATUS/INDEX，INDEX 是通往 /posts/ 的真链接；取不到真值的 LAST ENTRY 行整行不输出）；数据源 `where site.RegularPages "Type" "posts"`，条数与介绍词在 `home.yml posts.list/note`；行与空态都抽成 partial 与 /posts/ 列表页共用；CSS 在 `46-posts.css`）、08 guestbook（`.cta-center`，入场走 `cv-wipe` 自下幕布 + `::after` 光带，见 20-deck 段）、09 contact（**终端会话**：`.term > .term-bar(三圆点+guest@slowgongzi — contact.sh) + .term-log`——桌面且非 reduced 时 term.js 把 `.hair-list` 整表搬入逐字打字（banner + `$ contact <alias>` + 输出行值/COPY/链接 + help 行尾 `#` 中文注释 `.t-cmt` + 真键盘 input + `.term-cursor`）；触屏/reduce 不接管，静态 `.hair-list` + `::after` 彩蛋即成品；`data-cmd` 由模板 dict label→alias 映射；CSS 在 40-cards.css 尾部 TERM 段）、09 卡 footer 三 span 保留）。子页编号同步：`/posts/` 07（列表 `layouts/posts/list.html`：顶 `.posts-stat` 真读数条 ENTRIES/SORT/LAST/RSS FEED + `.posts-list`；详情 `layouts/posts/single.html`：`.post-meta` 五读数 DATE/READ/WORDS/STATUS(PUBLISHED|DRAFT)/PATH + `.post-toc` + `.md-content`（复用 50-sub 文章体）+ `.post-nav` + giscus）、`/message/` 08、`/resume/` 10。（`/about/` 与菜单里那条「关于」入口 2026-11-11 已删，`_default/single.html` 壳留给未来 single 页。）**手绘自绘人像仍禁止**（站主两轮否掉），卡通肖像必须基于站主真人照片生成。「要事四象限 / `/todo/`」板块已于 2026-11 整体删除，别再往回加。
- 子页共用壳：`.sub-wrap > .back-line + header.row-head(.num/.display/.cn) + .hair.show + 正文`，用于 `/message/`、`/resume/`、`_default/single.html`；`404.html` 走 `.deck > .card.cta-center`。
- 进场：`html.js` 下 `.rv` 元素由 `deck.js` 的 observer 加 `.on`；新增结构要参与进场就挂 `.rv`。

## 移动端（≤720 主要战场）

- 断点 1024 / 880 / 720 / 480，另加 `@media (hover:none)`（粘滞 hover 复位 + 关 tilt/magnet）与 `@media (max-height:560px)`（短视口补 chrome-clear 内边距；**scroll-snap 已随 2026-11 自然滚动改版整体退役**，`.deck` 普通滚动 + deck.js scrollStep 纵深引擎）、`orientation:landscape and max-height:520px`（纵向再压一档）。全部写在 `90-media.css`。
- 高度一律用 `100dvh`（`100vh` 只作兜底），刘海/家栏用 `env(safe-area-inset-*)`。
- `.dots` 在 ≤720 隐藏；`.row-head` 改 grid 让编号与标题换行；`.hair-list li` 由两端 flex 改上下 grid；`.radio` ≤880 上下堆叠（dial 全宽、列表在上、示波器 ~120px），窄屏刻度只留 90/95/100/105/108 五个数字。
- `.deck` 上**绝不能写 `touch-action:pan-y`**：`touch-action` 沿祖先取交集，会把卡内任何横滑/横拖区（电台 dial、曾经的 `.fan-stage`、以后的类似组件）一起禁掉。
- 07 文章行 ≤480：**首页卡**（`#c-posts`）摘要整块不显、只留标题 + 日期；**列表页**（`.page-posts`）摘要必须留两行——浏览一列稿子全靠它认内容，别一刀切 `display:none`。详情读数 ≤720 改两列 grid、`.post-nav` 归单列。

## 已知的坑

- **`_smoke` 里会残留上一次的指纹产物**（验证命令没带 `--gc`）：`css/deck.min.min.<旧HASH>.css` 和新那份并存，随手 `Select-Object -First 1` 会抓到旧 CSS，于是「改了没生效」全是假告警。要么 `Remove-Item _smoke -Recurse -Force` 再构建，要么 `hugo --gc`，要么抓之前先按 `LastWriteTime` 排序取最新。
- **`assets/` 里新增文件不会被运行中的 `hugo server` 索引**（日志报 `css-pipeline: 找不到资源 xxx.css`，整块样式消失），必须重启服务器；改已有文件正常热更新。
- **Hugo 的 CSS minifier 会删掉「等于初始值」的声明**：`rotate:0deg`、`scale:1`、`translate:0` 这类会被当冗余丢弃，线上规则就没了。要重置成初始值请走自定义属性（如 `--hr:0deg` 再由 `rotate:var(--hr)` 消费），`--*` 的值 minifier 不动；或直接写 `initial` / `none` 关键字。改完 CSS 记得抓一次 `deck.min.*.css` 实际字节核对。
- **气闸的动画都写成「起始态关键帧」，降级时靠 `animation: none` 就会停在起始值**：`30-fx.css` 用 `@keyframes gate-seam-on{from{opacity:.1}}`、`gate-log-on`、`gl-in`、`gate-rungs-on` 这类只写 `from` 的 `both` 动画（故意的：避开 minifier 删「等于初始值」的声明）。reduced 段的 `.gate * { animation: none }`（**没有 `!important`**）掐掉后，元素落回规则里的基值——`.gate-seam` 常亮（可接受）、`.gate-seam::before` 停在 `top:-22%`（巡扫亮节画在口外，看不见，不是坏）。给 `.gate` 家族加新动画前先确认基值可用，别指望关键帧兜底。
- **`element.textContent = x` 会拆掉该元素的全部子节点**：气闸把进度线 `.gh-bar` 做成胶囊 `.gh-txt` 的子元素后，`sync()` 里原来的 `ghTxt.textContent = "CLICK TO ENTER"` 每次刷新都把刚 append 的进度线清掉（表现为 `getBoundingClientRect` 拿到 null）。改文案要走专门的 `.gh-label` 子 span，别对着有子节点的容器写 textContent。
- **别把「一根贯顶贯底的 1px 亮线」和「一根悬空横杆」放在同一中轴上**：v2 待机的 `.gate-seam`（inset 0 满高）+ 独立一行的 `.gh-bar` 交叉成一个「＋」，配上满高斑马刻度，站主原话「中间整的跟虾线一样」。修法不是调颜色而是改几何：缝线元素自身收到 `top/bottom:13%`（口外彻底没有元素，mask 只负责端头 7% 快渐隐——只收紧 mask 到 13%/87% 时实测口外亮度仍有基值的 36%，眼睛照样读成贯顶线），横杆并入胶囊当它的底边充电线，刻度收成两侧量尺 + 端头四角括号。
- **验证目录别用共享名 `_smoke`**：并行代理会 `Remove-Item` 掉它（实测两次走查中途 404）。本线用 `hugo --quiet -D -d _entry_smoke` + HttpListener `127.0.0.1:8098`（脚本 `C:\Users\admin\AppData\Local\Temp\serve_entry_smoke.ps1`，`pwsh -File` 不可用，只能 `&` 调用）；起走查前先 `Test-Path _entry_smoke\index.html` 并探一次端口。
- **`--sg` 与气闸无关，别混**：`--sg` 是卡顶 `.seam`（`20-deck.css` 消费、`deck.js:320` 逐帧写、`90-media.css:311` reduced 兜底 `.seam{--sg:.4}`）的点燃度；气闸的中缝是 `.gate-seam`，只吃 `--e`/`--my`/`--ready`。改气闸时去动 `--sg` 是无效操作。
- **Hugo `.Page.Next / .Page.Prev` 走的是全站 `RegularPages` 序列，不限板块**：文章详情页的「上一篇/下一篇」会跳到 `/about/` 这类非文章页上。板块内导航必须自己 `where site.RegularPages "Type" "posts"` 定位当前下标再取相邻项，且**取相邻项别用 `cond`**（`cond` 两边都求值 → `index` 越界直接 `panic: index out of range`），只能 `if` 分支。
- **`hugo.toml [outputs]` 只认 kind**（`home/page/section/taxonomy/term`），写成 `posts = ['HTML','RSS']` 只会 `WARN Unknown kind "posts" in outputs configuration.`；要按板块定制输出，去该板块 `_index.md` 的 front matter 写 `outputs`。另：`[outputs]` 漏表头会被并进上一个表（`home=...` 当成 `taxonomies` 的键，整条静默失效），改完记得看一次 `hugo -D -d _smoke --minify`（不带 `--quiet`）的输出确认。
- 指纹产物名形如 `css/deck.min.min.<HASH>.css`（Concat 名 + fingerprint 又加一段 `.min`），**JS 里定位样式表别用 `href` 子串匹配**，需要时在 partial 里传稳定 `id`。
- `XML 注释里不能出现连续两个减号`：`static/favicon.svg` 的注释别写 `--d-acid` 这种令牌名，浏览器会整张图碎掉。
- 共享浏览器：多代理同用 Playwright 时，`browser_take_screenshot` / `browser_evaluate` 都打在「current page」上，别人 `select` 一下就换页；要么每步前 `browser_tabs select` 自己的 index，要么用 `browser_run_code_unsafe` 一次性握住 `page` 跑完整套走查。`browser_resize` 影响所有标签，能不用就不用（改用 CDP `Emulation.setDeviceMetricsOverride` 只作用自己那页，还能真开 `pointer:coarse`）。

- **DSH 共享浏览器默认页同时报 `hover:none` 与 `pointer:coarse`**（等于一直在触屏态）：直接 `hover()` 看到的是 `90-media.css` 的粘滞复位，会误判成样式 bug。验桌面 hover 必须另开干净上下文 `page.context().browser().newContext({ viewport, hasTouch:false, isMobile:false })`；触屏档反过来用 `isMobile:true, hasTouch:true` 新开，别去动全局。走查脚本对可空节点（如单文章时不渲染的 `.post-nav`）必须先判空，否则 `getComputedStyle(null)` 抛 `TypeError`——那是脚本的错不是页面的错。

## 内容与数据

- `content/`：`posts/_index.md`（文章板块，2026-11 重建的空架子：front matter 只有 `title/description/url='/posts/'`，正文稿子往里丢 `<slug>.md` 即自动上屏，`draft: true` 可当地下草稿）、`message/_index.md`、`resume/_index.md`。`about.md`、相册/tracks/search/archives 体系与 `/todo/` 看板已删（2026-11）。
- `data/`：`home.yml`（首页文案：`about.paragraphs/tags`、`contact[].label/value/url`、`works.profile/repos/blog`（06 屏底部三颗 pill 的外链地址；06 屏标题下不放介绍词与 `.hair`，站主 2026-11 指定删除）、`posts.list`（07 屏首页最多列几篇，默认 4）/`posts.note`（07 屏标题下介绍词，留空则整行不渲染——**正文待站主供稿**）、`footer.line`、`welcome:`（01 屏循环欢迎语六句，站主 2026-11 定稿：第一句固定「欢迎来到慢公子的个人博客。」，其余为编程/AI 梗短句）；`hero/stats/career` 字段新首页已不读）、`home_en.yml`、`skills.yml`（02 屏技能矩阵带：顶层 `note` + `items[]` 的 `key`/`name`/`sub`/`desc`/`src`/`tint`——`src` 指 `static/icons/` 下 13 枚官方多色原图（`easylang.svg` 是从 eyuyan.com 的 e.ico 逐像素矢量化出来的），`tint` 只喂描边与注脚品牌色，不用于实心填充）、`interests.yml` / `interests_en.yml`（05 屏进程表：`icon`(htop.js 内映射自绘 SVG)/`state`(RUNNING·SLEEPING·IDLE·WAITING·HIGH LOAD)/`cpu`/`mem`/`uptime`(DDHHMMSS)/`desc`)、`music.yml`（03 屏歌手电台 + `.tape` 歌单）、`products.yml`、`resume.yml`（`/resume/` 数据源；`pdf:` 块已删，别再往回加）。`todo.yml` 随四象限板块一起删除。
- 文案改动优先动 `data/*.yml`，不要往 `layouts/*.html` 里写死。

## giscus 留言（已启用）

`hugo.toml [params.giscus]`：`enable = true`，repo `xiaoheizi112/xiaoheizi112.github.io`，category Announcements，mapping `pathname`（repoId/categoryId 已回填，仓库 Discussions 已开）。partial 在 `layouts/_partials/comments.html`，接 dict 参数（`title` 传板块标题），`/message/` 与文章页共用；访客需 GitHub 账号。外壳样式在 `70-giscus.css`，窄屏 iframe 宽度在 `90-media.css` 收。

## 脚本

- `scripts/` 现为空：`gen_resume_pdf.mjs`（简历 PDF 导出）已于 2026-11 站主令删除，连同 `static/files/resume-qt-heyujie.pdf` 与 `/resume/` 页的下载按钮（`resume.yml` 的 `pdf:` 块已删）。简历网页自带 `@media print` 浅色打印样式（50-sub.css 4.9），要纸面版直接 Ctrl+P。
- 绑死已删文章体系的脚本（OG 卡片、图片 alt、description 补全、照片入库/压缩/OCR、WebP 转换、页面重量测量）已于 2026-11 删除，git 历史可恢复。

## 部署

推 `main` 或手动 `workflow_dispatch` → `.github/workflows/deploy.yml`：
`actions/checkout@v4`（`submodules: recursive`）→ `peaceiris/actions-hugo@v3`（hugo **0.166.0 extended**）→ `hugo --gc --minify` → `upload-pages-artifact(path: public)` → `actions/deploy-pages@v4`（GitHub Pages）。
线上产物只在 CI 生成。`themes/PaperMod` submodule 与 `.gitmodules` 已随重构 `git rm`（待 commit），deploy.yml 里的 `submodules: recursive` 无 .gitmodules 时是 no-op，可留可清。

## 本地跑起来

```bash
hugo server -D            # http://localhost:1313
hugo --quiet -D -d _smoke # 一次性验证构建
```

### 自动拉起（站主 2026-11-10 定：每次打开 DSH 就要有 1313 服务器）

- **系统层**：计划任务 `BlogHugoServer`（登录时触发）跑 `C:\Users\admin\AppData\Local\BlogServe\ensure-hugo-server.ps1`——幂等：1313 有人听就直接退出，没人听才后台拉起并等就绪（最多 20s）。互斥体串行化，防并发双起（hugo 端口被占会自动漂移到 1314，所以并发必须锁住）。日志 `BlogServe\hugo-server.log` / `.err.log`。
- **会话层（本条是给代理的自愈约定）**：博客工作区会话第一轮探一次 `127.0.0.1:1313`（`Get-NetTCPConnection -State Listen -LocalPort 1313`），没在听就 `& powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& 'C:\Users\admin\AppData\Local\BlogServe\ensure-hugo-server.ps1'"`。脚本自己判幂等，直接跑即可，不要手写 `hugo server` 起在别的端口。
- 其它端口上可能有并行会话临时起的实例（如实测见过的 `-p 1414`），不归本机制管，**别去杀**。
