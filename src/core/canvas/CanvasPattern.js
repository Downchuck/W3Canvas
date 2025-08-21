export class CanvasPattern {
  constructor(image, repetition) {
    if (!image || typeof image.width !== 'number' || typeof image.height !== 'number' || !image.data) {
        throw new TypeError('Failed to execute \'createPattern\' on \'CanvasRenderingContext2D\': The provided source is not a valid CanvasImageSource.');
    }

    const validRepetitions = ['repeat', 'repeat-x', 'repeat-y', 'no-repeat'];
    if (validRepetitions.indexOf(repetition) === -1) {
        // The spec says to treat null/empty string as 'repeat', and invalid values also as 'repeat'.
        repetition = 'repeat';
    }

    this.image = image;
    this.repetition = repetition;
  }

  // The setTransform method would be implemented here in the future.
  // setTransform(matrix) { ... }
}
