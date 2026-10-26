#!/usr/bin/env python3
"""量每篇文章的图片负担：引用了几张图、合计多少字节。

改造前后各跑一次，用来出前后对比。只读，不改任何东西。
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG_REF = re.compile(r"!\[[^\]]*\]\((?P<url>[^)]+)\)")


def local_path(url: str):
    """把正文里的图片 URL 映射到 static/ 下的真实文件。"""
    u = url.split("?")[0].split("#")[0]
    if u.startswith("http"):
        return None
    if u.startswith("/"):
        return ROOT / "static" / u.lstrip("/")
    return None


def main():
    posts_dir = ROOT / "content" / "posts"
    rows = []
    for md in sorted(posts_dir.glob("*.md")):
        text = md.read_text(encoding="utf-8", errors="replace")
        refs = IMG_REF.findall(text)
        paths = [p for p in (local_path(u) for u in refs) if p is not None]
        existing = [p for p in paths if p.exists()]
        total = sum(p.stat().st_size for p in existing)
        missing = [p for p in paths if not p.exists()]
        rows.append((md.stem, len(refs), len(existing), total, missing))

    rows.sort(key=lambda r: -r[3])
    print(f"{'文章':30s} {'引用':>5s} {'命中':>5s} {'体积':>10s} {'缺失':>5s}")
    for name, nref, nok, total, missing in rows:
        print(f"{name:30s} {nref:5d} {nok:5d} {total/1048576:9.2f}M {len(missing):5d}")

    print()
    print(f"引用合计 {sum(r[1] for r in rows)} 张，"
          f"命中 {sum(r[2] for r in rows)} 张，"
          f"合计 {sum(r[3] for r in rows)/1048576:.1f} MB")
    allmiss = [(n, m) for n, _, _, _, m in rows if m]
    if allmiss:
        print("\n引用了但文件不存在：")
        for n, m in allmiss:
            for p in m[:5]:
                print(f"  {n}: {p.relative_to(ROOT)}")


if __name__ == "__main__":
    main()