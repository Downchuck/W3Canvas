# FontFace API Implementation Spike

This document outlines a plan for implementing the `FontFace` API in our custom rendering engine. This is a spike to explore the feature and prepare for a full implementation in the future.

## 1. Overview of the FontFace API

The `FontFace` API provides a way to load fonts dynamically and use them in CSS. It allows us to load fonts from external resources (URLs) or from local buffers (`ArrayBuffer`). This is a powerful feature that gives us more control over font loading than the traditional `@font-face` rule in CSS.

The main interfaces of the API are:

- **`FontFace`**: Represents a single font face. It's created with a constructor that takes the font family name, the source of the font (a URL or an `ArrayBuffer`), and an optional set of descriptors (e.g., `weight`, `style`).
- **`FontFaceSet`**: A set-like object that manages all the font faces for a document. It's accessible through `document.fonts`. It allows us to add, remove, and check the status of font faces.

## 2. Implementation Plan

Our implementation will focus on the core features of the `FontFace` API, allowing us to load a font and use it to render text on our canvas.

### 2.1. Parsing `@font-face` rules

We will need to extend our CSS parser to handle `@font-face` rules. The parser should be able to extract the `font-family`, `src`, and other descriptors from the rule.

Example of a `@font-face` rule:

```css
@font-face {
  font-family: 'MyCustomFont';
  src: url('path/to/font.ttf');
  font-weight: normal;
  font-style: normal;
}
```

### 2.2. The `FontFace` object

We will create a `FontFace` class in our codebase to represent a single font face. This class will store the font's properties, such as its family, source, weight, and style. It will also have a `load()` method that initiates the loading of the font.

The `FontFace` constructor will have the following signature:

```javascript
new FontFace(family, source, descriptors);
```

- `family`: A string with the font family name.
- `source`: A string with the URL to the font file, or an `ArrayBuffer` with the font data.
- `descriptors`: An optional object with font descriptors like `weight`, `style`, etc.

The `load()` method will return a `Promise` that resolves when the font is loaded and ready to be used.

### 2.3. The `FontFaceSet` object

We will implement a `FontFaceSet` class that will be available on our `document` object (as `document.fonts`). This class will manage a collection of `FontFace` objects.

The `FontFaceSet` object will have the following methods:

- `add(fontFace)`: Adds a `FontFace` object to the set.
- `delete(fontFace)`: Removes a `FontFace` object from the set.
- `check(font)`: Checks if a font is loaded and available.
- `ready`: A `Promise` that resolves when all fonts in the set are loaded.

### 2.4. Font Loading

When a `FontFace` is created with a URL, we will need to fetch the font file from the network. We'll use our existing networking layer to download the font file as an `ArrayBuffer`.

Once the font data is downloaded, we will need to parse it. We will need a font parsing library for this. There are several open-source font parsing libraries available in JavaScript that we can use, such as `opentype.js`. We will need to investigate and choose a suitable library.

### 2.5. Integration with the Rendering Engine

Once a font is loaded, we need to make it available to our rendering engine. When rendering text, the engine will need to look up the font in the `FontFaceSet`. If the font is found and loaded, the engine will use it to render the text on the canvas.

This will require changes to our text rendering pipeline. Currently, we rely on the system's fonts. With the `FontFace` API, we will need to use the loaded font data to render the glyphs. The font parsing library we choose should provide us with the necessary information to do this, such as the glyph shapes and metrics.

### 2.6. Asynchronous Loading

Font loading is an asynchronous operation. We need to handle this correctly in our rendering engine. When a font is not yet loaded, we should use a fallback font to render the text. Once the font is loaded, we should re-render the text with the new font.

The `FontFace.load()` method and the `FontFaceSet.ready` promise will be crucial for managing the asynchronous nature of font loading.

## 3. Test Plan

We will use the `Roboto-Regular.ttf` font for testing our implementation. The font is located in the `/fonts` directory of this repository.

Our test plan will include the following steps:

1.  **Load a font using `@font-face`**: We will create a CSS stylesheet with a `@font-face` rule that loads the `Roboto-Regular.ttf` font. We will then apply this font to a `<span>` element and verify that the text is rendered with the correct font.
2.  **Load a font using the `FontFace` constructor**: We will create a `FontFace` object programmatically, load the `Roboto-Regular.ttf` font, and add it to `document.fonts`. We will then apply this font to a `<span>` element and verify that the text is rendered with the correct font.
3.  **Handle font loading states**: We will test the different font loading states (`unloaded`, `loading`, `loaded`, `error`). We will verify that our rendering engine handles these states correctly, for example, by using a fallback font while the font is loading.
4.  **Test with different font weights and styles**: We will extend our tests to use different weights and styles of the Roboto font. We will need to add more font files to our `/fonts` directory for this.

## 4. Public Domain Font

For testing purposes, we have included the `Roboto-Regular.ttf` font in this repository. This font is licensed under the Apache License, Version 2.0, which allows for free use and distribution. The license can be found in the `LICENSE` file in the `roboto.zip` file we downloaded. We should include the license file in our repository as well.
