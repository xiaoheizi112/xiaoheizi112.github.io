#!/usr/bin/env python3
"""Rough-filter travel photos: drop videos/screenshots/tiny/blurry, dedupe bursts.

Writes candidates.csv (path,date,w,h,sharp,dhash) and per-place contact sheets
under scripts/_triage/ so a human can eyeball grids instead of 800 files.

Usage: python scripts/triage_photos.py "E:/生活记录/旅游+生活"
"""
import csv, pathlib, sys
from PIL import Image, ImageDraw, ImageFilter, ImageOps

Image.MAX_IMAGE_PIXELS = None
MIN_EDGE = 800
SCREEN_SIZES = {  # 常见手机截图/壁纸尺寸（短边比例或精确匹配）
    (1080, 1920), (1080, 2160), (1080, 2280), (1080, 2340), (1080, 2400),
    (1080, 2408), (1080, 2520), (1080, 2640), (720, 1280), (720, 1440),
    (720, 1520), (720, 1560), (720, 1600), (828, 1792), (1125, 2436),
    (1170, 2532), (1179, 2556), (1284, 2778), (1290, 2796), (1440, 3200),
    (1260, 2800), (1220, 2712), (1200, 2640), (1080, 2376), (1080, 2412),
}
HAMMING_CUT = 10  # dHash 距离 ≤ 此值视为同场景连拍


def dhash(img, size=8):
    g = img.convert("L").resize((size + 1, size), Image.LANCZOS)
    px = list(g.getdata())
    bits = 0
    for r in range(size):
        for c in range(size):
            bits = (bits << 1) | (px[r * (size + 1) + c] > px[r * (size + 1) + c + 1])
    return bits


def sharpness(img):
    g = img.convert("L")
    g.thumbnail((800, 800), Image.LANCZOS)
    edges = g.filter(ImageFilter.FIND_EDGES)
    hist = edges.histogram()
    mean = sum(i * h for i, h in enumerate(hist)) / g.size[0] / g.size[1]
    var = sum((i - mean) ** 2 * h for i, h in enumerate(hist)) / g.size[0] / g.size[1]
    return var


def exif_date(img):
    try:
        dt = img.getexif().get(36867) or img.getexif().get(306)  # DateTimeOriginal / Modified
        return (dt or "")[:10].replace(":", "-")
    except Exception:
        return ""


def main(root):
    root = pathlib.Path(root)
    out_dir = pathlib.Path(__file__).parent / "_triage"
    out_dir.mkdir(exist_ok=True)
    rows, skipped = [], {"video": 0, "small": 0, "screenshot": 0, "unreadable": 0, "burst": 0, "blurry": 0}

    for p in sorted(root.rglob("*")):
        if p.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
            skipped["video"] += 1
            continue
        try:
            img = Image.open(p)
            img = ImageOps.exif_transpose(img)
        except Exception:
            skipped["unreadable"] += 1
            continue
        w, h = img.size
        if min(w, h) < MIN_EDGE:
            skipped["small"] += 1
            continue
        if (w, h) in SCREEN_SIZES or (h, w) in SCREEN_SIZES:
            skipped["screenshot"] += 1
            continue
        if not exif_date(img) and abs(h - w * 16 / 9) < 2:  # 无相机信息 + 标准屏幕比例
            skipped["screenshot"] += 1
            continue
        rows.append({"path": str(p), "place": p.parent.relative_to(root).as_posix().split("/")[0],
                     "date": exif_date(img), "w": w, "h": h,
                     "sharp": round(sharpness(img), 1), "dhash": dhash(img)})

    # 连拍去重：同地点内按 dHash 聚类，留最清晰的一张
    rows.sort(key=lambda r: (r["place"], r["dhash"]))
    kept = []
    for r in rows:
        dup = next((k for k in kept if k["place"] == r["place"]
                    and bin(k["dhash"] ^ r["dhash"]).count("1") <= HAMMING_CUT), None)
        if dup:
            skipped["burst"] += 1
            if r["sharp"] > dup["sharp"]:
                kept[kept.index(dup)] = r
        else:
            kept.append(r)
    # 清晰度垫底的 10% 丢掉
    kept.sort(key=lambda r: r["sharp"])
    cut = int(len(kept) * 0.10)
    skipped["blurry"] += cut
    kept = kept[cut:]

    with open(out_dir / "candidates.csv", "w", newline="", encoding="utf-8-sig") as f:
        wcsv = csv.DictWriter(f, ["place", "date", "path", "w", "h", "sharp"])
        wcsv.writeheader()
        for r in sorted(kept, key=lambda x: (x["place"], x["date"])):
            wcsv.writerow({k: r[k] for k in ("place", "date", "path", "w", "h", "sharp")})

    # 每地点生成缩略图拼版（6 列），文件名带序号，对应 candidates.csv 行号
    places = {}
    for i, r in enumerate(kept):
        places.setdefault(r["place"], []).append((i, r))
    for place, items in places.items():
        cols, thumb = 6, 200
        for sheet_i in range(0, len(items), 30):
            chunk = items[sheet_i:sheet_i + 30]
            rows_n = (len(chunk) + cols - 1) // cols
            sheet = Image.new("RGB", (cols * (thumb + 4), rows_n * (thumb + 22)), (247, 245, 240))
            draw = ImageDraw.Draw(sheet)
            for j, (idx, r) in enumerate(chunk):
                try:
                    t = Image.open(r["path"]); t = ImageOps.exif_transpose(t)
                    t.thumbnail((thumb, thumb), Image.LANCZOS)
                except Exception:
                    continue
                x, y = (j % cols) * (thumb + 4), (j // cols) * (thumb + 22)
                sheet.paste(t, (x + (thumb - t.size[0]) // 2, y))
                draw.text((x + 2, y + thumb + 2), f"#{idx}", fill=(40, 40, 40))
            safe = place.replace("/", "-")
            sheet.save(out_dir / f"{safe}_{sheet_i // 30 + 1}.jpg", quality=82)

    print(f"候选 {len(kept)} 张 | 跳过 {skipped}")
    print(f"拼版与 CSV 在 {out_dir}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "E:/生活记录/旅游+生活")
