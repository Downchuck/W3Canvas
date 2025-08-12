// A JavaScript port of stb_truetype.h
// The original C code is public domain.

// stbtt__buf helpers to parse data from file
class Buf {
    constructor(data, offset = 0) {
        this.data = data; // This should be a Uint8Array
        this.cursor = offset;
        this.size = data.length;
    }

    get8() {
        if (this.cursor >= this.size) return 0;
        return this.data[this.cursor++];
    }

    peek8() {
        if (this.cursor >= this.size) return 0;
        return this.data[this.cursor];
    }

    seek(o) {
        this.cursor = (o > this.size || o < 0) ? this.size : o;
    }

    skip(o) {
        this.seek(this.cursor + o);
    }

    get(n) {
        let v = 0;
        for (let i = 0; i < n; i++) {
            v = (v << 8) | this.get8();
        }
        return v;
    }

    get16() {
        return this.get(2);
    }

    get32() {
        return this.get(4);
    }

    range(o, s) {
        if (o < 0 || s < 0 || o > this.size || s > this.size - o) {
            return new Buf(new Uint8Array(0));
        }
        return new Buf(this.data.subarray(o, o + s));
    }
}

// Helper functions for reading from a Uint8Array at a given offset
function ttUSHORT(p, offset = 0) {
    return (p[offset] << 8) + p[offset + 1];
}

function ttSHORT(p, offset = 0) {
    const val = (p[offset] << 8) + p[offset + 1];
    return val > 32767 ? val - 65536 : val;
}

function ttULONG(p, offset = 0) {
    // Check for potential overflow before bit-shifting
    const b0 = p[offset];
    const b1 = p[offset + 1];
    const b2 = p[offset + 2];
    const b3 = p[offset + 3];
    return (b0 * 16777216) + (b1 << 16) + (b2 << 8) + b3;
}

function ttLONG(p, offset = 0) {
    const val = ttULONG(p, offset);
    return val > 2147483647 ? val - 4294967296 : val;
}

function stbtt_tag4(p, c0, c1, c2, c3, offset = 0) {
    return p[offset] === c0 && p[offset + 1] === c1 && p[offset + 2] === c2 && p[offset + 3] === c3;
}

function stbtt_tag(p, str, offset = 0) {
    return p[offset]     === str.charCodeAt(0) &&
           p[offset + 1] === str.charCodeAt(1) &&
           p[offset + 2] === str.charCodeAt(2) &&
           p[offset + 3] === str.charCodeAt(3);
}

function find_table(data, fontstart, tag) {
    const num_tables = ttUSHORT(data, fontstart + 4);
    const tabledir = fontstart + 12;
    for (let i = 0; i < num_tables; ++i) {
        const loc = tabledir + 16 * i;
        if (stbtt_tag(data, tag, loc)) {
            return ttULONG(data, loc + 8);
        }
    }
    return 0;
}

export class FontInfo {
    constructor() {
        this.data = null;
        this.fontstart = 0;
        this.numGlyphs = 0;
        this.loca = 0;
        this.head = 0;
        this.glyf = 0;
        this.hhea = 0;
        this.hmtx = 0;
        this.kern = 0;
        this.gpos = 0;
        this.svg = 0;
        this.index_map = 0;
        this.indexToLocFormat = 0;

        // CFF stuff - not implemented yet
        this.cff = null;
        this.charstrings = null;
        this.gsubrs = null;
        this.subrs = null;
        this.fontdicts = null;
        this.fdselect = null;
    }
}

function isfont(font) {
   // check the version number
   if (stbtt_tag4(font, '1'.charCodeAt(0), 0, 0, 0)) return 1; // TrueType 1
   if (stbtt_tag(font, "typ1")) return 1; // TrueType with type 1 font -- we don't support this!
   if (stbtt_tag(font, "OTTO")) return 1; // OpenType with CFF
   if (stbtt_tag4(font, 0, 1, 0, 0)) return 1; // OpenType 1.0
   if (stbtt_tag(font, "true")) return 1; // Apple specification for TrueType fonts
   return 0;
}

