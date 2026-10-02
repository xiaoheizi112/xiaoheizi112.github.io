# 博客项目规则

## 网站风格

整体参考 https://www.qiaomu.ai/ ——暖纸色调、极简、大留白的个人站风格。

- 风格令牌以 [static/css/home.css](static/css/home.css) 的 `:root` CSS 变量为唯一来源：
  - 背景米白 `#f7f5f0`，文字深墨 `#262320`，点缀褐金 `#7a6849`
  - 字体：正文系统中文无衬线，标题 Space Grotesk，数字/标签 JetBrains Mono
- 新页面/组件沿用这套变量，不要另起配色；细节特征：纸张噪点纹理、圆角卡片 + 细边框、hover 微浮起、进场淡入、`cubic-bezier(0.23,1,0.32,1)` 缓动
- 首页（`layouts/index.html` + `home.css`）独立于 PaperMod 主题；文章页等仍走 PaperMod，改 PaperMod 侧样式时用 `assets/css/` 覆盖，不动主题 submodule

## 工作方式

- 一次交代多个互不依赖的任务时，自动拆给多个子代理并发执行，不必先征求同意；派发时按文件划清地盘，各代理只改自己名下的文件，禁止跨区编辑，最后由主会话统一构建验收
- 验证构建一律 `hugo --quiet -D -d _smoke`（输出到临时目录），**绝不直接 `hugo` 构建到 `public/`**——那会把线上域名的绝对链接写进本地服务器正在服务的目录，测试时点击会串到 xiaoheizi112.github.io

## 本地/线上隔离

- `hugo server` 自带把 baseURL 覆盖成 localhost 的行为，服务器渲染的链接天然隔离；污染源只可能是**手动构建写坏 `public/`**（服务器从磁盘服务）
- 若必须重建 `public/`（如清已删页面的残留），用 `hugo --quiet -D -b http://localhost:1313/`，让盘上产物和服务器一致；**线上域名的产物只在 GitHub Actions 里生成**
- 页面右上角出现「LOCAL 测试」水印 = 你在本地站；线上构建产物里没有这个角标
