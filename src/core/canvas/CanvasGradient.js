export class CanvasGradient {
  constructor(x0, y0, x1, y1) {
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
    this.colorStops = [];
  }

  addColorStop(offset, color) {
    if (offset < 0 || offset > 1) {
      throw new Error("Offset must be between 0 and 1");
    }

    const newStop = { offset, color };
    const index = this.colorStops.findIndex(stop => stop.offset > offset);
    if (index === -1) {
      this.colorStops.push(newStop);
    } else {
      this.colorStops.splice(index, 0, newStop);
    }
  }
}
