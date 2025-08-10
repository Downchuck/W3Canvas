function validCoordinates(matrix, row, col)
{
    return (row >= 0 && row < matrix.length && col >= 0 && col < matrix[row].length);
}

function floodFill(matrix, row, col)
{
    const fillStack = [];
    fillStack.push([row, col]);

    while(fillStack.length > 0)
    {
        const [row, col] = fillStack.pop();

        if (!validCoordinates(matrix, row, col))
            continue;

        if (matrix[row][col] == 1)
            continue;

        matrix[row][col] = 1;

        fillStack.push([row + 1, col]);
        fillStack.push([row - 1, col]);
        fillStack.push([row, col + 1]);
        fillStack.push([row, col - 1]);
    }
}

export function scanlineFill(ctx, x, y, w, h) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  const matrix = [];
  for (let i = 0; i < ctx.canvas.height; i++) {
    matrix.push(new Array(ctx.canvas.width).fill(0));
  }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (r === 0 && g === 0 && b === 0 && a === 255) {
      const pixelIndex = i / 4;
      const row = Math.floor(pixelIndex / ctx.canvas.width);
      const col = pixelIndex % ctx.canvas.width;
      matrix[row][col] = 1;
    }
  }

  floodFill(matrix, y, x);

  for (let row = 0; row < ctx.canvas.height; row++) {
    for (let col = 0; col < ctx.canvas.width; col++) {
      if (matrix[row][col] === 1) {
        const pixelIndex = (row * ctx.canvas.width + col) * 4;
        data[pixelIndex] = 255;
        data[pixelIndex + 1] = 0;
        data[pixelIndex + 2] = 0;
        data[pixelIndex + 3] = 255;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}
