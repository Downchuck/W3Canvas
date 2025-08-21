# Undone tasks

## Radial Gradient

The implementation of `createRadialGradient` is not fully functional. The current implementation fails the tests in `tests/canvas_radial_gradient.test.js`.

The main issue seems to be with the calculation of the `t` parameter in the `_getColorFromRadialGradientAtPoint` function in `src/core/canvas/CanvasRenderingContext2D.js`. The formula is complex and I have been unable to get it right.

### `fillRect` and `strokeRect`

The `fillRect` and `strokeRect` methods were refactored to use the path system, but this was incorrect according to the spec. They should not be affected by the current path. I have reverted this change, but the `fillRect` method is now very slow, as it iterates over each pixel. A better solution would be to implement a scanline algorithm for filling a transformed quadrilateral.

## `fillText` and `strokeText`

The `fillText` and `strokeText` methods are not working correctly. They do not draw anything, even without any transformations applied. This was confirmed by adding tests for `fillText` and `strokeText` with an identity matrix, which failed. The issue seems to be in the `fillText` and `strokeText` implementations in `src/core/canvas/CanvasRenderingContext2D.js`.

The transformation of text is also not implemented correctly. The advance of the text position does not take the transformation matrix into account. This is a separate issue from the fact that the functions do not draw anything at all.
