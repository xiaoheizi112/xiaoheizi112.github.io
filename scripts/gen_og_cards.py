#!/usr/bin/env python3
"""为每篇文章生成品牌风格 OG 分享图（1200x630），并把 images 参数注入 frontmatter。

分享到微信/Twitter 时显示带标题的卡片，而不是纯链接。
新增文章后重跑一次即可；没跑也不会报错——hugo.toml 里有全站兜底图 site.Params.images。

用法：python scripts/gen_og_cards.py
"""
import pathlib
import re
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("需要 Pillow: pip install pillow")

ROOT = pathlib.Path(__file__).resolve().parent.parent
POSTS = ROOT / "content" / "posts"
OUT = ROOT / "static" / "images" / "og"
W, H = 1200, 630

BG = (247, 245, 240); INK = (38, 35, 32); INK2 = (110, 102, 91); INK3 = (163, 154, 140)
ACC = (122, 104, 73); BG2 = (239, 235, 226)
F_BRAND = r"C:\Windows\Fonts\msyhbd.ttc"
F_BODY = r"C:\Windows\Fonts\msyh.ttc"
F_MONO = r"C:\Windows\Fonts\consola.ttf"


def font(path, size, idx=0):
    return ImageFont.truetype(path, size, index=idx)


def wrap(text, fnt, max_w, draw):
    """按像素宽度折行（中文逐字，兼顾英文词）。返回行列表。"""
    lines, cur = [], ""
    for ch in text:
        if draw.textlength(cur + ch, font=fnt) <= max_w:
            cur += ch
        else:
            lines.append(cur)
            cur = ch
    if cur:
        lines.append(cur)
    return lines


def parse(path):
    """极简解析 TOML frontmatter 的 title / tags。"""
    raw = path.read_text(encoding="utf-8")
    m = re.match(r"^\+\+\+\n(.*?)\n\+\+\+\n", raw, re.S)
    if not m:
        return None
    fm = m.group(1)
    title = re.search(r"^title\s*=\s*['\"](.*?)['\"]", fm, re.M)
    tags = re.search(r"^tags\s*=\s*\[(.*?)\]", fm, re.M)
    tag_list = re.findall(r"['\"](.*?)['\"]", tags.group(1)) if tags else []
    return (title.group(1) if title else path.stem), tag_list


def set_images_param(path, value):
    """在 frontmatter 里加/更新 images 参数（TOML）。"""
    raw = path.read_text(encoding="utf-8")
    m = re.match(r"^(\+\+\+\n)(.*?)(\n\+\+\+\n)(.*)$", raw, re.S)
    if not m:
        return
    head, fm, sep, body = m.groups()
    fm = re.sub(r"(?m)^images\s*=.*\n?", "", fm).rstrip("\n")
    fm += f'\nimages = ["{value}"]'
    path.write_text(head + fm + sep + body, encoding="utf-8")


def make_card(title, tags, slug):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img, "RGBA")
    # 点格纸底
    for y in range(0, H, 26):
        for x in range(0, W, 26):
            d.ellipse([x - 1, y - 1, x + 1, y + 1], fill=(38, 35, 32, 14))
    # 右上茶渍
    d.ellipse([W - 150, -40, W - 40, 70], outline=(122, 104, 73, 24), width=3)
    # 左侧色带
    d.rectangle([0, 0, 10, H], fill=ACC)

    x0 = 96
    # 品牌行
    d.rounded_rectangle([x0, 88, x0 + 52, 140], radius=12, fill=INK)
    d.text((x0 + 26, 112), "慢", font=font(F_BRAND, 30), fill=BG, anchor="mm")
    d.text((x0 + 70, 104), "慢公子的小站", font=font(F_BRAND, 26), fill=INK)
    d.text((x0 + 72, 138), "FIELD NOTES", font=font(F_MONO, 15), fill=ACC)

    # 标题（自动折行，最多 3 行，超长缩字号）
    max_w = W - x0 * 2
    size = 54
    while size > 34:
        fnt = font(F_BRAND, size)
        lines = wrap(title, fnt, max_w, d)
        if len(lines) <= 3:
            break
        size -= 4
    fnt = font(F_BRAND, size)
    lines = wrap(title, fnt, max_w, d)[:3]
    lh = int(size * 1.5)
    ty = 250
    for i, ln in enumerate(lines):
        d.text((x0, ty + i * lh), ln, font=fnt, fill=INK)

    # 标签胶囊
    if tags:
        fnt_t = font(F_BODY, 20)
        tx = x0
        tyy = H - 150
        for t in tags[:4]:
            tw = d.textlength(t, font=fnt_t)
            d.rounded_rectangle([tx, tyy, tx + tw + 34, tyy + 44], radius=22,
                                fill=BG2, outline=(122, 104, 73, 90), width=1)
            d.text((tx + 17, tyy + 22), t, font=fnt_t, fill=ACC, anchor="lm")
            tx += tw + 50

    # 底部 mono 域名
    d.text((x0, H - 78), "xiaoheizi112.github.io", font=font(F_MONO, 20), fill=INK3)

    OUT.mkdir(parents=True, exist_ok=True)
    out = OUT / f"{slug}.png"
    img.save(out, "PNG", optimize=True)
    return out


def main():
    n = 0
    for p in sorted(POSTS.glob("*.md")):
        if p.name.startswith("_"):
            continue
        parsed = parse(p)
        if not parsed:
            continue
        title, tags = parsed
        card = make_card(title, tags, p.stem)
        set_images_param(p, f"images/og/{p.stem}.png")
        n += 1
        print(f"✓ {p.stem}  ←  {title[:24]}")
    print(f"生成 {n} 张 OG 卡片 → static/images/og/")


if __name__ == "__main__":
    main()