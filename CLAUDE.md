# 博客项目规则

## 网站风格

整体参考 https://www.qiaomu.ai/ ——暖纸色调、极简、大留白的个人站风格。

- 风格令牌以 [static/css/home.css](static/css/home.css) 的 `:root` CSS 变量为唯一来源：
  - 背景米白 `#f7f5f0`，文字深墨 `#262320`，点缀褐金 `#7a6849`
  - 字体：正文系统中文无衬线，标题 Space Grotesk，数字/标签 JetBrains Mono
- 新页面/组件沿用这套变量，不要另起配色；细节特征：纸张噪点纹理、圆角卡片 + 细边框、hover 微浮起、进场淡入、`cubic-bezier(0.23,1,0.32,1)` 缓动
- 首页（`layouts/index.html` + `home.css`）独立于 PaperMod 主题；文章页等仍走 PaperMod，改 PaperMod 侧样式时用 `assets/css/` 覆盖，不动主题 submodule

## 主题覆盖文件（升级 PaperMod 时必看）

项目侧整份复制了 PaperMod 的以下文件（Hugo partial/模板覆盖机制要求整份，不能只放改动段）。升级主题前用 `git diff --no-index themes/PaperMod/<路径> <项目侧同路径>` 核对，把自己改动合并进新版：

| 项目侧文件 | 改了什么 |
|---|---|
| `layouts/list.html` | 底部翻页换成编号页码条（保留箭头 + aria-label） |
| `layouts/archives.html` | 覆盖主题归档页：按年月分组、月份中文、暖纸风格自绘 |
| `layouts/_partials/header.html` | logo 区改成与首页同款 brand（慢字方块 + 慢公子/GONGZI） |
| `layouts/_partials/footer.html` | Turbo 兼容三修（脚本包 IIFE、跳过 #post-toc 锚点、code-copy 防重复） |
| `layouts/_partials/toc.html` | 侧栏 sticky 目录（≥1100px）+ 移动端可折叠目录，两套共用滚动高亮 |
| `layouts/_partials/breadcrumbs.html` | 给 chevron SVG 补显式 width/height 防巨大符号闪现 |
| `layouts/_partials/extend_head.html` | 首页同款字体 + Turbo + RSS 自动发现 + 阅读进度条（新增文件，非覆盖） |
| `layouts/_partials/extend_footer.html` | 播放器 + 灯箱 + 深浅色切换挂载点（新增文件，非覆盖） |
| `layouts/_default/_markup/render-image.html` | 从 static 读真实宽高写进 img（防懒加载撑动版面） |

## 独立手写页（不走 PaperMod，复用 home.css 令牌）

- `layouts/index.html` —— 首页单页
- `layouts/photos/list.html` + `static/css/photos-page.css` —— 相册瀑布流
- `layouts/tracks/list.html` + `static/css/tracks.css` —— 学习路线（读 `data/tracks.yml`）
- 深色模式：这三页都在 `<head>` 最前内联 `dataset.theme` 初始化脚本，读同一个 `localStorage.pref-theme`（与 PaperMod 侧共用），无偏好则跟随系统。暗色变量定义在 `home.css` 的 `:root[data-theme="dark"]`。
- 首页/相册页导航的 `.theme-btn` 切换逻辑在 `extend_footer.html`；PaperMod 文章页用主题自带 `#theme-toggle`。

## 生成脚本（内容变更后按需重跑）

- `scripts/gen_og_cards.py` —— 为每篇文章生成品牌 OG 分享图（`static/images/og/`）并写入 frontmatter `images` 参数。**新增文章后重跑**，否则该篇分享时回退到 `hugo.toml` 的全站兜底图 `site.Params.images`
- `scripts/gen_photo_thumbs.py` / `scripts/gen_photo_dims.py` —— 照片入库后生成缩略图与宽高缓存（见 README「加照片」）
- `scripts/fix_image_alts.py` —— 把正文里无意义的图片 alt（截图 / image.png / 图）批量换成「文章标题 + 序号」

## 待启用

- **giscus 评论**：配置在 `hugo.toml [params.giscus]`（`enable = false`），partial 在 `layouts/_partials/comments.html`。启用需先在仓库 Settings → Features 勾选 Discussions，再到 giscus.app 生成 repo-id/category-id 回填

## 工作方式

- 一次交代多个互不依赖的任务时，自动拆给多个子代理并发执行，不必先征求同意；派发时按文件划清地盘，各代理只改自己名下的文件，禁止跨区编辑，最后由主会话统一构建验收
- 验证构建一律 `hugo --quiet -D -d _smoke`（输出到临时目录），**绝不直接 `hugo` 构建到 `public/`**——那会把线上域名的绝对链接写进本地服务器正在服务的目录，测试时点击会串到 xiaoheizi112.github.io

## 本地/线上隔离

- `hugo server` 自带把 baseURL 覆盖成 localhost 的行为，服务器渲染的链接天然隔离；污染源只可能是**手动构建写坏 `public/`**（服务器从磁盘服务）
- 若必须重建 `public/`（如清已删页面的残留），用 `hugo --quiet -D -b http://localhost:1313/`，让盘上产物和服务器一致；**线上域名的产物只在 GitHub Actions 里生成**
- 页面右上角出现「LOCAL 测试」水印 = 你在本地站；线上构建产物里没有这个角标
