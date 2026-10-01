#!/usr/bin/env python3
"""Add photos to the /photos/ waterfall.

Compresses to webp (max edge 1600px, quality 80), auto-rotates by EXIF,
strips ALL metadata (incl. GPS), saves under static/photos/<year>/, and
appends entries to data/photos.yml.

Usage:
    python scripts/add_photos.py --place 川西 --date 2026-10-01 *.JPG
    python scripts/add_photos.py --caption "路边的小店" shop.jpg
"""
import argparse, datetime, pathlib, re, sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("需要 Pillow: pip install pillow（国内源 pip install -i https://pypi.tuna.tsinghua.edu.cn/simple pillow）")

ROOT = pathlib.Path(__file__).resolve().parent.parent
DEST_BASE = ROOT / "static" / "photos"
DATA = ROOT / "data" / "photos.yml"
MAX_EDGE, QUALITY = 1600, 80


def slug(name: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9一-鿿_-]+", "-", pathlib.Path(name).stem).strip("-")
    return s.lower() or "photo"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--date", default=datetime.date.today().isoformat())
    ap.add_argument("--place", default="")
    ap.add_argument("--caption", default="")
    ap.add_argument("files", nargs="+", help="jpg/png/webp 文件（支持多个/通配符）")
    args = ap.parse_args()

    year = args.date[:4]
    dest_dir = DEST_BASE / year
    dest_dir.mkdir(parents=True, exist_ok=True)

    entries = []
    for f in args.files:
        p = pathlib.Path(f)
        if not p.is_file():
            print(f"跳过（不存在）: {p}", file=sys.stderr)
            continue
        img = Image.open(p)
        img = ImageOps.exif_transpose(img)          # 按 EXIF 方向转正
        img = img.convert("RGB")
        img.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)  # 只缩不放
        out = dest_dir / f"{slug(p.name)}.webp"
        n = 1
        while out.exists():                          # 同名加序号
            out = dest_dir / f"{slug(p.name)}-{n}.webp"
            n += 1
        img.save(out, "WEBP", quality=QUALITY, method=4)  # 不写 exif = 自动抹 GPS
        rel = out.relative_to(ROOT / "static").as_posix()
        size_kb = out.stat().st_size // 1024
        entries.append({"src": rel, "date": args.date, "place": args.place, "caption": args.caption})
        print(f"✓ {p.name} → {rel} ({img.width}x{img.height}, {size_kb}KB)")

    if not entries:
        sys.exit("没有成功处理任何图片")

    # 追加到 data/photos.yml（手写极简 YAML，避免依赖 pyyaml）
    with DATA.open("a", encoding="utf-8") as fh:
        for e in entries:
            fh.write(f'- src: "{e["src"]}"\n  date: "{e["date"]}"\n')
            if e["place"]:
                fh.write(f'  place: "{e["place"]}"\n')
            if e["caption"]:
                fh.write(f'  caption: "{e["caption"]}"\n')
    print(f"已追加 {len(entries)} 条到 {DATA.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
