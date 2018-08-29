import { resizeEntries } from './utils';

const inBounds = (min, max, value) => Math.max(min, Math.min(max, value));

export class Core {
  constructor({ selector, container, width, height, updateContainerScroll, scrollHeight }) {
    this.containerData = {
      selector,
      root: container,
    };
    this.settings = { width, height, scrollHeight: this.getScrollHeight(height) };
    this.isMoving = false;
    this.updateContainerScroll = updateContainerScroll;
  }

  static from(settings) {
    return new Core(settings);
  }

  setScroll = node => {
    this.scrollElement = node;
  };

  getScrollHeight(height) {
    const container = this.getContainer();
    const containerParentRect = container.parentNode.getBoundingClientRect();
    const heightRatio = containerParentRect.height / container.scrollHeight;
    return heightRatio * height;
  }

  getContainer() {
    const { selector, root } = this.containerData;
    return root.querySelector(selector);
  }

  calculateSizes(lines, rowHeight, fontSize) {
    const { width, height } = this.settings;
    const { scrollWidth, scrollHeight } = this.getContainer();

    const ratioX = width / scrollWidth;
    const ratioY = height / scrollHeight;

    const lineHeight = ratioY * rowHeight;
    const charWidth = ratioX * fontSize;
    return { entries: resizeEntries(lines, lineHeight, charWidth), width, height, padding: 1 };
  }

  synchronise = ({ scrollTop, scrollHeight }) => {
    if (!this.scrollElement || this.isMoving) {
      return;
    }
    const ratioY = this.settings.height / scrollHeight;
    const top = Math.round(ratioY * scrollTop);
    this.scrollTo(top);
  };

  scrollTo(px) {
    if (!this.scrollElement) {
      return;
    }
    const top = inBounds(0, this.settings.height - this.settings.scrollHeight, px);
    this.scrollElement.style.top = `${top}px`;
  }

  onMouseUp = e => {
    // e.preventDefault();
    this.isMoving = false;
  };

  onMouseDown = e => {
    this.isMoving = true;
    this.move(e);
  };

  onWheel = e => {
    e.preventDefault();
    this.isMoving = true;
    const rect = this.scrollElement.getBoundingClientRect();
    this.updateScroll(rect.top + e.deltaY);
    setTimeout(() => {
      this.isMoving = false;
    }, 100);
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

  updateScroll(change) {
    const parentRect = this.scrollElement.parentNode.getBoundingClientRect();
    const container = this.getContainer();
    const containerParentRect = container.parentNode.getBoundingClientRect();
    const newPos = inBounds(
      0,
      this.settings.height - this.settings.scrollHeight,
      change - parentRect.y
    );
    const ratioY = this.settings.height / container.scrollHeight;
    const containerScroll = newPos / ratioY;
    this.scrollTo(newPos);
    this.updateContainerScroll(containerScroll);
  }
}
