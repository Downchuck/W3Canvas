# Work in Progress

*   **Implement CSS Box Model and SVG DOM:**
    *   **CSS Box Model:**
        *   Enabled and fixed layout tests.
        *   Integrated the box model into the layout, accounting for padding.
        *   Implemented `text-align`.
        *   Implemented basic painting of background, border, and text.
    *   **SVG DOM:**
        *   Expanded SVG path parser to handle `H`, `h`, `V`, `v`, `C`, and `c` commands.
        *   **IN PROGRESS:** Fixing a memory leak in the Bezier curve rendering. The current implementation is inefficient and causes an out-of-memory error when rendering complex paths.

*   **Font Rendering:**
    *   **TODO:** Implement the `@font-face` rule to allow loading of custom fonts.
