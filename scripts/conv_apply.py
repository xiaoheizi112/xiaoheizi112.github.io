#!/usr/bin/env python3
"""把 .zcode/conv/<post>/<name>.md 的转写结果装配回正文。

正文里每张图独占一行：![](/posts/<post>/<name>.png)
转写文件第一行是 <!-- kind=... -->，其余内容原地替换那一行。

- 转写文件不存在 -> 保留原图不动，计入 missing
- 转写文件正文为空（kind=ui/photo）-> 保留原图不动，计入 kept_image
- 正文含 <details> -> 说明转写方自己嵌了原图折叠块，原图仍在

默认只做演练，加 --apply 才写盘。
"""
import argparse
import re
import shutil
from pathlib import Path

IMG_LINE = re.compile(r"^!\[[^\]]*\]\(/posts/(?P<post>[^/]+)/(?P<name>[^)]+)\)\s*$")
HEADER = re.compile(r"^<!--\s*conv\s+kind=(?P<kind>\S+).*?-->\s*$|^<!--\s*kind=(?P<kind2>\S+).*?-->\s*$")


def load_conv(path: Path):
    """返回 (kind, body)。body 为去掉了第一行注释头的正文。"""
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    kind = "?"
    if lines and lines[0].lstrip().startswith("<!--"):
        m = HEADER.match(lines[0].strip())
        if m:
            kind = m.group("kind") or m.group("kind2") or "?"
        body = "\n".join(lines[1:]).strip("\n")
    else:
        body = text.strip("\n")
    return kind, body


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--md", required=True, help="正文 markdown 路径")
    ap.add_argument("--conv", required=True, help="转写产物目录")
    ap.add_argument("--apply", action="store_true", help="真正写盘")
    ap.add_argument("--backup", action="store_true", help="写盘前备份原文件")
    ap.add_argument("--kinds", default="code",
                    help="只装配这些 kind（逗号分隔），默认只装 code；"
                         "导图/表格/UI 保留原图")
    args = ap.parse_args()
    allowed = {k.strip() for k in args.kinds.split(",") if k.strip()}

    md_path = Path(args.md)
    conv_dir = Path(args.conv)
    src = md_path.read_text(encoding="utf-8")
    lines = src.splitlines()

    out = []
    stats = {"converted": 0, "empty_body": 0, "missing": 0, "skipped_kind": 0,
             "untouched_nonimg": 0}
    kinds = {}
    replaced_names = []

    for line in lines:
        m = IMG_LINE.match(line)
        if not m:
            out.append(line)
            continue
        name = m.group("name")
        stem = Path(name).stem
        cf = conv_dir / f"{stem}.md"
        if not cf.exists():
            stats["missing"] += 1
            out.append(line)
            continue
        kind, body = load_conv(cf)
        kinds[kind] = kinds.get(kind, 0) + 1
        if kind not in allowed:
            stats["skipped_kind"] += 1
            out.append(line)
            continue
        if not body:
            stats["empty_body"] += 1
            out.append(line)
            continue
        out.append(body)
        stats["converted"] += 1
        replaced_names.append(name)

    result = "\n".join(out)
    if src.endswith("\n"):
        result += "\n"

    print(f"正文: {md_path}")
    print(f"  转写目录: {conv_dir}")
    print(f"  已替换为文字: {stats['converted']}")
    print(f"  正文为空、保留原图: {stats['empty_body']}")
    print(f"  无转写结果、保留原图: {stats['missing']}")
    print(f"  kind 分布: {kinds}")
    print(f"  正文字节: {len(src.encode())} -> {len(result.encode())} "
          f"({(len(result.encode())-len(src.encode()))/1024:+.1f} KB)")

    if not args.apply:
        print("\n[演练] 未写盘。加 --apply 生效。")
        return

    if args.backup:
        bak = md_path.with_suffix(md_path.suffix + ".bak")
        shutil.copy2(md_path, bak)
        print(f"  已备份: {bak}")
    md_path.write_text(result, encoding="utf-8")
    print("  已写盘。")


if __name__ == "__main__":
    main()