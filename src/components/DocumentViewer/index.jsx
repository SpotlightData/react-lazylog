import { Component, Fragment } from 'react';
import { any, arrayOf, bool, func, number, object, oneOfType, string } from 'prop-types';

import { AutoSizer, List as VirtualList } from 'react-virtualized';
import Line from '../DocumentLine';
import Loading from '../Loading';
import { List } from 'immutable';

import cn from 'classnames';
import mitt from 'mitt';
import { decode, encode } from '../../encoding';
import { inBounds, pxToNum } from './utils';

import * as classes from './index.module.css';
// could potentially use getSnapshotBeforeUpdate to capture scroll position ?
// getSnapshotBeforeUpdate(prevProps, prevState)
// static getDerivedStateFromProps(props, state)

// Setting a hard limit on lines since browsers have trouble with heights
// starting at around 16.7 million pixels and up
const BROWSER_PIXEL_LIMIT = 16.7 * 1000000;
export default class DocumentViewer extends Component {
  static propTypes = {
    /**
     * Set the height in pixels for the component.
     * Defaults to `'auto'` if unspecified. When the `height` is `'auto'`,
     * the component will expand vertically to fill its container.
     */
    height: oneOfType([number, string]),
    /**
     * Set the width in pixels for the component.
     * Defaults to `'auto'` if unspecified.
     * When the `width` is `'auto'`, the component will expand
     * horizontally to fill its container.
     */
    width: oneOfType([number, string]),
    /**
     * Make the text selectable, allowing to copy & paste. Defaults to `false`.
     */
    selectableLines: bool,
    /**
     * Number of rows to render above/below the visible bounds of the list.
     * This can help reduce flickering during scrolling on
     * certain browsers/devices. Defaults to `100`.
     */
    overscanRowCount: number,
    /**
     * A fixed row height in pixels. Controls how tall a line is,
     * as well as the `lineHeight` style of the line's text.
     * Defaults to `19`.
     */
    rowHeight: number,
    /**
     * The array of searches to be performed
     */
    search: arrayOf(object),
    /**
     * Function that all of lines and search array will be passed to
     * Should return a promise
     */
    highlighter: func,
    /**
     * Renders any extra content
     * Can be used to render DocumentMinimap
     */
    extraContentRender: func,
    /**
     * Background color of the text container
     */
    backgroundColor: string,
    /**
     * Color of the regular, unmarked text
     */
    color: string,
    /**
     * Optional classname added to the container
     */
    className: string,
    /**
     * Alternative to retrieving data from http.
     * Allows to customise the text input that will be displayed.
     * MUST return an emmiter and emmit encoded text.
     * encode function will be passed as a first argument
     * emitter creation function will be passed as a second argument
     */
    textEmitter: func,
    /**
     * Allows to inject raw text at once, to improve large text performance
     */
    rawText: arrayOf(string),
  };

  static defaultProps = {
    height: 'auto',
    width: 'auto',
    scrollToLine: 0,
    selectableLines: true,
    rowHeight: 19,
    overscanRowCount: 100,
    loadingComponent: Loading,
    extraContentRender: null,
    highlighter: null,
    backgroundColor: '#fff',
    color: '#000',
    className: '',
  };

  static getDerivedStateFromProps(props, state) {
    return null;
  }

  state = {
    lines: [],
    parsedLines: [],
    loading: true,
  };

  componentDidMount() {
    this.mapEmitter = mitt();
    this.load();
  }

