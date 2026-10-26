#!/usr/bin/env python3
"""把 ocr_images.ps1 产出的 JSONL 分类成：代码截图 / 图形讲解 / 无文字。

不依赖视觉模型：用 OCR 行的版面特征（行距规律性、左对齐比例、字符密度、
代码符号占比）来判定。产出一份分桶报告，供人工抽样复核。
"""
import json
import re
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path

CODE_TOKEN = re.compile(
    r"(::|->|#include|\bstd\b|\bvoid\b|\bint\b|\bfloat\b|\bdouble\b|\bchar\b|"
    r"\bdef\b|\bclass\b|\bimport\b|\bfrom\b|\breturn\b|\bprint\b|\bself\b|"
    r"\bpublic\b|\bprivate\b|\bprotected\b|\bnamespace\b|\busing\b|"
    r"\bfor\b|\bwhile\b|\bif\b|\belse\b|\belif\b|\btry\b|\bexcept\b|"
    r"\bQString\b|\bQWidget\b|\bQApplication\b|\bemit\b|\bsignal\b|\bslot\b|"
    r"\$|#|//|/\*|\*/|;|\)\s*\{|\}\s*$|=\s*[^=]|==|!=|\+=|->)"
)
SYMBOLS = re.compile(r"[{}()\[\];=<>+\-*/%&|!.,:_]")
CJK = re.compile(r"[\u4e00-\u9fff]")


def analyse(rec):
    lines = rec.get("lines") or []
    w, h = rec.get("w") or 0, rec.get("h") or 0
    if not lines or w <= 0 or h <= 0:
        return None
    texts = [(ln.get("t") or "").strip() for ln in lines]
    texts = [t for t in texts if t]
    if not texts:
        return None

    n = len(texts)
    chars = sum(len(t) for t in texts)
    nonspace = sum(len(t.replace(" ", "")) for t in texts)

    xs = [ln["x"] for ln in lines]
    ys = [ln["y"] for ln in lines]
    hs = [ln.get("h") or 0 for ln in lines]
    xmin = min(xs)
    xmin_common = min(xs)  # left margin
    ymin, ymax = min(ys), max(ys)
    box_h = (ymax + max(hs)) - ymin
    box_w = max(ln.get("r", ln["x"]) for ln in lines) - xmin
    text_area = max(box_w * box_h, 1)
    img_area = w * h

    coverage = text_area / img_area
    density = chars / text_area  # chars per px^2 of the text block

    # 行距规律性：代码截图行距近乎恒定，导图/散点标签忽远忽近
    ysorted = sorted(set(ys))
    gaps = [b - a for a, b in zip(ysorted, ysorted[1:])] if len(ysorted) > 2 else []
    if len(gaps) >= 3:
        med_gap = statistics.median(gaps)
        gap_cv = (statistics.pstdev(gaps) / med_gap) if med_gap > 0 else 99.0
    else:
        med_gap, gap_cv = 0.0, 99.0

    # 左对齐比例：代码大量行从同一左边距起
    left_aligned = sum(1 for x in xs if x <= xmin_common + 6) / n

    joined = "\n".join(texts)
    code_hits = len(CODE_TOKEN.findall(joined))
    sym_ratio = len(SYMBOLS.findall(joined)) / max(nonspace, 1)
    cjk_ratio = len(CJK.findall(joined)) / max(chars, 1)
    avg_len = chars / n

    # ---- 判定 ----
    # 目标是决定"怎么处置这张图"，不是描述它。
    chrome = re.search(
        r"(Qt Creator|Close|Cancel|Apply|Help|OK\b|Notepad|PyCharm|Settings|"
        r"File  Edit|Build  Debug|Project|Properties)",
        joined,
    )
    indent_levels = len({round(x / 12) for x in xs})

    if nonspace < 25:
        kind = "no_text"          # 无文字：照片/图标/纯图形
    elif code_hits >= 5 and avg_len >= 8:
        kind = "code"             # 明确代码
    elif code_hits >= 3 and sym_ratio >= 0.07:
        kind = "code"
    elif code_hits >= 2 and indent_levels >= 3 and avg_len >= 8:
        kind = "code"             # 缩进层级清楚，即使 token 少
    elif left_aligned >= 0.55 and avg_len >= 8 and coverage >= 0.35:
        kind = "structure"        # 目录树/项目结构/清单
    elif chrome and avg_len < 22 and code_hits <= 2:
        kind = "ui"               # 应用窗口截图，内容主要靠看
    elif coverage < 0.5 and avg_len < 22:
        kind = "diagram"          # 稀疏短标签 → 导图/框图/梯形图
    elif sym_ratio < 0.06 and cjk_ratio > 0.3:
        kind = "prose"            # 中文成段文字截图
    else:
        kind = "other"

    return {
        "kind": kind,
        "n": n,
        "chars": chars,
        "avg_len": round(avg_len, 1),
        "coverage": round(coverage, 3),
        "density": round(density, 5),
        "gap_cv": round(gap_cv, 2),
        "left_aligned": round(left_aligned, 2),
        "code_hits": code_hits,
        "sym_ratio": round(sym_ratio, 3),
        "cjk_ratio": round(cjk_ratio, 3),
        "w": w,
        "h": h,
        "ms": rec.get("ms", 0),
        "sample": " / ".join(texts[:3])[:160],
    }


