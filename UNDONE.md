# Work in Progress

*   **Implement CSS Box Model and SVG DOM:**
    *   **CSS Box Model:**
        *   Enabled and fixed layout tests.
        *   Integrated the box model into the layout, accounting for padding.
        *   Implemented `text-align`.
        *   Implemented basic painting of background, border, and text.
    *   **SVG DOM:**
        *   Expanded SVG path parser to handle `H`, `h`, `V`, `v`, `C`, and `c` commands.
        *   **DONE:** Optimized `fill()` for Beziers and arcs, and refactored the scanline filler to use an Active Edge Table, fixing the memory leak and significantly improving performance.
        *   **TODO:** There is a regression in `stroke()` for 1px-wide Bézier curves. The start pixel of the curve is not drawn. This is a subtle bug in the legacy stroking path that needs further investigation.

*   **Font Rendering:**
    *   **TODO:** Implement the `@font-face` rule to allow loading of custom fonts.
