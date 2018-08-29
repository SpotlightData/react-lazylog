import { PureComponent } from 'react';
import { number, string, func, shape } from 'prop-types';
import throttle from 'lodash.throttle';
import sid from 'shortid';
import cn from 'classnames';

import { rowCharCount, resizeEntries, fontSize } from './utils';
import * as classes from './index.module.css';

import { Canvas } from './Canvas';
import { Core } from './Core';

const hiddenOpacity = '0.8';

export default class DocumentMinimap extends PureComponent {
  static propTypes = {
    height: number.isRequired,
    width: number.isRequired,
    selector: string.isRequired,
    // addListener: func.isRequired,
    // updateScroll: func.isRequired,
    throttle: number,
    backgroundColor: string,
    scrollHeight: number,
    fontSize: number,
    className: string,
    emitter: shape({
      on: func,
      off: func,
    }).isRequired,
  };

  static defaultProps = {
    throttle: 50,
    backgroundColor: 'rgba(211,211,211, 0.5)',
    scrollHeight: 20,
    fontSize: 14,
    className: '',
  };

  constructor(props) {
    super(props);
    this.canvas = Canvas.empty();
    this.core = Core.from({
      selector: this.props.selector,
      container: window.document,
      width: props.width,
      height: props.height,
      updateContainerScroll: this.updateScroll,
      scrollHeight: props.scrollHeight,
    });
    this.syncronise = throttle(this.core.synchronise, props.throttle);
    this.state = {
      opacity: hiddenOpacity,
    };
  }

  componentDidMount() {
    this.props.emitter.on('scroll', this.syncronise);
    this.draw();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.lines !== this.props.lines) {
      this.draw();
    }
  }

  componentWillUnmount() {
    this.props.emitter.off('scroll', this.syncronise);
  }

  updateScroll = spec => {
    this.props.emitter.emit('update-scroll', spec);
  };

  draw() {
    this.canvas.drawEntries(
      this.core.calculateSizes(this.props.lines, this.props.rowHeight, this.props.fontSize)
    );
  }

  setCanvas = node => {
    this.canvas = Canvas.from(node, {
      backgroundColor: this.props.backgroundColor,
    });
  };

  onMouseEnter = e => {
    e.preventDefault();
    this.setState({ opacity: hiddenOpacity });
  };

  onMouseLeave = e => {
    e.preventDefault();
    this.setState({ opacity: hiddenOpacity });
    this.core.isMoving = false;
  };

  render() {
    const { opacity } = this.state;
    const { width, height, scrollHeight, className } = this.props;
    return (
      <div
        className={cn(classes.container, className)}
        style={{
          height: height,
          width,
          opacity,
        }}
        onMouseDown={this.core.onMouseDown}
        onTouchStart={this.core.onMouseDown}
        onTouchMove={this.core.move}
        onMouseMove={this.core.move}
        onTouchEnd={this.core.onMouseUp}
        onMouseUp={this.core.onMouseUp}
        onWheel={this.core.onWheel}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <div
          ref={this.core.setScroll}
          className={classes.scroll}
          style={{ width, height: scrollHeight }}
        />
        <canvas height={height} width={width} ref={this.setCanvas} />
      </div>
    );
  }
}
