#!/usr/bin/env python3
"""为 static/photos/ 下每张 webp 生成缩略图，存到 static/photos/thumbs/（同相对路径）。

瀑布流 / 首页相册条用缩略图，灯箱用原图——手机端不必在网格里拉 1600px 原图。
新增照片后重跑一次即可；漏跑的图会退回原图（模板里 data-full 缺失时用 src）。
"""
import pathlib
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("需要 Pillow: pip install pillow")

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC_BASE = ROOT / "static" / "photos"
THUMB_BASE = SRC_BASE / "thumbs"
MAX_EDGE, QUALITY = 900, 72


def make_thumb(src: pathlib.Path) -> pathlib.Path | None:
    """src = static/photos/<...>.webp → static/photos/thumbs/<...>.webp；返回相对 static 的路径。"""
    rel = src.relative_to(SRC_BASE)
    out = THUMB_BASE / rel
    out.parent.mkdir(parents=True, exist_ok=True)
    if out.exists() and out.stat().st_mtime_ns >= src.stat().st_mtime_ns:
        return out
    img = Image.open(src).convert("RGB")
    img.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
    img.save(out, "WEBP", quality=QUALITY, method=4)
    return out


def main():
    n = 0
    for p in sorted(SRC_BASE.rglob("*.webp")):
        if "thumbs" in p.relative_to(SRC_BASE).parts:
            continue
        make_thumb(p)
        n += 1
    print(f"生成/更新 {n} 张缩略图 → static/photos/thumbs/")


if __name__ == "__main__":
    main()