def main():
    src = Path(sys.argv[1] if len(sys.argv) > 1 else ".zcode/ocr_raw.jsonl")
    rows = []
    bad = []
    for line in src.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        if not rec.get("ok"):
            bad.append((rec.get("path"), rec.get("error")))
            continue
        a = analyse(rec)
        if a:
            a["path"] = rec["path"]
            a["name"] = rec["name"]
            a["bytes"] = rec.get("bytes", 0)
            rows.append(a)

    print(f"总记录 {len(rows)}，OCR 失败 {len(bad)}")
    if bad:
        for p, e in bad[:5]:
            print(f"  失败: {p} -> {e}")

    buckets = Counter(r["kind"] for r in rows)
    print("\n=== 分类结果 ===")
    for k, v in buckets.most_common():
        mb = sum(r["bytes"] for r in rows if r["kind"] == k) / 1048576
        print(f"  {k:9s} {v:4d} 张   {mb:6.2f} MB")

    # 按文章聚合
    per_post = defaultdict(Counter)
    size_post = defaultdict(lambda: defaultdict(int))
    for r in rows:
        post = Path(r["path"]).parent.name
        per_post[post][r["kind"]] += 1
        size_post[post][r["kind"]] += r["bytes"]
    print("\n=== 按文章 ===")
    kinds = ("code", "structure", "diagram", "ui", "prose", "other", "no_text")
    hdr = "".join(f"{k:>10s}" for k in kinds)
    print(f"{'文章':30s} {'总数':>5s}  MB  {hdr}")
    for post in sorted(per_post, key=lambda p: -sum(per_post[p].values())):
        c = per_post[post]
        tot = sum(c.values())
        mb = sum(size_post[post].values()) / 1048576
        cells = "".join(f"{c[k]:10d}" for k in kinds)
        print(f"{post:30s} {tot:5d} {mb:5.1f}  {cells}")

    for kind in ("code", "structure", "diagram", "ui", "other"):
        ex = [r for r in rows if r["kind"] == kind]
        print(f"\n=== {kind} 抽样（最多 6 条）===")
        step = max(1, len(ex) // 6)
        for r in ex[::step][:6]:
            print(f"  {r['name']:22s} {r['w']}x{r['h']} lines={r['n']:3d} "
                  f"gap_cv={r['gap_cv']:5.2f} cov={r['coverage']:.2f} told={r['code_hits']:3d} "
                  f"| {r['sample'][:80]}")

    total_ms = sum(r["ms"] for r in rows)
    print(f"\nOCR 总耗时 {total_ms/1000:.1f}s，平均 {total_ms/max(len(rows),1):.0f}ms/张")


if __name__ == "__main__":
    main()