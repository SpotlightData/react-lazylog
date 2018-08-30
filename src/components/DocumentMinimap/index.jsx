import { PureComponent } from 'react';
import { number, string, func, shape, arrayOf, any } from 'prop-types';
import cn from 'classnames';

// import { rowCharCount, resizeEntries, fontSize } from './utils';
import * as classes from './index.module.css';

import { Core } from './Core';

const hiddenOpacity = '0.8';

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
  };

  static defaultProps = {
    throttle: 50,
    backgroundColor: 'rgb(211,211,211)',
    fontSize: 14,
    className: '',
  };

  state = {
    opacity: hiddenOpacity,
    scrollHeight: 0,
    core: undefined,
  };

  componentDidMount() {
    const core = Core.create(this.coreSettings());
    core.scrollHeight().then(scrollHeight => this.setState({ scrollHeight, core }));
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
    this.setState({ opacity: hiddenOpacity });
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
          style={{ width, height: scrollHeight }}
        />
        <canvas height={height} width={width} ref={core.setCanvas} />
      </div>
    );
  }
}
