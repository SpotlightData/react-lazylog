export class Canvas {
  constructor(canvas, settings) {
    this.canvas = canvas;
    this.settings = settings;
  }

  static empty() {
    return new Canvas(undefined, undefined);
  }

  static from(canvas, settings) {
    return new Canvas(canvas, settings);
  }

  reset(ctx) {
    const { width, height } = this.canvas;
    ctx.fillStyle = this.settings.backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  drawEntries = ({ entries, width, height, padding }) => {
    if (!this.canvas) {
      return;
    }
    const ctx = this.canvas.getContext('2d');
    this.reset(ctx);
    entries.map(entry => {
      ctx.fillStyle = entry.color;
      const left = Math.min(width, Math.max(0, entry.left - padding));
      const top = Math.min(height, Math.max(0, entry.top - padding));
      ctx.fillRect(left, top, entry.width + padding, entry.height + padding);
    });
  };
}
