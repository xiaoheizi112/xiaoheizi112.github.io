#!/usr/bin/env python3
"""解析 static/photos/ 下所有 webp 的宽高，生成 data/photo_dims.yml（src: [w, h]）。
新增照片后重跑一次即可；漏跑也不会报错，只是那张没有防 CLS 尺寸。"""
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def webp_dims(data: bytes):
    assert data[:4] == b"RIFF" and data[8:12] == b"WEBP"
    cc = data[12:16]
    if cc == b"VP8X":  # 扩展格式：画布尺寸在头 10 字节后（各 24bit LE，存值=实际-1）
        w = int.from_bytes(data[24:27], "little") + 1
        h = int.from_bytes(data[27:30], "little") + 1
    elif cc == b"VP8 ":  # 有损：关键帧里各 16bit LE 低 14 位
        w = struct.unpack_from("<H", data, 26)[0] & 0x3FFF
        h = struct.unpack_from("<H", data, 28)[0] & 0x3FFF
    elif cc == b"VP8L":  # 无损：签名 0x2f 后 14bit 宽-1 + 14bit 高-1
        b0, b1, b2, b3 = data[21:25]
        w = (b0 | (b1 & 0x3F) << 8) + 1
        h = ((b1 >> 6) | b2 << 2 | (b3 & 0xF) << 10) + 1
    else:
        raise ValueError(f"unknown webp chunk {cc!r}")
    return w, h

def main():
    out = []
    for p in sorted((ROOT / "static" / "photos").rglob("*.webp")):
        src = p.relative_to(ROOT / "static").as_posix()
        w, h = webp_dims(p.read_bytes()[:64])
        out.append(f'{src}: [{w}, {h}]')
    (ROOT / "data" / "photo_dims.yml").write_text("\n".join(out) + "\n", encoding="utf-8")
    print(f"wrote {len(out)} entries -> data/photo_dims.yml")

if __name__ == "__main__":
    main()
