# Undone tasks

## Radial Gradient

The implementation of `createRadialGradient` is not fully functional. The current implementation fails the tests in `tests/canvas_radial_gradient.test.js`.

The main issue seems to be with the calculation of the `t` parameter in the `_getColorFromRadialGradientAtPoint` function in `src/core/canvas/CanvasRenderingContext2D.js`. The formula is complex and I have been unable to get it right.

### `fillRect` and `strokeRect`

The `fillRect` method uses the scanline fill algorithm. However, there is a known regression where it fails when a translation is applied to the context. `strokeRect` appears to work correctly.
