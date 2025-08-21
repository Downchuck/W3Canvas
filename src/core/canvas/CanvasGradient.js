export class CanvasGradient {
  constructor(props) {
    this.type = props.type;
    this.x0 = props.x0;
    this.y0 = props.y0;
    this.r0 = props.r0;
    this.x1 = props.x1;
    this.y1 = props.y1;
    this.r1 = props.r1;
    this.startAngle = props.startAngle; // for conic
    this.x = props.x; // for conic
    this.y = props.y; // for conic
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
