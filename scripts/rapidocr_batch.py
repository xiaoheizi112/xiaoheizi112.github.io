#!/usr/bin/env python3
"""用 rapidocr（PP-OCR 同款内核）批量读全部截图，结果缓存成 JSONL。

这层独立于视觉模型：它的失效模式不同（会错大小写，但不会凭空编造结构），
所以可以拿来当交叉验证的第二意见。

已存在的缓存会跳过，可反复运行。
"""
import json
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / ".zcode" / "rapidocr.jsonl"
EXT = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}


def main():
    roots = [ROOT / "static" / "posts"]
    files = []
    for r in roots:
        for p in sorted(r.rglob("*")):
            if p.suffix.lower() in EXT:
                files.append(p)

    done = set()
    if OUT.exists():
        for line in OUT.read_text(encoding="utf-8", errors="replace").splitlines():
            try:
                done.add(json.loads(line)["path"])
            except Exception:
                pass
        print(f"缓存已有 {len(done)} 条")

    todo = [f for f in files if str(f.relative_to(ROOT)).replace("\\", "/") not in done]
    print(f"待处理 {len(todo)} / {len(files)} 张")

    if not todo:
        print("没有要处理的。")
        return

    from rapidocr import RapidOCR

    engine = RapidOCR()
    t_start = time.perf_counter()
    mode = "a" if OUT.exists() else "w"

    with OUT.open(mode, encoding="utf-8") as fh:
        for i, p in enumerate(todo, 1):
            rel = str(p.relative_to(ROOT)).replace("\\", "/")
            rec = {"path": rel, "ok": False, "ms": 0, "lines": [], "error": None}
            t0 = time.perf_counter()
            try:
                res = engine(str(p))
                rec["ms"] = int((time.perf_counter() - t0) * 1000)
                txts = list(res.txts) if res is not None and res.txts is not None else []
                boxes = list(res.boxes) if res is not None and res.boxes is not None else []
                rows = []
                for t, b in zip(txts, boxes):
                    xs = [pt[0] for pt in b]
                    ys = [pt[1] for pt in b]
                    rows.append({
                        "t": t,
                        "x": int(min(xs)),
                        "y": int(min(ys)),
                        "r": int(max(xs)),
                    })
                rec["lines"] = rows
                rec["ok"] = True
            except Exception as e:
                rec["error"] = str(e)
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
            fh.flush()
            if i % 25 == 0:
                el = time.perf_counter() - t_start
                print(f"  {i}/{len(todo)}  已用 {el:.0f}s  预计还需 {el/i*(len(todo)-i):.0f}s")

    el = time.perf_counter() - t_start
    print(f"完成 {len(todo)} 张，用时 {el:.0f}s，平均 {el/max(len(todo),1)*1000:.0f}ms/张")
    print(f"缓存: {OUT}")


if __name__ == "__main__":
    main()