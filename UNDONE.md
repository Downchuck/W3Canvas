# Work in Progress

*   **Implement CSS Box Model and SVG DOM:** Continue filling out the implementation of the CSS box model and the SVG implementation.

# Future Work

The current font rendering system is hard-coded to use a single font (Arial) defined in a custom SVG format. This has some limitations:
*   **Limited Font Support:** The system can only render the single, hard-coded Arial font.
*   **Non-Standard Format:** The font is defined in a non-standard SVG format, making it difficult to use other fonts.
*   **Inefficiency:** The JavaScript-based rendering is likely to be slow.

To support other fonts, we should consider one of the following approaches:
*   **Integrate a library like Cufon:** Cufon was a popular font-rendering library from the same era that can handle more standard font formats like TrueType (TTF) and Type 1 (PFB).
*   **Find a more modern approach:** Explore more modern techniques for font rendering in the browser, such as using `@font-face` with web fonts (e.g., WOFF, WOFF2), which is the standard today.
