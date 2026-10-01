#!/usr/bin/env python3
"""One-shot: import the 25 curated photos from scripts/_triage/candidates.csv."""
import pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import csv
from add_photos import slug, ROOT, DEST_BASE, DATA, MAX_EDGE, QUALITY
from PIL import Image, ImageOps

# idx: (place, caption)  — idx 来自拼版图上的 #编号
PICKS = {
    0: ("张家界", "云海奇峰"), 393: ("张家界", "九十九道弯"), 115: ("张家界", "天门洞"),
    367: ("张家界", "溶洞钟乳"), 477: ("张家界", "金鞭溪上的红桥"),
    183: ("成都", "吃竹子的熊猫"), 298: ("成都", "火锅局"), 232: ("成都", "川剧变脸面具墙"),
    324: ("成都", "青铜神树"), 341: ("成都", "双子塔夜景"),
    47: ("衡阳", "校园老钟楼"), 354: ("衡阳", "图书馆中庭"), 470: ("衡阳", "溶洞一线天"), 517: ("衡阳", "园中古阁"),
    105: ("株洲", "一碗馄饨"), 188: ("株洲", "曲线的建筑"), 439: ("株洲", "蟠龙器物"), 451: ("株洲", "恐龙骨架厅"),
    18: ("芷江", "受降纪念坊"), 118: ("芷江", "风雨桥夜景"), 126: ("芷江", "灯笼长巷"), 135: ("芷江", "干锅豆腐"),
    64: ("惠州", "海边落日"), 79: ("惠州", "长堤"), 110: ("惠州", "沙滩与城"), 357: ("惠州", "海边火锅"),
    65: ("浏阳", "馆内老街"), 52: ("浏阳", "古钟"), 225: ("浏阳", "青铜簋"), 176: ("浏阳", "层层书房"),
    255: ("铜仁", "雨中的牌坊街"), 322: ("铜仁", "红顶教堂"), 396: ("铜仁", "朱砂古镇门楼"), 493: ("铜仁", "龙纹石雕"),
}

rows = list(csv.DictReader(open(ROOT / "scripts/_triage/candidates.csv", encoding="utf-8-sig")))
rows.sort(key=lambda r: float(r["sharp"]))  # 还原拼版编号顺序（稳定排序）
entries = []
for idx, (place, caption) in sorted(PICKS.items()):
    r = rows[idx]
    src = pathlib.Path(r["path"])
    if not src.is_file():
        sys.exit(f"#{idx} 文件不存在: {src}")
    img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    img.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
    year = (r["date"] or "2026")[:4]
    d = DEST_BASE / year
    d.mkdir(parents=True, exist_ok=True)
    out = d / f"{place}-{slug(src.name)}.webp"
    n = 1
    while out.exists():
        out = d / f"{place}-{slug(src.name)}-{n}.webp"; n += 1
    img.save(out, "WEBP", quality=QUALITY, method=4)
    entries.append((out.relative_to(ROOT / "static").as_posix(), r["date"] or f"{year}-01-01", place, caption))
    print(f"✓ #{idx} {place} {caption} ← {src.name}")

with DATA.open("a", encoding="utf-8") as fh:
    for src, date, place, cap in entries:
        fh.write(f'- src: "{src}"\n  date: "{date}"\n  place: "{place}"\n  caption: "{cap}"\n')
print(f"共 {len(entries)} 张，已登记 data/photos.yml")
