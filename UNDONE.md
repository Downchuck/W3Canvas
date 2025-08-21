# Undone tasks

## Radial Gradient

The implementation of `createRadialGradient` is not fully functional. The current implementation fails the tests in `tests/canvas_radial_gradient.test.js`.

The main issue seems to be with the calculation of the `t` parameter in the `_getColorFromRadialGradientAtPoint` function in `src/core/canvas/CanvasRenderingContext2D.js`. The formula is complex and I have been unable to get it right.

### `fillRect` and `strokeRect`

The `fillRect` and `strokeRect` methods were refactored to use the path system, but this was incorrect according to the spec. They should not be affected by the current path. I have reverted this change, but the `fillRect` method is now very slow, as it iterates over each pixel. A better solution would be to implement a scanline algorithm for filling a transformed quadrilateral.
