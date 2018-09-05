import throttle from 'lodash.throttle';

import { Canvas } from './Canvas';
import { resizeEntries, longestLine } from './utils';

const inBounds = (min, max, value) => Math.max(min, Math.min(max, value));

// Current issues
/*
  Janky scroll, - Hopefully fixed
  Scroll not hitting boundaries 
*/

export class Core {
  static create(settings) {
    return new Core(settings);
  }

  constructor(settings) {
    this.update(settings);
  }

  update({
    containerSizes,
    getContainer,
    emitter,
    canvasSettings,
    markers,
    throttle: throttleTime,
    width,
    height,
  }) {
    if (this.emitter) {
      this.emitter.off('scroll', this.synchronise);
    }
    this.containerSizes = containerSizes;
    this.width = width;
    this.height = height;
    this.emitter = emitter;
    this.getContainer = getContainer;
    this.canvasSettings = canvasSettings;
    this.markers = markers;
    // Sync
    this.synchronise = throttle(this.sync, throttleTime);
    this.emitter.on('scroll', this.synchronise);
    this.isMoving = false;
    this.canScroll = true;
  }

  setScroll = node => {
    this.scroll = node;
  };

  setCanvas = node => {
    this.canvas = Canvas.from(node, this.canvasSettings);
  };

  waitForContainer(getContainer = this.getContainer) {
    return new Promise((res, rej) => {
      const aux = () => {
        const container = getContainer();
        if (container === null || container === undefined) {
          setTimeout(() => {
            aux();
          }, 100);
        } else {
          res(container);
        }
      };
      aux();
    });
  }

  async scrollHeight(container) {
    const element = container || (await this.waitForContainer());
    const heightRatio = this.containerSizes.height / element.scrollHeight;
    return Math.min(heightRatio * this.height, this.containerSizes.height);
  }

  sync = ({ scrollHeight, scrollTop }) => {
    if (!this.scroll || this.isMoving) {
      return;
    }
    const ratioY = this.height / scrollHeight;
    const top = ratioY * scrollTop;
    this.scrollTo(top);
  };

  stop = () => {
    this.isMoving = false;
  };

  async scrollTo(px) {
    if (!this.scroll) {
      return;
    }
    const scrollHeight = await this.scrollHeight();
    const top = inBounds(0, this.height - scrollHeight, px);
    this.scroll.style.top = `${top}px`;
  }

  onMouseUp = e => {
    this.stop();
  };

  onMouseDown = e => {
    this.isMoving = true;
    this.move(e);
  };

  onWheel = e => {
    e.preventDefault();
    if (!this.canScroll) {
      return;
    }
    this.isMoving = true;
    this.canScroll = false;
    const rect = this.scroll.getBoundingClientRect();
    this.updateScroll(rect.top + e.deltaY / 2).then(() => {
      this.isMoving = false;
      this.canScroll = true;
    });
  };

  move = e => {
    if (!this.isMoving) {
      return;
    }
    let event;
    if (e.type.match(/touch/)) {
      if (e.touches.length > 1) {
        return;
      }
      event = e.touches[0];
    } else {
      event = e;
    }
    this.updateScroll(event.clientY);
  };

  updateContainerScroll = newPos => {
    this.emitter.emit('update-scroll', newPos);
  };

  async updateScroll(change) {
    const root = this.scroll.parentNode.getBoundingClientRect();
    const container = await this.waitForContainer();
    const scrollHeight = await this.scrollHeight(container);
    const newPos = inBounds(0, this.height, change - root.y - scrollHeight / 2);
    const ratioY = this.height / container.scrollHeight;
    const containerScroll = Math.max(1, newPos / ratioY);
    this.scrollTo(newPos);
    this.updateContainerScroll(containerScroll);
  }

  async calculateSizes({ lines, rowHeight, fontSize }) {
    const { width, height } = this;
    const { scrollWidth, scrollHeight } = await this.waitForContainer();

    const ratioY = height / scrollHeight;
    const lineHeight = ratioY * rowHeight;
    const charWidth = width / longestLine(lines);
    return { entries: resizeEntries(lines, lineHeight, charWidth), width, height, padding: 1 };
  }

  async draw() {
    await this.waitForContainer(() => this.canvas);
    this.calculateSizes(this.markers).then(this.canvas.drawEntries);
  }
}
