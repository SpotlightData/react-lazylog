import * as React from 'react';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';

const id = 'ruler';
const rowHeight = 14;

type Text = Array<string>;

type Props = {
  text: Text;
  document: Document;
};

type State = {};

const Row: React.FC<ListChildComponentProps> = ({ index, style, data }) => (
  <div style={style}>{data[index]}</div>
);
/**
 * Props: font size, id, text
 * need to make sure that row width is offset by scroll bar
 */
export class DocumentViewer extends React.Component<Props, State> {
  getRowText = (index: number) => this.props.text[index];

  getItemHeight = (getText: (index: number) => string, rowWidth: number) => (
    index: number
  ): number => {
    // Set active text
    const ruler = this.props.document.getElementById(id);
    ruler.style.width = `${rowWidth}px`;
    ruler.textContent = getText(index);
    const height = ruler.offsetHeight;
    return height;
  };

  render() {
    const { text } = this.props;
    const width = 300;

    return (
      <div>
        <List
          itemSize={this.getItemHeight(this.getRowText, width - 20)}
          itemCount={text.length}
          height={400}
          width={width}
          itemData={text}
        >
          {Row}
        </List>
      </div>
    );
  }
}
