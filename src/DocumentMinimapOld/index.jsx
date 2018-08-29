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

export default class DocumentMinimapsss extends PureComponent {
  static propTypes = {
    height: number.isRequired,
    width: number.isRequired,
    selector: string.isRequired,
    throttle: number,
    backgroundColor: string,
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
    fontSize: 14,
    className: '',
  };

  constructor(props) {
    super(props);
    this.canvas = Canvas.empty();
    this.state = {
      opacity: hiddenOpacity,
    };
  }

  componentDidMount() {
    const core = Core.from({
      selector: this.props.selector,
      container: window.document,
      width: this.props.width,
      height: this.props.height,
      updateContainerScroll: this.updateScroll,
    });
    this.synchronise = throttle(this.sync, this.props.throttle);
    this.props.emitter.on('scroll', this.synchronise);
    this.setState({
      core,
    });
  }

  componentDidUpdate() {
    if (this.state.core) {
      this.draw();
    }
  }

  sync = spec => {
    const { core } = this.state;
    if (core) {
      core.synchronise(spec);
    }
  };

  componentWillUnmount() {
    this.props.emitter.off('scroll', this.synchronise);
  }

  updateScroll = spec => {
    this.props.emitter.emit('update-scroll', spec);
  };

  draw() {
    const { lines, rowHeight, fontSize } = this.props;
    const { core } = this.state;
    core.calculateSizes(lines, rowHeight, fontSize).then(this.canvas.drawEntries);
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
    this.state.core.isMoving = false;
  };

  render() {
    const { opacity, core } = this.state;
    const { width, height, scrollHeight, className } = this.props;

    if (!core) {
      return null;
    }

    return (
      <div
        className={cn(classes.container, className)}
        style={{
          height: height,
          width,
          opacity,
        }}
        onMouseDown={core.onMouseDown}
        onTouchStart={core.onMouseDown}
        onTouchMove={core.move}
        onMouseMove={core.move}
        onTouchEnd={core.onMouseUp}
        onMouseUp={core.onMouseUp}
        onWheel={core.onWheel}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <div
          ref={core.setScroll}
          className={classes.scroll}
          style={{ width, height: core.getScrollHeight() }}
        />
        <canvas height={height} width={width} ref={this.setCanvas} />
      </div>
    );
  }
}
