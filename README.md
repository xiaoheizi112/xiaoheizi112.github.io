# 慢公子的小站

个人博客源码仓库，线上地址：<https://xiaoheizi112.github.io>

暖纸色调的极简个人站：首页是独立手写的单页（统计卡片、学习笔记、歌手电台、照片墙入口），文章页/归档/关于走 [PaperMod](https://github.com/adityatelange/hugo-PaperMod) 主题并做局部覆盖。

## 技术栈

- [Hugo](https://gohugo.io/) extended v0.166（本地与 CI 同版本）
- PaperMod 主题（git submodule，**不直接改动主题内文件**，覆盖一律放 `layouts/_partials`、`layouts/_default` 或 `assets/css/extended/`）
- 纯手写 CSS / 原生 JS，无前端框架
- GitHub Actions 构建并发布到 GitHub Pages

## 目录结构

```
content/          文章（markdown）、照片墙、关于页
layouts/
  index.html      首页单页（独立于主题）
  _default/       markdown 渲染钩子（图片自动写宽高，防懒加载撑动布局）
  _partials/      对主题的覆盖（目录侧栏、页脚等）
static/
  css/home.css    首页样式（:root CSS 变量是全站风格唯一来源）
  cursors/        自定义鼠标指针
data/home.yml     首页文案数据
assets/css/extended/  注入 PaperMod 页面的补充样式
scripts/          照片入库管线（压缩 webp、去 GPS、写元数据）
themes/PaperMod   git submodule
```

## 本地开发

```bash
git clone --recursive https://github.com/xiaoheizi112/xiaoheizi112.github.io.git
cd xiaoheizi112.github.io
hugo server -D            # http://localhost:1313
```

已 clone 的仓库补装主题：`git submodule update --init --recursive`

验证构建（输出到临时目录，不碰 `public/`）：

```bash
hugo --quiet -D -d _smoke
```

## 添加照片

```bash
python scripts/add_photos.py <图片路径...>
```

自动压缩为 webp（最长边 1600px）、按 EXIF 转正、剥除 GPS 等元数据，存入 `static/photos/<年份>/` 并登记进 `data/photos.yml`。

## 部署

推送到 `main` 分支后，[.github/workflows/deploy.yml](.github/workflows/deploy.yml) 自动用 Hugo 构建并发布，约 1–2 分钟生效。`public/` 不入库，线上产物只在 CI 生成。

## License

文字与图片内容版权归站主所有；代码部分供学习参考。
