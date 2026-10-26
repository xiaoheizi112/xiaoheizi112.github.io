#!/usr/bin/env python3
"""交叉验证：把视觉模型的转写和 rapidocr 的独立读取比对，列出可疑处。

两个引擎失效模式不同：视觉模型理解上下文好但可能漏行改字；rapidocr 会错大小写
但不会凭空编造结构。两者不一致处值得人核一眼。

精度优先：宁可少报也不要噪音。核心手段是**按 kind 分流**——
  code  ：逐条注释、逐行标识符严格比对（转写应当逐字对应）
  table ：只比对表格文字的整体覆盖
  diagram：只比对中文标签的整体覆盖（转写是重新表述，不能逐行比）
  ui/photo：正文为空或只有说明，不比对

不是判决，是一份按严重度排序的复核队列。
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CJK = re.compile(r"[\u4e00-\u9fff]")
IDENT = re.compile(r"[A-Za-z_][A-Za-z0-9_]{4,}")
HEADER = re.compile(r"^<!--\s*conv\s+kind=(\S+)|^<!--\s*kind=(\S+)")
CODE_FENCE = re.compile(r"^\s*```")
HTML_TAG = re.compile(r"<[^<>\n]+>")
IMG_REF = re.compile(r"!\[[^\]]*\]\([^)]*\)")
DETAILS = re.compile(r"<details>.*?</details>", re.S)
COMMENT_LINE = re.compile(r"^\s*(//|#|/\*|\*|<!--)")
CODE_HINT = re.compile(r"[;{}()=]|::|->")


def strip_markup(md: str) -> str:
    body = "\n".join(l for l in md.splitlines() if not l.lstrip().startswith("<!--"))
    body = DETAILS.sub(" ", body)
    body = HTML_TAG.sub(" ", body)
    body = IMG_REF.sub(" ", body)
    body = CODE_FENCE.sub("", body)
    return body


def cjk_join(s: str) -> str:
    """把所有中文字符连起来，忽略标点空白，便于做包含判断。"""
    return "".join(CJK.findall(s))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=".zcode/crosscheck-report.md")
    ap.add_argument("--verbose", action="store_true")
    args = ap.parse_args()

    cache = {}
    f = ROOT / ".zcode" / "rapidocr.jsonl"
    if not f.exists():
        print("没有 rapidocr 缓存，先跑 scripts/rapidocr_batch.py")
        sys.exit(1)
    for line in f.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            rec = json.loads(line)
        except json.JSONDecodeError:
            continue
        if rec.get("ok"):
            cache[rec["path"]] = rec
    print(f"rapidocr 缓存 {len(cache)} 条")

    conv_dir = ROOT / ".zcode" / "conv"
    conv_files = sorted(
        x for x in conv_dir.rglob("*.md")
        if not any(p.startswith("_") or p.startswith(".") for p in x.relative_to(conv_dir).parts)
    )

    by_kind = {}
    findings = []
    stats = {"no_ocr": 0, "kept_image": 0, "compared": 0}

    for cf in conv_files:
        post, stem = cf.parent.name, cf.stem
        rec = None
        for ext in (".png", ".jpg", ".jpeg", ".webp"):
            rec = cache.get(f"static/posts/{post}/{stem}{ext}")
            if rec:
                break
        if rec is None:
            stats["no_ocr"] += 1
            continue

        md = cf.read_text(encoding="utf-8", errors="replace")
        first = md.splitlines()[0] if md.splitlines() else ""
        m = HEADER.match(first.strip())
        kind = (m.group(1) or m.group(2)) if m else "?"
        by_kind[kind] = by_kind.get(kind, 0) + 1

        body = strip_markup(md)
        if not body.strip():
            stats["kept_image"] += 1
            continue

        ocr_lines = [l["t"] for l in rec["lines"] if l["t"].strip()]
        body_cjk = cjk_join(body)
        flags = []

        if kind == "code":
            # 1) 注释行必须出现在转写里（含中文的才检查，纯英文注释容错太多）
            for t in ocr_lines:
                s = t.strip()
                if COMMENT_LINE.match(s) and len(CJK.findall(s)) >= 3:
                    key = cjk_join(s)
                    if key and key not in body_cjk:
                        # 容忍 OCR 错字：取首尾片段任一对上就算通过
                        if not (key[:4] in body_cjk or key[-4:] in body_cjk):
                            flags.append(("HIGH", f"注释疑似整条漏掉：{s[:60]}"))
            # 2) 长代码行整行丢失（该行标识符一个都没出现）
            ids_in_body = {x.lower() for x in IDENT.findall(body)}
            for t in ocr_lines:
                s = t.strip()
                if len(s) < 25 or COMMENT_LINE.match(s) or not CODE_HINT.search(s):
                    continue
                toks = [x for x in IDENT.findall(s)]
                if len(toks) < 2:
                    continue
                hit = sum(1 for x in toks if any(x.lower() in y or y in x.lower() for y in ids_in_body))
                if hit == 0:
                    flags.append(("HIGH", f"整行疑似漏掉：{s[:70]}"))
            # 3) 标识符大小写不一致（仅当两边都出现且不是子串关系）
            ocr_ids = {}
            for t in ocr_lines:
                for x in IDENT.findall(t):
                    ocr_ids.setdefault(x.lower(), x)
            for low, shown in ocr_ids.items():
                if low in ids_in_body and shown not in body and shown.lower() in body.lower():
                    flags.append(("MED", f"大小写不一致：截图侧 {shown}"))
        elif kind in ("table", "diagram"):
            # 整体覆盖：OCR 读到的中文标签至少大半应出现在转写里
            ocr_cjk_runs = {cjk_join(t) for t in ocr_lines if len(CJK.findall(t)) >= 3}
            ocr_cjk_runs = {r for r in ocr_cjk_runs if len(r) >= 3}
            if ocr_cjk_runs:
                miss = [r for r in ocr_cjk_runs if r not in body_cjk and r[:3] not in body_cjk and r[-3:] not in body_cjk]
                ratio = 1 - len(miss) / len(ocr_cjk_runs)
                if ratio < 0.5:
                    flags.append(("HIGH", f"中文覆盖只有 {ratio:.0%}，疑似大面积未转写"))
                    for r in sorted(miss, key=len, reverse=True)[:4]:
                        flags.append(("MED", f"未见：{r[:40]}"))
        else:
            stats["kept_image"] += 1
            continue

        stats["compared"] += 1
        if flags:
            findings.append((post, stem, kind, flags))

    findings.sort(key=lambda x: (-sum(1 for s, _ in x[3] if s == "HIGH"), -len(x[3])))
    n_high = sum(1 for _, _, _, fl in findings for s, _ in fl if s == "HIGH")
    n_med = sum(1 for _, _, _, fl in findings for s, _ in fl if s == "MED")

    out = [
        "# 转写交叉验证报告",
        "",
        f"比对 {stats['compared']} 个有正文的转写文件"
        f"（{stats['kept_image']} 个有意保留原图不计；{stats['no_ocr']} 个无 OCR 记录）。",
        f"kind 分布：{by_kind}",
        "",
        f"有疑点 {len(findings)} 个文件，HIGH {n_high} 条、MED {n_med} 条。",
        "",
        "这不是判决：rapidocr 自己也会读错，每条都要人核原图。",
        "HIGH = 注释或整行疑似漏掉（最危险）；MED = 大小写不一致或覆盖不足。",
        "",
    ]
    for post, stem, kind, fl in findings:
        out.append(f"## {post}/{stem}  （kind={kind}）")
        out.append("")
        for sev, msg in fl:
            out.append(f"- **{sev}** {msg}")
        out.append("")

    dest = ROOT / args.out
    dest.write_text("\n".join(out), encoding="utf-8")
    print(f"有疑点文件 {len(findings)} / {stats['compared']}")
    print(f"HIGH {n_high} 条，MED {n_med} 条")
    print(f"报告: {dest}")

    if args.verbose:
        for post, stem, kind, fl in findings[:12]:
            print(f"\n{post}/{stem} (kind={kind})")
            for sev, msg in fl[:5]:
                print(f"  [{sev}] {msg}")


if __name__ == "__main__":
    main()