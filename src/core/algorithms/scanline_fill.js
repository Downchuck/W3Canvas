export function scanlineFill(ctx, x, y, w, h) {
  const color = ctx._parseColor(ctx.fillStyle);
  if (!color) return;

  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const { data, width: canvasWidth } = imageData;

  const xStart = Math.max(0, x);
  const yStart = Math.max(0, y);
  const xEnd = Math.min(ctx.canvas.width, x + w);
  const yEnd = Math.min(ctx.canvas.height, y + h);

  for (let j = yStart; j < yEnd; j++) {
    for (let i = xStart; i < xEnd; i++) {
      const index = (j * canvasWidth + i) * 4;
      data[index] = color.r;
      data[index + 1] = color.g;
      data[index + 2] = color.b;
      data[index + 3] = color.a;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
