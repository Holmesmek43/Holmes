#!/usr/bin/env python3
"""Generates PNG icons for PWA using only stdlib."""
import struct, zlib, os, math

def write_png(path, size):
    os.makedirs(os.path.dirname(path), exist_ok=True)

    def hex_rgb(h):
        h = h.lstrip('#')
        return int(h[0:2],16), int(h[2:4],16), int(h[4:6],16)

    BG_RGB   = hex_rgb('0f0f1a')
    CYAN_RGB = hex_rgb('00f5ff')
    CELL_RGB = hex_rgb('1a1a3e')

    # Pixel buffer: flat list of [r,g,b,a] * (size*size)
    buf = [[0,0,0,0]] * (size * size)

    def set_px(x, y, rgba):
        if 0 <= x < size and 0 <= y < size:
            buf[y * size + x] = list(rgba)

    def blend(x, y, rgba, alpha=1.0):
        if 0 <= x < size and 0 <= y < size:
            r,g,b,a = rgba
            buf[y * size + x] = [r, g, b, int(a * alpha)]

    corner_r = size * 0.18
    border_w = max(2, int(size * 0.035))

    def in_rrect(x, y, rx, ry, rw, rh, r):
        if x < rx or x >= rx+rw or y < ry or y >= ry+rh:
            return False
        # check corners
        corners = [(rx+r, ry+r), (rx+rw-r, ry+r), (rx+r, ry+rh-r), (rx+rw-r, ry+rh-r)]
        # only check corner regions
        if x < rx+r and y < ry+r:
            return math.hypot(x-corners[0][0], y-corners[0][1]) <= r
        if x >= rx+rw-r and y < ry+r:
            return math.hypot(x-corners[1][0], y-corners[1][1]) <= r
        if x < rx+r and y >= ry+rh-r:
            return math.hypot(x-corners[2][0], y-corners[2][1]) <= r
        if x >= rx+rw-r and y >= ry+rh-r:
            return math.hypot(x-corners[3][0], y-corners[3][1]) <= r
        return True

    # Draw background + border
    for y in range(size):
        for x in range(size):
            in_outer = in_rrect(x, y, 0, 0, size, size, corner_r)
            if not in_outer:
                continue  # transparent
            in_inner = in_rrect(x, y, border_w, border_w, size-2*border_w, size-2*border_w, corner_r - border_w)
            if in_inner:
                buf[y*size+x] = [*BG_RGB, 255]
            else:
                buf[y*size+x] = [*CYAN_RGB, 255]

    # Dice face rectangle
    m = int(size * 0.20)
    ds = int(size * 0.60)
    dr = max(2, int(size * 0.08))
    for y in range(m, m+ds):
        for x in range(m, m+ds):
            if in_rrect(x, y, m, m, ds, ds, dr):
                buf[y*size+x] = [*CELL_RGB, 255]

    # Dots
    dot_r = size * 0.07
    dots = [(0.35,0.35),(0.65,0.35),(0.50,0.50),(0.35,0.65),(0.65,0.65)]
    for (dx, dy) in dots:
        cx2 = size * dx
        cy2 = size * dy
        for py in range(int(cy2-dot_r)-1, int(cy2+dot_r)+2):
            for px in range(int(cx2-dot_r)-1, int(cx2+dot_r)+2):
                if 0 <= px < size and 0 <= py < size:
                    dist = math.hypot(px-cx2, py-cy2)
                    if dist <= dot_r:
                        buf[py*size+px] = [*CYAN_RGB, 255]

    # Encode PNG
    def chunk(tag, data):
        crc = zlib.crc32(tag + data) & 0xffffffff
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', crc)

    raw = bytearray()
    for y in range(size):
        raw += b'\x00'  # filter none
        for x in range(size):
            raw += bytes(buf[y*size+x])

    ihdr_data = struct.pack('>II', size, size) + bytes([8, 6, 0, 0, 0])
    png_bytes = (
        b'\x89PNG\r\n\x1a\n'
        + chunk(b'IHDR', ihdr_data)
        + chunk(b'IDAT', zlib.compress(bytes(raw), 9))
        + chunk(b'IEND', b'')
    )

    with open(path, 'wb') as f:
        f.write(png_bytes)
    print(f'Generated {path} ({len(png_bytes)} bytes)')

write_png('public/icons/icon-192.png', 192)
write_png('public/icons/icon-512.png', 512)
