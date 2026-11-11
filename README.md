# 慢公子的小站

> 一个很懒的人的博客，想起来才更新。

这里是 <https://xiaoheizi112.github.io> 的源码仓库。一座**黑底荧光绿**的个人站：整站就是一份六屏的 deck（演示稿），Anton 大字 + 等宽小字 + 激光、辉光、准星光标，没有广告、没有算法推荐、没有文章列表。

技术栈：[Hugo](https://gohugo.io/) extended v0.166 + 手写 CSS/JS，**不用主题、不用前端框架、不装 npm 依赖**。

## 站上有什么

首页是一屏一卡的 deck，鼠标滚轮 / 触屏滑动 / 方向键 / 右侧进度点都能换卡，地址栏 `#c-signals` 之类可直接跳到某屏：

| 屏 | 内容 |
|---|---|
| 01 HOME | 三行大字 `Think wild! / Build cool! / Ship slow!` + 一句话自介 |
| 02 ABOUT | 我是谁、在做什么，下面一行行「标签—值」的信息表 |
| 03 SIGNALS | 最近在听的歌：扇形铺开五张专辑卡，点一下就播（底部会滑出 `.tape` 播放器） |
| 04 INTERESTS | 兴趣散卡（打球、睡觉、听歌、散步、做饭、AI），轻微歪斜的散落排布 |
| 05 GUESTBOOK | 留言板的入口，点进去是 `/message/` |
| 06 CONTACT | 联系方式与页脚 |

子页共用同一套壳（左上角 `← BACK HOME` 回首页）：

- **`/about/`** —— 详细版自我介绍，带代码块
- **`/message/`** —— 留言板（giscus，需用 GitHub 账号登录发言）
- **`/resume/`** —— 在线简历，数据在 `data/resume.yml`
- **404** —— 同款黑底绿字，一个描边的 `404`

移动端做了整套降级（≤720px 收字号与留白、隐藏进度点、扇形改成左右滑的一列、信息表上下两行；手机横屏这种矮视口会把换卡吸附放松成「就近吸附」，免得长内容读不到尾巴）。细节规则见 [CLAUDE.md](CLAUDE.md)。

## 目录长这样

```
layouts/               首页 + 子页壳 + 常驻层 partials（chrome/head/scripts/comments）
assets/css/deck/       样式按编号分层：10 令牌 → 20 deck → 30 特效 → 40 卡内组件
                       → 50 子页正文 → 60 代码高亮 → 70 giscus → 90 移动端降级
assets/js/             引擎：boot / fx / deck / tape
static/favicon.svg     站标（黑底 + 荧光绿准星）
data/                  文案与数据：home.yml、interests.yml、music.yml、
                       products.yml、resume.yml（+ _en 两份）
content/               about.md、message/、resume/（文章与 todo 体系已删除）
.github/workflows/     GitHub Pages 部署
```

配色、字体、缓动的**唯一来源**是 `assets/css/deck/10-base.css` 里的 CSS 变量；改样式请先在那里找令牌，别在组件里写死色值。

## 怎么改

| 想做的事 | 动哪里 |
|---|---|
| 改首页文案 / 联系方式 / 兴趣卡 / 歌单 | `data/home.yml`、`data/interests.yml`、`data/music.yml`（不用碰模板） |
| 改简历内容 | `data/resume.yml`（网页即最终形态，Ctrl+P 可直印） |
| 改配色、字体、缓动 | `assets/css/deck/10-base.css` 的 `:root` |
| 改某一屏的版式 | 对应层：卡内组件在 `40-cards.css`，子页正文在 `50-sub.css` |
| 改手机端表现 | **只写 `assets/css/deck/90-media.css`**，用媒体查询覆盖，别回去改前面的层 |
| 换卡/光标/播放器等行为 | `assets/js/deck.js`、`fx.js`、`tape.js` |

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