export function GetFontOffsetForIndex(font_collection, index) {
   // if it's just a font, there's only one valid index
   if (isfont(font_collection))
      return index === 0 ? 0 : -1;

   // check if it's a TTC
   if (stbtt_tag(font_collection, "ttcf")) {
      // version 1?
      if (ttULONG(font_collection, 4) === 0x00010000 || ttULONG(font_collection, 4) === 0x00020000) {
         const n = ttLONG(font_collection, 8);
         if (index >= n)
            return -1;
         return ttULONG(font_collection, 12 + index * 4);
      }
   }
   return -1;
}

export function InitFont(info, data, fontstart = 0) {
   info.data = data;
   info.fontstart = fontstart;
   info.cff = null; // not implemented

   const cmap = find_table(data, fontstart, "cmap");
   info.loca = find_table(data, fontstart, "loca");
   info.head = find_table(data, fontstart, "head");
   info.glyf = find_table(data, fontstart, "glyf");
   info.hhea = find_table(data, fontstart, "hhea");
   info.hmtx = find_table(data, fontstart, "hmtx");
   info.kern = find_table(data, fontstart, "kern");
   info.gpos = find_table(data, fontstart, "GPOS");

   if (!cmap || !info.head || !info.hhea || !info.hmtx) {
      return 0;
   }
   if (info.glyf) {
      if (!info.loca) return 0;
   } else {
       // CFF not supported yet
       return 0;
   }

   const t = find_table(data, fontstart, "maxp");
   if (t) {
      info.numGlyphs = ttUSHORT(data, t + 4);
   } else {
      info.numGlyphs = 0xffff;
   }

   info.svg = -1; // svg not supported yet

   // find a cmap encoding table we understand
   const numTables = ttUSHORT(data, cmap + 2);
   info.index_map = 0;
   for (let i = 0; i < numTables; i++) {
      const encoding_record = cmap + 4 + 8 * i;
      const platformID = ttUSHORT(data, encoding_record);
      const encodingID = ttUSHORT(data, encoding_record + 2);

      if (platformID === 3 && (encodingID === 1 || encodingID === 10)) { // Microsoft, Unicode BMP/Full
          info.index_map = cmap + ttULONG(data, encoding_record + 4);
          break;
      } else if (platformID === 0) { // Unicode
          info.index_map = cmap + ttULONG(data, encoding_record + 4);
          break;
      }
   }

   if (info.index_map === 0) return 0;

   info.indexToLocFormat = ttUSHORT(data, info.head + 50);
   return 1;
}

export function FindGlyphIndex(info, unicode_codepoint) {
    const data = info.data;
    const index_map = info.index_map;

    const format = ttUSHORT(data, index_map);

    if (format === 4) {
        const segcount = ttUSHORT(data, index_map + 6) >> 1;
        let searchRange = ttUSHORT(data, index_map + 8) >> 1;
        let entrySelector = ttUSHORT(data, index_map + 10);
        const rangeShift = ttUSHORT(data, index_map + 12) >> 1;

        const endCount = index_map + 14;
        let search = endCount;

        if (unicode_codepoint > 0xffff) return 0;

        if (unicode_codepoint >= ttUSHORT(data, search + rangeShift * 2)) {
            search += rangeShift * 2;
        }

        search -= 2;
        while (entrySelector > 0) {
            searchRange >>= 1;
            const end = ttUSHORT(data, search + searchRange * 2);
            if (unicode_codepoint > end) {
                search += searchRange * 2;
            }
            entrySelector--;
        }
        search += 2;

        const item = (search - endCount) >> 1;

        const start = ttUSHORT(data, index_map + 14 + segcount * 2 + 2 + 2 * item);
        const last = ttUSHORT(data, endCount + 2 * item);

        if (unicode_codepoint < start || unicode_codepoint > last) {
            return 0;
        }

        const idDelta = ttSHORT(data, index_map + 14 + segcount * 4 + 2 + 2 * item);
        const idRangeOffset = ttUSHORT(data, index_map + 14 + segcount * 6 + 2 + 2 * item);

        if (idRangeOffset === 0) {
            return (unicode_codepoint + idDelta) & 0xffff;
        }

        const glyphIndexAddress = idRangeOffset + 2 * (unicode_codepoint - start) + (index_map + 14 + segcount * 6 + 2 + 2 * item);
        const glyphIndex = ttUSHORT(data, glyphIndexAddress);

        return glyphIndex === 0 ? 0 : (glyphIndex + idDelta) & 0xffff;

    } else if (format === 12) {
        const ngroups = ttULONG(data, index_map + 12);
        let low = 0;
        let high = ngroups;

        while (low < high) {
            const mid = low + ((high - low) >> 1);
            const start_char = ttULONG(data, index_map + 16 + mid * 12);
            const end_char = ttULONG(data, index_map + 16 + mid * 12 + 4);

            if (unicode_codepoint < start_char) {
                high = mid;
            } else if (unicode_codepoint > end_char) {
                low = mid + 1;
            } else {
                const start_glyph = ttULONG(data, index_map + 16 + mid * 12 + 8);
                return start_glyph + unicode_codepoint - start_char;
            }
        }
        return 0;
    }
    // Other formats not implemented
    console.warn(`Unsupported cmap format: ${format}`);
    return 0;
}

