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
        *   **DONE:** Fixed a regression in `stroke()` for 1px-wide Bézier curves where the start pixel was not being drawn. This involved removing a legacy stroking path and correcting the start cap geometry in the modern stroking algorithm.

*   **Font Rendering:**
    *   **IN PROGRESS:** Implement the `@font-face` rule to allow loading of custom fonts.
        *   **DONE:** Created `FontFace` and `FontFaceSet` objects.
        *   **DONE:** Implemented a basic parser for `@font-face` rules that handles `file:///` URIs.
        *   **DONE:** Integrated with the rendering engine to use loaded fonts for text rendering.
        *   **TODO:** Expand parser and loading mechanism to support remote URLs and other font formats.
