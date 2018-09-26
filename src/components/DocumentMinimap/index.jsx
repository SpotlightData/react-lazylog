import React, { PureComponent } from 'react';
import { number, string, func, shape, arrayOf, any } from 'prop-types';
import cn from 'classnames';

import classes from './index.module.css';

import { Core } from './Core';

export default class DocumentMinimap extends PureComponent {
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
    sizes: shape({
      width: number,
      height: number,
    }).isRequired,
    lines: arrayOf(any).isRequired,
    hiddenOpacity: number,
  };

  static defaultProps = {
    throttle: 50,
    backgroundColor: 'rgb(211,211,211)',
    fontSize: 13,
    className: '',
    hiddenOpacity: 0.8,
  };

  state = {
    opacity: 0,
    scrollHeight: 0,
    core: undefined,
  };

  componentDidMount() {
    const core = Core.create(this.coreSettings());
    core
      .scrollHeight()
      .then(scrollHeight =>
        this.setState({ scrollHeight, core, opacity: this.props.hiddenOpacity })
      );
    core.draw();
  }

  componentDidUpdate(prevProps) {
    const { core } = this.state;
    if (this.props.lines !== prevProps.lines && core) {
      core.update(this.coreSettings());
      core.scrollHeight().then(scrollHeight => this.setState({ scrollHeight }));
      core.draw();
    }
  }

  coreSettings() {
    const {
      sizes,
      selector,
      throttle,
      emitter,
      lines,
      rowHeight,
      fontSize,
      width,
      height,
    } = this.props;
    return {
      width,
      height,
      containerSizes: sizes,
      throttle,
      emitter,
      getContainer: () => window.document.querySelector(selector),
      canvasSettings: {
        backgroundColor: this.props.backgroundColor,
      },
      markers: {
        lines,
        rowHeight,
        fontSize,
      },
    };
  }

  onMouseEnter = e => {
    e.preventDefault();
    this.setState({ opacity: 1 });
  };

  onMouseLeave = e => {
    e.preventDefault();
    this.setState({ opacity: this.props.hiddenOpacity });
  };

  filtered = fn => e => {
    const { height } = this.props;
    const { scrollHeight } = this.state;
    if (scrollHeight < height) {
      fn(e);
    }
  };

  render() {
    const { opacity, core, scrollHeight } = this.state;
    const { width, height, className } = this.props;

    if (!core) {
      return null;
    }
    return (
      <div
        className={cn(classes.container, className)}
        style={{
          height,
          width,
          opacity,
        }}
        onMouseDown={this.filtered(core.onMouseDown)}
        onTouchStart={this.filtered(core.onMouseDown)}
        onTouchMove={this.filtered(core.move)}
        onMouseMove={this.filtered(core.move)}
        onTouchEnd={this.filtered(core.onMouseUp)}
        onMouseUp={this.filtered(core.onMouseUp)}
        onWheel={this.filtered(core.onWheel)}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        <div
          ref={core.setScroll}
          className={classes.scroll}
          style={{ width, height: scrollHeight }}
        />
        <canvas height={height} width={width} ref={core.setCanvas} />
      </div>
    );
  }
}
