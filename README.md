# 慢公子的小站

> 一个很懒的人的博客，想起来才更新。

这里是 <https://xiaoheizi112.github.io> 的源码仓库——一座晴空暖阳色调的极简生活站，没有广告、没有算法推荐，只有一个人整理自己学过的东西、拍过的照片、听过的歌。

## 站上有什么

- **学习笔记** —— 上课听过、夜里啃过的知识，全部整理成文：Python、Qt/QML、机器视觉、PLC、易语言……每篇自动生成侧栏目录，点哪跳哪
- **学习路线** —— 把散落的笔记按主题串成有顺序的路线（`/tracks/`），跟着走不迷路
- **照片墙** —— 瀑布流展示，入库自动压缩、转正、抹除 GPS，只留画面不留隐私
- **歌手电台** —— 首页放一位喜欢的歌手和一张循环播放的歌单，配图是手写的山间炊烟插画
- **兴趣** —— 首页一排兴趣卡片（打球、睡觉、听歌……），滑到这里氛围光晕会换成暖橙调
- **归档 / 搜索** —— 全量文章时间线（按年月分组），以及纯前端站内搜索
- **关于** —— 个人介绍

全站细节：自定义鼠标指针、深浅色双主题（全站统一，跟随系统 + 手动切换）、正文图片点开大图、代码块一键复制、每篇文章自带 OG 分享卡片、RSS 订阅、移动端自适应（含可折叠目录）。

## 怎么做的

纯静态站，无前端框架，风格令牌集中在 `assets/css/home.css` 的 CSS 变量里（经 Hugo 管线压缩 + 指纹输出）。

| 部分 | 实现 |
|---|---|
| 首页 | 独立手写单页（`layouts/index.html`），不走主题 |
| 文章/归档/关于 | [Hugo](https://gohugo.io/) extended v0.166 + [PaperMod](https://github.com/adityatelange/hugo-PaperMod) 主题（submodule），覆盖全放项目侧 `layouts/_partials`、`layouts/_default`、`assets/css/extended/`，不动主题本体 |
| 分享卡片 | 每篇文章构建一张品牌 OG 图（`scripts/gen_og_cards.py`），写入 frontmatter 的 `images` |
| 搜索 | PaperMod 内置 fastsearch（`content/search.md` + 首页 JSON 输出） |
| 图片 | 构建时自动写入真实宽高（`render-image` 钩子），懒加载不撑动版面，目录点击落点精准 |
| 部署 | 推 `main` 即触发 [GitHub Actions](.github/workflows/deploy.yml) 构建发布，约 1–2 分钟生效；线上产物只在 CI 生成 |

```
content/          文章、照片、关于页
layouts/          首页 + 主题覆盖 + markdown 渲染钩子
assets/css/home.css  全站风格唯一来源（:root 变量，走管线压缩指纹）
data/home.yml     首页文案
data/interests.yml  兴趣板块卡片（图标 + 名称 + 一句描述）
scripts/          照片入库、OG 卡片等生成脚本
```

## 本地跑起来

```bash
git clone --recursive https://github.com/xiaoheizi112.github.io.git
cd xiaoheizi112.github.io
hugo server -D        # http://localhost:1313
```

已 clone 过的补一句：`git submodule update --init --recursive`

验证构建（不碰 `public/`）：`hugo --quiet -D -d _smoke`

## 加照片

```bash
python scripts/add_photos.py <图片路径...>
```

压缩 webp（最长边 1600px）、EXIF 转正、剥除全部元数据，存入 `static/photos/<年份>/` 并登记进 `data/photos.yml`。入库后再跑一步生成缩略图与尺寸缓存：

```bash
python scripts/gen_photo_thumbs.py   # 生成 static/photos/thumbs/ 缩略图（网格用，灯箱仍开原图）
python scripts/gen_photo_dims.py     # 记录原图宽高 → data/photo_dims.yml（防懒加载撑动版面）
```

## License

文字与图片内容版权归站主所有；代码部分供学习参考。
