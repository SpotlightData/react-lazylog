import * as React from 'react';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import * as R from 'ramda';
import * as sid from 'shortid';

import { Line } from '../Line';

type Props<T> = {
  text: Array<T>;
  rulerId?: string;
  document?: Document;
  extractText?: (data: T) => string;
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
export class DocumentViewer<T> extends React.Component<Props<T>, State> {
  static defaultProps = {
    rulerId: 'ruler',
    document: typeof window !== undefined ? window.document : undefined,
    extractText: R.identity,
    numberWidth: 30,
    scrollWidth: 20,
  };

  myId: string = sid.generate();
  isFirstRun: boolean = true;

  componentWillUnmount() {
    // Clean up the ruler
    const { rulerId } = this.props;
    const container = this.container();
    if (container !== null) {
      const node = container.querySelector(`#${rulerId}`);
      if (node != null) {
        node.parentNode.removeChild(node);
      }
      return;
    }
  }

  container(): HTMLElement | null {
    return document.getElementById(this.myId);
  }

  createRuler() {
    const { document, rulerId } = this.props;
    // Create the ruler and make sure it's not visible
    const div = document.createElement('div');
    div.style.visibility = 'hidden';
    div.style.position = 'absolute';
    div.style.zIndex = '-2000000';
    div.id = rulerId;

    const container = this.container();
    if (container != null) {
      container.appendChild(div);
      this.isFirstRun = false;
    }
  }

  getRowText = (index: number): string => {
    const { text, extractText } = this.props;
    return extractText(text[index]);
  };

  getItemHeight = (rowWidth: number) => (index: number): number => {
    if (this.isFirstRun) {
      this.createRuler();
    }

    const { rulerId } = this.props;
    // Make sure we don't get 0 height length
    let text = this.getRowText(index);
    text = text.length <= 1 ? 'A' : text;

    // Set active text and get height
    const container = this.container();
    if (container != null) {
      const ruler: HTMLElement = container.querySelector(`#${rulerId}`);
      if (ruler != null) {
        ruler.style.width = `${rowWidth}px`;
        ruler.textContent = text;
        const height = ruler.offsetHeight;
        return height;
      }
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
          itemData={{ rowWidth: width, getRowText: this.getRowText, numberWidth }}
        >
          {Line}
        </List>
      </div>
    );
  }
}