function GetGlyfOffset(info, glyph_index) {
    if (glyph_index >= info.numGlyphs) return -1;
    if (info.indexToLocFormat >= 2) return -1;

    let g1, g2;
    if (info.indexToLocFormat === 0) {
        g1 = info.glyf + ttUSHORT(info.data, info.loca + glyph_index * 2) * 2;
        g2 = info.glyf + ttUSHORT(info.data, info.loca + glyph_index * 2 + 2) * 2;
    } else {
        g1 = info.glyf + ttULONG(info.data, info.loca + glyph_index * 4);
        g2 = info.glyf + ttULONG(info.data, info.loca + glyph_index * 4 + 4);
    }

    return g1 === g2 ? -1 : g1;
}

export const STBTT_vmove = 1;
export const STBTT_vline = 2;
export const STBTT_vcurve = 3;
export const STBTT_vcubic = 4;

export class Vertex {
    constructor(type, x, y, cx, cy, cx1 = 0, cy1 = 0) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.cx = cx;
        this.cy = cy;
        this.cx1 = cx1;
        this.cy1 = cy1;
    }
}

function stbtt__close_shape(vertices, num_vertices, was_off, start_off, sx, sy, scx, scy, cx, cy) {
   if (start_off) {
      if (was_off) {
         vertices[num_vertices++] = new Vertex(STBTT_vcurve, (cx+scx)>>1, (cy+scy)>>1, cx,cy);
      }
      vertices[num_vertices++] = new Vertex(STBTT_vcurve, sx,sy,scx,scy);
   } else {
      if (was_off) {
         vertices[num_vertices++] = new Vertex(STBTT_vcurve,sx,sy,cx,cy);
      } else {
         vertices[num_vertices++] = new Vertex(STBTT_vline,sx,sy,0,0);
      }
   }
   return num_vertices;
}

