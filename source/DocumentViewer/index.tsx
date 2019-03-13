import * as React from 'react';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import * as R from 'ramda';

import { Line } from '../Line';

type Props<T> = {
  text: Array<T>;
  rulerId?: string;
  document?: Document;
  extractText?: (data: T) => string;
};

type State = {};

// const Row: React.FC<ListChildComponentProps> = ({ index, style, data }) => (
//   <div style={style}>{data[index]}</div>
// );
/**
 * Props: font size, id, text
 * need to make sure that row width is offset by scroll bar
 */
export class DocumentViewer<T> extends React.Component<Props<T>, State> {
  static defaultProps = {
    rulerId: 'ruler',
    document: typeof window !== undefined ? window.document : undefined,
    extractText: R.identity,
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
    // Set active text
    const ruler = document.getElementById(rulerId);
    ruler.style.width = `${rowWidth}px`;
    ruler.textContent = this.getRowText(index);
    const height = ruler.offsetHeight;
    return height;
  };

  render() {
    const { text } = this.props;
    const width = 300;

    return (
      <div>
        <List
          itemSize={this.getItemHeight(width - 20)}
          itemCount={text.length}
          height={400}
          width={width}
          itemData={{ rowWidth: width, getRowText: this.getRowText, numberWidth: 20 }}
        >
          {Line}
        </List>
      </div>
    );
  }
}
