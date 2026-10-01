# 博客项目规则

## 网站风格

整体参考 https://www.qiaomu.ai/ ——暖纸色调、极简、大留白的个人站风格。

- 风格令牌以 [static/css/home.css](static/css/home.css) 的 `:root` CSS 变量为唯一来源：
  - 背景米白 `#f7f5f0`，文字深墨 `#262320`，点缀褐金 `#7a6849`
  - 字体：正文系统中文无衬线，标题 Space Grotesk，数字/标签 JetBrains Mono
- 新页面/组件沿用这套变量，不要另起配色；细节特征：纸张噪点纹理、圆角卡片 + 细边框、hover 微浮起、进场淡入、`cubic-bezier(0.23,1,0.32,1)` 缓动
- 首页（`layouts/index.html` + `home.css`）独立于 PaperMod 主题；文章页等仍走 PaperMod，改 PaperMod 侧样式时用 `assets/css/` 覆盖，不动主题 submodule
