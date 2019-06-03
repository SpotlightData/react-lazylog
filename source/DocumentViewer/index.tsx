import * as React from 'react';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import * as R from 'ramda';
import * as sid from 'shortid';

import { Line } from '../Line';

type DocumentViewerProps<T> = {
  text: Array<T>;
  rulerId?: string;
  document?: Document;
  extractText?: (data: T) => string;
  rowRender?: (data: T) => React.ReactNode;
  numberWidth?: number;
  width: number;
  height: number;
  scrollWidth?: number;
};

type State = {};

/**
 * Props: font size, id, text
 * need to make sure that row width is offset by scroll bar
 */
export class DocumentViewer<T> extends React.Component<DocumentViewerProps<T>, State> {
  static defaultProps = {
    rulerId: 'ruler',
    document: typeof window !== undefined ? window.document : undefined,
    extractText: R.identity,
    rowRender: R.identity,
    numberWidth: 60,
    scrollWidth: 20,
  };

  myId: string = sid.generate();
  isFirstRun: boolean = true;

  componentWillUnmount() {
    // Clean up the ruler
    const { rulerId } = this.props;
    const node = document.querySelector(`#${rulerId}`);
    if (node != null) {
      node.parentNode.removeChild(node);
      return;
    }
  }

  createRuler() {
    const { document, rulerId } = this.props;
    const div = document.createElement('div');
    div.style.visibility = 'hidden';
    div.style.position = 'absolute';
    div.style.zIndex = '-2000000';
    div.id = rulerId;

    document.body.appendChild(div);
    this.isFirstRun = false;
  }

  getRowText = (index: number): string => {
    const { text, extractText } = this.props;
    return extractText(text[index]);
  };

  getRenderedRow = (index: number): React.ReactNode => {
    const { text, rowRender } = this.props;
    return rowRender(text[index]);
  };

  getItemHeight = (rowWidth: number) => (index: number): number => {
    if (this.isFirstRun) {
      this.createRuler();
    }

    const { rulerId } = this.props;
    const text = String(index) + this.getRowText(index);

    // Set active text and get height
    const ruler = document.querySelector(`#${rulerId}`) as HTMLElement;
    if (ruler != null) {
      ruler.style.width = `${rowWidth}px`;
      ruler.textContent = text;
      const height = ruler.offsetHeight;
      return height;
    }
    return 0;
  };

  render() {
    const { text, numberWidth, width, height, scrollWidth } = this.props;

    return (
      <div id={this.myId}>
        <List
          itemSize={this.getItemHeight(width - scrollWidth - numberWidth)}
          itemCount={text.length}
          height={height}
          width={width}
          itemData={{ rowWidth: width, rowRender: this.getRenderedRow, numberWidth }}
        >
          {Line}
        </List>
      </div>
    );
  }
}
