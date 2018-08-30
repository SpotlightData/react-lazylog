import { Component, Fragment } from 'react';
import { any, arrayOf, bool, func, number, object, oneOfType, string } from 'prop-types';

import Line from '../DocumentLine';
import Loading from '../Loading';
import { List } from 'immutable';

import mitt from 'mitt';
import { decode, encode } from '../../encoding';

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

  render() {
    return null;
  }
}
