export class CanvasPattern {
  constructor(image, repetition) {
    if (!image || typeof image.width !== 'number' || typeof image.height !== 'number' || !image.data) {
        throw new TypeError('Failed to execute \'createPattern\' on \'CanvasRenderingContext2D\': The provided source is not a valid CanvasImageSource.');
    }

    // The spec says to treat null/empty string as 'repeat', and invalid values also as 'repeat'.
    if (repetition === null || typeof repetition === 'undefined') {
      repetition = 'repeat';
    }

    const validRepetitions = ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'];
    if (validRepetitions.indexOf(repetition) === -1) {
        repetition = 'repeat';
    }

    this.image = image;
    this.repetition = repetition;
  }

  // The setTransform method would be implemented here in the future.
  // setTransform(matrix) { ... }
}
