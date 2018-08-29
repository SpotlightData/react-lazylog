import { PureComponent } from 'react';
import { number, string, func, shape } from 'prop-types';
import throttle from 'lodash.throttle';
import cn from 'classnames';

// import { rowCharCount, resizeEntries, fontSize } from './utils';
import * as classes from './index.module.css';

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
  };

  static defaultProps = {
    throttle: 50,
    backgroundColor: 'rgba(211,211,211, 0.5)',
    fontSize: 14,
    className: '',
  };

  render() {
    return null;
  }
}