export function GetGlyphShape(info, glyph_index) {
    const data = info.data;
    let vertices = [];
    let num_vertices = 0;

    const g = GetGlyfOffset(info, glyph_index);
    if (g < 0) return null;

    const numberOfContours = ttSHORT(data, g);

    if (numberOfContours > 0) {
        let flags = 0;
        let flagcount = 0;
        const endPtsOfContours = g + 10;
        const ins = ttUSHORT(data, endPtsOfContours + numberOfContours * 2);
        const points_offset = endPtsOfContours + numberOfContours * 2 + 2 + ins;
        const points = new Buf(data, points_offset);

        const n = 1 + ttUSHORT(data, endPtsOfContours + numberOfContours * 2 - 2);

        const m = n + 2 * numberOfContours; // a loose bound on how many vertices we might need
        const temp_points = Array.from({ length: n }, () => ({ x: 0, y: 0, type: 0 }));

        let next_move = 0;
        let was_off = 0;
        let start_off = 0;
        let x = 0, y = 0, cx = 0, cy = 0, sx = 0, sy = 0, scx = 0, scy = 0;

        // first load flags
        for (let i = 0; i < n; i++) {
            if (flagcount === 0) {
                flags = points.get8();
                if (flags & 8) {
                    flagcount = points.get8();
                }
            } else {
                flagcount--;
            }
            temp_points[i].type = flags;
        }

        // now load x coordinates
        let x_val = 0;
        for (let i = 0; i < n; i++) {
            flags = temp_points[i].type;
            if (flags & 2) {
                const dx = points.get8();
                x_val += (flags & 16) ? dx : -dx;
            } else {
                if (!(flags & 16)) {
                    x_val += ttSHORT(points.data, points.cursor);
                    points.skip(2);
                }
            }
            temp_points[i].x = x_val;
        }

        // now load y coordinates
        let y_val = 0;
        for (let i = 0; i < n; i++) {
            flags = temp_points[i].type;
            if (flags & 4) {
                const dy = points.get8();
                y_val += (flags & 32) ? dy : -dy;
            } else {
                if (!(flags & 32)) {
                    y_val += ttSHORT(points.data, points.cursor);
                    points.skip(2);
                }
            }
            temp_points[i].y = y_val;
        }

        // now convert them to our format
        let j = 0;
        for (let i = 0; i < n; i++) {
            flags = temp_points[i].type;
            x = temp_points[i].x;
            y = temp_points[i].y;

            if (next_move === i) {
                if (i !== 0) {
                    num_vertices = stbtt__close_shape(vertices, num_vertices, was_off, start_off, sx, sy, scx, scy, cx, cy);
                }

                start_off = !(flags & 1);
                if (start_off) {
                    scx = x;
                    scy = y;
                    if (!(temp_points[i + 1].type & 1)) {
                        sx = (x + temp_points[i + 1].x) >> 1;
                        sy = (y + temp_points[i + 1].y) >> 1;
                    } else {
                        sx = temp_points[i + 1].x;
                        sy = temp_points[i + 1].y;
                        i++;
                    }
                } else {
                    sx = x;
                    sy = y;
                }
                vertices[num_vertices++] = new Vertex(STBTT_vmove, sx, sy, 0, 0);
                was_off = 0;
                next_move = 1 + ttUSHORT(data, endPtsOfContours + j * 2);
                j++;
            } else {
                if (!(flags & 1)) {
                    if (was_off) {
                        vertices[num_vertices++] = new Vertex(STBTT_vcurve, (cx + x) >> 1, (cy + y) >> 1, cx, cy);
                    }
                    cx = x;
                    cy = y;
                    was_off = 1;
                } else {
                    if (was_off) {
                        vertices[num_vertices++] = new Vertex(STBTT_vcurve, x, y, cx, cy);
                    } else {
                        vertices[num_vertices++] = new Vertex(STBTT_vline, x, y, 0, 0);
                    }
                    was_off = 0;
                }
            }
        }
        num_vertices = stbtt__close_shape(vertices, num_vertices, was_off, start_off, sx, sy, scx, scy, cx, cy);
    } else if (numberOfContours < 0) {
        // Compound shapes
        let more = 1;
        const comp = new Buf(data, g + 10);
        while(more) {
            let flags, gidx;
            flags = comp.get16();
            gidx = comp.get16();

            let mtx = [1, 0, 0, 1, 0, 0];

            if (flags & 2) { // XY values
                if (flags & 1) { // shorts
                    mtx[4] = ttSHORT(comp.data, comp.cursor); comp.skip(2);
                    mtx[5] = ttSHORT(comp.data, comp.cursor); comp.skip(2);
                } else {
                    mtx[4] = data[comp.cursor]; comp.skip(1); // signed char
                    mtx[5] = data[comp.cursor]; comp.skip(1);
                }
            }

            if (flags & (1 << 3)) { // WE_HAVE_A_SCALE
                mtx[0] = mtx[3] = ttSHORT(comp.data, comp.cursor) / 16384.0; comp.skip(2);
            } else if (flags & (1 << 6)) { // WE_HAVE_AN_X_AND_YSCALE
                mtx[0] = ttSHORT(comp.data, comp.cursor) / 16384.0; comp.skip(2);
                mtx[3] = ttSHORT(comp.data, comp.cursor) / 16384.0; comp.skip(2);
            } else if (flags & (1 << 7)) { // WE_HAVE_A_TWO_BY_TWO
                mtx[0] = ttSHORT(comp.data, comp.cursor) / 16384.0; comp.skip(2);
                mtx[1] = ttSHORT(comp.data, comp.cursor) / 16384.0; comp.skip(2);
                mtx[2] = ttSHORT(comp.data, comp.cursor) / 16384.0; comp.skip(2);
                mtx[3] = ttSHORT(comp.data, comp.cursor) / 16384.0; comp.skip(2);
            }

            const comp_verts = GetGlyphShape(info, gidx);
            if (comp_verts && comp_verts.length > 0) {
                for(let i=0; i<comp_verts.length; ++i) {
                    const v = comp_verts[i];
                    let x, y;
                    x = v.x; y = v.y;
                    v.x = mtx[0] * x + mtx[2] * y + mtx[4];
                    v.y = mtx[1] * x + mtx[3] * y + mtx[5];
                    x = v.cx; y = v.cy;
                    v.cx = mtx[0] * x + mtx[2] * y + mtx[4];
                    v.cy = mtx[1] * x + mtx[3] * y + mtx[5];
                }
                vertices.push(...comp_verts);
            }
            more = flags & (1 << 5);
        }
    }

    return vertices;
}

