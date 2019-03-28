import * as React from 'react';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import * as R from 'ramda';

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

  isFirstRun: boolean = true;

  componentWillUnmount() {
    // Clean up the ruler
    const { document, rulerId } = this.props;
    const node = document.getElementById(rulerId);
    if (node != null) {
      node.parentNode.removeChild(node);
    }
  }

  createRuler() {
    const { document, rulerId } = this.props;
    // Create the ruler and make sure it's not visible
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

  getItemHeight = (rowWidth: number) => (index: number): number => {
    if (this.isFirstRun) {
      this.createRuler();
    }

    const { document, rulerId } = this.props;
    // Make sure we don't get 0 height length
    let text = this.getRowText(index);
    text = text.length <= 1 ? 'A' : text;

    // Set active text and get height
    const ruler = document.getElementById(rulerId);
    ruler.style.width = `${rowWidth}px`;
    ruler.textContent = text;
    const height = ruler.offsetHeight;

    return height;
  };

  render() {
    const { text, numberWidth, width, height, scrollWidth } = this.props;

    return (
      <List
        itemSize={this.getItemHeight(width - scrollWidth - numberWidth)}
        itemCount={text.length}
        height={height}
        width={width}
        itemData={{ rowWidth: width, getRowText: this.getRowText, numberWidth }}
      >
        {Line}
      </List>
    );
  }
}