  componentWillUnmount() {
    if (this.mapEmitter) {
      this.mapEmitter.off('update-scroll', this.updateScroll);
      this.mapEmitter = null;
    }
    this.stop();
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.search !== this.props.search) {
      this.load();
    }
  }

  stop() {
    if (this.emitter) {
      this.emitter.emit('abort');
      this.emitter.off('end', this.handleEnd);
      this.emitter = null;
    }
  }

  load() {
    const { rawText } = this.props;

    this.setState({ loading: true });
    this.stop();
    //
    this.emitter = this.injectRaw(rawText);
    this.emitter.on('end', this.handleEnd);
    this.emitter.emit('start');
  }

  handleEnd = () => {
    const { lines: rawLines } = this.state;
    const { search, highlighter } = this.props;
    let promise;
    if (highlighter) {
      promise = highlighter(rawLines, search).then(res => res.lines);
    } else {
      promise = Promise.resolve(rawLines.toArray());
    }
    promise.then(parsedLines => {
      this.setState({ parsedLines, loaded: true });
    });
  };

  injectRaw(text) {
    const emitter = mitt();
    const action = (prevState, prevProps) => {
      const lines = List().withMutations(lines => {
        let index = 0;
        while (index < text.length) {
          lines.push(encode(text[index]));
          index += 1;
        }
      });
      return { lines };
    };
    emitter.on('start', () => this.setState(action, () => emitter.emit('end')));
    return emitter;
  }

  handleScroll = spec => {
    if (this.mapEmitter) {
      this.mapEmitter.emit('scroll', spec);
    }
  };

  renderRow = ({ key, index, style }) => {
    const { rowHeight, formatPart, selectableLines } = this.props;
    const { parsedLines, loaded } = this.state;
    const number = index + 1;

    if (!loaded) {
      return null;
    }

    return (
      <Line
        rowHeight={rowHeight}
        style={style}
        key={key}
        number={number}
        formatPart={formatPart}
        selectable={selectableLines}
        data={parsedLines[index]}
      />
    );
  };

  renderNoRows = () => {
    const { loadingComponent: Loading } = this.props;
    const { error, loaded } = this.state;

    if (loaded) {
      return <Line data={[{ bold: true, text: 'No content' }]} number={0} />;
    }

    return <Loading />;
  };

  renderContent = (height, width) => {
    const { parsedLines, loaded } = this.state;
    const {
      extraContentRender,
      rowHeight,
      backgroundColor,
      color,
      className,
      height: orgHeight,
      width: orgWidth,
      ...rest
    } = this.props;

    return (
      <div style={{ position: 'relative', width, height }}>
        <Fragment>
          {extraContentRender && loaded
            ? extraContentRender({
                lines: parsedLines,
                selector: '.viewer-grid > div',
                emitter: this.mapEmitter,
                sizes: { width, height },
                rowHeight,
              })
            : null}
          <VirtualList
            className={cn(['react-lazylog', 'viewer-grid', classes.lazyLog, className])}
            style={{ backgroundColor, color }}
            rowHeight={rowHeight}
            rowCount={parsedLines.length}
            rowRenderer={this.renderRow}
            noRowsRenderer={this.renderNoRows}
            height={height}
            width={width}
            {...rest}
            // onScroll={this.handleScroll}
            // scrollTop={rowHeight * (scrollToIndex || this.props.scrollToIndex)}
          />
        </Fragment>
      </div>
    );
  };

  render() {
    const { height, width } = this.props;
    const isAutoHeight = height === 'auto';
    const isAutoWidth = width === 'auto';
    return (
      <AutoSizer disableHeight={!isAutoHeight} disableWidth={!isAutoWidth}>
        {({ height: newHeight, width: newWidth }) => {
          return this.renderContent(
            isAutoHeight ? newHeight : pxToNum(height),
            isAutoWidth ? newWidth : pxToNum(width)
          );
        }}
      </AutoSizer>
    );
  }

  // render() {
  //   const { parsedLines, count, scrollToIndex } = this.state;
  //   const {
  //     extraContentRender,
  //     rowHeight,
  //     backgroundColor,
  //     color,
  //     className,
  //     height,
  //     width,
  //     ...restProps
  //   } = this.props;
  //   const isAutoHeight = height === 'auto';
  //   const isAutoWidth = width === 'auto';

  //   return (
  //     <AutoSizer disableHeight={!isAutoHeight} disableWidth={!isAutoWidth}>
  //       {({ height: newHeight, width: newWidth }) => {
  //         const sizes = {
  //           height: isAutoHeight ? newHeight : pxToNum(height),
  //           width: isAutoWidth ? newWidth : pxToNum(width),
  //         };
  //         return (
  //           <div style={{ position: 'relative', width: sizes.width, height: sizes.height }}>
  //             <Fragment>
  //               {extraContentRender &&
  //                 parsedLines &&
  //                 parsedLines.length !== 0 &&
  // extraContentRender({
  //   lines: parsedLines,
  //   selector: '.viewer-grid > div',
  //   emitter: this.mapEmitter,
  //   sizes,
  //   rowHeight,
  // })}
  // <VirtualList
  //   {...restProps}
  //   className={cn(['react-lazylog', 'viewer-grid', lazyLog, className])}
  //   style={{ backgroundColor, color }}
  //   rowHeight={rowHeight}
  //   rowCount={count}
  //   rowRenderer={this.renderRow}
  //   noRowsRenderer={this.renderNoRows}
  //   onScroll={this.handleScroll}
  //   height={sizes.height}
  //   width={sizes.width}
  //   scrollTop={rowHeight * (scrollToIndex || this.props.scrollToIndex)}
  // />
  //             </Fragment>
  //           </div>
  //         );
  //       }}
  //     </AutoSizer>
  //   );
  // }
}
