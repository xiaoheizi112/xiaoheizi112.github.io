# 个人博客 - 慢公子 | AI实践者

> 自由散漫的创作者，偶尔做点小项目。想过的，写下来才算数。

这里是 **<https://xiaoheizi112.github.io>** 的源码仓库。一座**黑底荧光绿**的个人站：整站是一份九屏的 deck（演示稿），Anton 大字 + 等宽小字 + 激光/辉光/全息工牌，没有广告、没有算法推荐、没有弹窗。

技术栈：[Hugo](https://gohugo.io/) extended v0.166 + 手写 CSS/JS，**不用主题、不用前端框架、不装 npm 依赖**。

## 站上有什么

首页一屏一卡，滚轮 / 触屏滑动 / 方向键 / 右侧进度点都能换卡，地址栏 `#c-works` 之类可直接跳到某屏。九屏按「先认识我、再看我做过什么」的顺序排：

| 屏 | 内容 |
|---|---|
| 01 HOME | 三行大字 + 循环打字欢迎语 + 站龄读数 + 跑马灯 + ENGINE CORE 线框核心 |
| 02 ABOUT | 全息工牌：AI 卡通肖像 + 面部网格扫描 + 右侧「人事档案」读数表 |
| 03 SKILLS | 技能矩阵带，三行错位滚动，13 枚官方原色图标，悬停出注脚 |
| 04 WORKS | 作品列表，点击开「放映机」灯箱看多张截图 |
| 05 ARTICLES | 文章入口，列出最近几篇；零文章时是 STANDBY 待机面板 |
| 06 INTERESTS | 仿 htop 的生活进程表，可按 CPU/MEM 排序，带实时波形 |
| 07 SIGNALS | 电台调谐面板：刻度盘 + 频道列表 + 卡带 + 示波器，点一下开播 |
| 08 GUESTBOOK | 留言板入口，点进去是 `/message/` |
| 09 CONTACT | 终端会话式联系方式，逐字打字输出，每行带复制按钮 |

角落还有两件常驻小东西：右下角一枚**可下拉点火的火箭**（松手飞回页顶），以及 `⌘K` / `Ctrl+K` 唤出的**命令面板**，可直接跳到任意屏或子页。

子页共用同一套壳（左上角 `← BACK HOME`）：

- **`/posts/`** —— 文章列表，日期倒序；详情页带阅读时长、字数、目录与上下篇
- **`/message/`** —— 留言板（giscus，需用 GitHub 账号登录发言）
- **404** —— 同款黑底绿字，配一条会掉血的 BOSS 血条彩蛋

音效是一套 WebAudio 合成的仪器面板音色（点击 blip、气闸泄压、环境音床），默认开启，右上角声纹按钮可随时关掉。

移动端做了整套降级（≤720px 收字号与留白、隐藏进度点、多列改单列、火箭缩到右下角；矮视口把换卡吸附放松成「就近吸附」）。细节规则见 [CLAUDE.md](CLAUDE.md)。

## 目录长这样

```
layouts/               首页 + 子页壳 + 常驻层 partials（chrome / head / scripts / comments）
assets/css/deck/       样式按编号分层：10 令牌 → 20 deck → 30 特效 → 40 卡内组件
                       → 42 作品 / 44 电台 / 46 文章 / 48 技能·火箭 → 50 子页正文
                       → 60 代码高亮 → 70 giscus → 90 移动端降级
assets/js/             引擎：boot / fx / deck / core / id / htop / works / proj
                       / radio / term / welcome / rocket / tape
static/icons/          技能图标（各家官方原色原图）
static/images/         站主卡通肖像等
data/                  文案与数据：home.yml、skills.yml、interests.yml、
                       music.yml、products.yml、quotes.yml
content/               posts/、message/（about、resume、相册、todo 体系已删除）
.github/workflows/     GitHub Pages 部署
```

配色、字体、缓动的**唯一来源**是 `assets/css/deck/10-base.css` 里的 CSS 变量；改样式请先在那里找令牌，别在组件里写死色值。

## 怎么改

| 想做的事 | 动哪里 |
|---|---|
| 改首页文案 / 档案读数 / 联系方式 | `data/home.yml`（不用碰模板） |
| 改技能图标 / 兴趣进程 / 歌单 / 作品 | `data/skills.yml`、`interests.yml`、`music.yml`、`products.yml` |
| 写文章 | `content/posts/` 丢一个 `<slug>.md` 就自动上屏 |
| 改配色、字体、缓动 | `assets/css/deck/10-base.css` 的 `:root` |
| 改某一屏的版式 | 卡内组件在 `40-cards.css` 及同号文件，子页正文在 `50-sub.css` |
| 改手机端表现 | **只写 `assets/css/deck/90-media.css`**，用媒体查询覆盖，别回去改前面的层 |
| 换卡 / 光标 / 播放器 / 火箭等行为 | 对应的 `assets/js/*.js` |

两个坑值得先知道：

1. **新加的 CSS/JS 文件不会被正在跑的 `hugo server` 索引**（日志会报 `css-pipeline: 找不到资源 xxx.css`，页面样式整块丢失）——新增文件后要重启服务器；只改已有文件则正常热更新。
2. Hugo 的 CSS 压缩器会把「等于初始值」的声明当冗余删掉（比如 `rotate:0deg`）。要重置成初始值，请写成 `initial` / `none`，或者走自定义属性（`--hr:0deg` 再 `rotate:var(--hr)`）。改完抓一次产物 `css/deck.min.min.*.css` 核对最稳。

## 本地跑起来

```bash
git clone https://github.com/xiaoheizi112/xiaoheizi112.github.io.git
cd xiaoheizi112.github.io
hugo server -D                 # http://localhost:1313
```

只想确认能构建、不生成线上链接：

```bash
hugo --quiet -D -d _smoke      # 产物写到临时目录 _smoke，看完就删
```

**不要**直接跑 `hugo` 构建到 `public/`——那会把线上域名的绝对链接写进本地服务器正在服务的目录，本地测试时点一下就跳到 github.io 线上站。

## 部署

推送到 `main`（或在 Actions 里手动 `workflow_dispatch`）即触发 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)：

`actions/checkout@v4` → `peaceiris/actions-hugo@v3`（hugo 0.166.0 extended）→ `hugo --gc --minify` → `upload-pages-artifact`（`public/`）→ `actions/deploy-pages@v4` 发到 GitHub Pages，约 1–2 分钟生效。

线上产物只在 CI 里生成，本地不需要也不应该构建 `public/`。

## License

文字与图片内容版权归站主所有；代码部分供学习参考。
