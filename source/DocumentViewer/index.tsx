import * as React from 'react';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';

type Text = Array<string>;

type Props = {
  text: Text;
  rulerId?: string;
  document?: Document;
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
  static defaultProps = {
    rulerId: 'ruler',
    document: typeof window !== undefined ? window.document : undefined,
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

  setupRuler() {
    const { document, rulerId } = this.props;
    // Create the ruler and make sure it's not visible
    const div = document.createElement('div');
    div.style.visibility = 'hidden';
    div.style.position = 'absolute';
    div.style.zIndex = '-2000000';
    div.id = rulerId;

    document.body.appendChild(div);
  }

  getRowText = (index: number) => this.props.text[index];

  getItemHeight = (rowWidth: number) => (index: number): number => {
    if (this.isFirstRun) {
      this.isFirstRun = false;
      this.setupRuler();
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
          itemData={text}
        >
          {Row}
        </List>
      </div>
    );
  }
}
