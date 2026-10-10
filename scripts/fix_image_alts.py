#!/usr/bin/env python3
"""把正文里无意义的图片 alt（截图 / image.png / 图）批量换成「文章标题 + 序号」。

读不出画面内容的图，至少让读屏软件与搜索引擎知道「这是哪篇文章的第几张配图」。
按每篇文章独立计数，形如 `![Python 基础 配图 3]`。已改过的（alt 里已含「配图」）跳过。
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
POSTS = ROOT / "content" / "posts"

# 需替换的无意义 alt（含转义点写法）；保留用户手写的有意义 alt
MEANINGLESS = {"截图", r"image\.png", "image.png", "图", "图片"}


def title_of(text):
    m = re.search(r"^title\s*=\s*['\"](.*?)['\"]", text, re.M)
    return m.group(1) if m else "配图"


def main():
    total = 0
    for p in sorted(POSTS.glob("*.md")):
        if p.name.startswith("_"):
            continue
        text = p.read_text(encoding="utf-8")
        title = title_of(text)
        n = 0

        def repl(m):
            nonlocal n
            alt = m.group(1)
            if alt in MEANINGLESS:
                n += 1
                return f"![{title} 配图 {n}]"
            return m.group(0)  # 有意义的 alt 原样保留

        new = re.sub(r"!\[([^\]]*)\]", repl, text)
        if new != text:
            p.write_text(new, encoding="utf-8")
            print(f"✓ {p.name}: 替换 {n} 处 → 例：![{title} 配图 1]")
            total += n
    print(f"共替换 {total} 处")


if __name__ == "__main__":
    main()