export function GetGlyphHMetrics(info, glyph_index) {
    const numOfLongHorMetrics = ttUSHORT(info.data, info.hhea + 34);
    let advanceWidth, leftSideBearing;
    if (glyph_index < numOfLongHorMetrics) {
        advanceWidth = ttSHORT(info.data, info.hmtx + 4 * glyph_index);
        leftSideBearing = ttSHORT(info.data, info.hmtx + 4 * glyph_index + 2);
    } else {
        advanceWidth = ttSHORT(info.data, info.hmtx + 4 * (numOfLongHorMetrics - 1));
        leftSideBearing = ttSHORT(info.data, info.hmtx + 4 * numOfLongHorMetrics + 2 * (glyph_index - numOfLongHorMetrics));
    }
    return { advanceWidth, leftSideBearing };
}

export function GetCodepointHMetrics(info, codepoint) {
    const glyph_index = FindGlyphIndex(info, codepoint);
    return GetGlyphHMetrics(info, glyph_index);
}

function GetGlyphKernInfoAdvance(info, glyph1, glyph2) {
    const data = info.data;
    if (!info.kern) return 0;

    const kern_table = data.subarray(info.kern);
    if (ttUSHORT(kern_table, 2) < 1) return 0;
    if (ttUSHORT(kern_table, 8) !== 1) return 0;

    let l = 0;
    let r = ttUSHORT(kern_table, 10) - 1;
    const needle = (glyph1 << 16) | glyph2;

    while (l <= r) {
        const m = (l + r) >> 1;
        const straw = ttULONG(kern_table, 18 + m * 6);
        if (needle < straw) {
            r = m - 1;
        } else if (needle > straw) {
            l = m + 1;
        } else {
            return ttSHORT(kern_table, 22 + m * 6);
        }
    }
    return 0;
}

export function GetCodepointKernAdvance(info, ch1, ch2) {
    if (!info.kern) return 0; // GPOS not supported yet
    const glyph1 = FindGlyphIndex(info, ch1);
    const glyph2 = FindGlyphIndex(info, ch2);
    return GetGlyphKernInfoAdvance(info, glyph1, glyph2);
}

export function ScaleForPixelHeight(info, pixels) {
    const fheight = ttSHORT(info.data, info.hhea + 4) - ttSHORT(info.data, info.hhea + 6);
    return pixels / fheight;
}

export function GetFontVMetrics(info) {
    const ascent = ttSHORT(info.data, info.hhea + 4);
    const descent = ttSHORT(info.data, info.hhea + 6);
    const lineGap = ttSHORT(info.data, info.hhea + 8);
    return { ascent, descent, lineGap };
}
