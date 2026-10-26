#!/usr/bin/env python3
"""把正文仍引用的图片转成无损 WebP，更新 markdown 引用，原图归档。

实测：无损 WebP 约省 71-75%，且对文字截图零质量损失。
注意两点（实测得出）：
  1. 限宽对无损 WebP 有害——缩放插值破坏纯色块，反而变大，所以默认按原尺寸转
  2. 只有超宽的图（>2200px）才值得缩放，用 --max-width 打开

原图不删除，移动到归档目录（默认 Myresource/image-originals/），
真要清理时你自己确认后再删。

默认只做演练，加 --apply 才写盘。
"""
import argparse
import io
import re
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMG_REF = re.compile(r"!\[(?P<alt>[^\]]*)\]\((?P<url>[^)]+)\)")


def to_local(url: str):
    u = url.split("?")[0].split("#")[0]
    if u.startswith("http") or not u.startswith("/"):
        return None
    return ROOT / "static" / u.lstrip("/")


def encode(im: Image.Image, max_width: int):
    """返回 (webp_bytes, out_width, out_height)。"""
    if max_width and im.width > max_width:
        scale = max_width / im.width
        im = im.resize((max_width, max(1, round(im.height * scale))), Image.LANCZOS)
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
    buf = io.BytesIO()
    im.save(buf, "WEBP", lossless=True, method=4)
    return buf.getvalue(), im.width, im.height


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="真正写盘")
    ap.add_argument("--max-width", type=int, default=0,
                    help="超过此宽度才缩放（默认 0=不缩放，无损下缩放会变大）")
    ap.add_argument("--archive", default="Myresource/image-originals",
                    help="原图归档目录")
    ap.add_argument("--exclude", default="",
                    help="逗号分隔的文章 slug，完全跳过（不转不归档不改引用）")
    args = ap.parse_args()
    excl = {s.strip() for s in args.exclude.split(",") if s.strip()}

    archive = ROOT / args.archive

    # 收集正文仍引用的图片
    refs = {}
    for md in sorted((ROOT / "content" / "posts").glob("*.md")):
        if md.stem in excl:
            continue
        text = md.read_text(encoding="utf-8", errors="replace")
        for m in IMG_REF.finditer(text):
            p = to_local(m.group("url"))
            if p is None or not p.exists():
                continue
            refs.setdefault(p, []).append(md)

    pix_ext = {".png", ".jpg", ".jpeg", ".bmp", ".gif"}
    targets = [p for p in refs if p.suffix.lower() in pix_ext]

    print(f"正文引用的图片 {len(refs)} 张，其中可转 WebP 的 {len(targets)} 张")
    before = sum(p.stat().st_size for p in targets)
    print(f"当前体积 {before/1048576:.2f} MB")

    total_after = 0
    converted = []
    skipped = []
    for p in sorted(targets, key=lambda x: -x.stat().st_size):
        try:
            im = Image.open(p)
            im.load()
        except Exception as e:
            skipped.append((p, str(e)))
            continue
        data, w, h = encode(im, args.max_width)
        total_after += len(data)
        if len(data) >= p.stat().st_size * 0.95:
            skipped.append((p, "省不到 5%，保持原格式"))
            converted.append((p, p.stat().st_size))
            total_after += 0
            continue
        converted.append((p, len(data)))

    print(f"转换后预计 {total_after/1048576:.2f} MB，"
          f"省 {100*(1-total_after/max(before,1)):.0f}%")
    if skipped:
        print(f"跳过 {len(skipped)} 张（省不下来或打不开）")

    if not args.apply:
        print("\n[演练] 未写盘。加 --apply 生效。")
        return

    archive.mkdir(parents=True, exist_ok=True)
    written = 0
    for p in targets:
        try:
            im = Image.open(p)
            im.load()
        except Exception:
            continue
        data, _, _ = encode(im, args.max_width)
        if len(data) >= p.stat().st_size * 0.95:
            continue
        out = p.with_suffix(".webp")
        out.write_bytes(data)
        # 归档原图，再删掉 static 里的原文件
        rel = p.relative_to(ROOT / "static")
        dst = archive / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(p), str(dst))
        written += 1

    # 更新 markdown 引用
    md_changed = 0
    for md in sorted((ROOT / "content" / "posts").glob("*.md")):
        if md.stem in excl:
            continue
        text = md.read_text(encoding="utf-8", errors="replace")
        new = text
        for m in IMG_REF.finditer(text):
            url = m.group("url")
            p = to_local(url)
            if p is None:
                continue
            webp = p.with_suffix(".webp")
            if webp.exists():
                new = new.replace(url, url[: -len(p.suffix)] + ".webp")
        if new != text:
            md.write_text(new, encoding="utf-8")
            md_changed += 1

    print(f"\n已转 {written} 张，更新了 {md_changed} 篇正文，"
          f"原图归档到 {archive.relative_to(ROOT)}")


if __name__ == "__main__":
    main()