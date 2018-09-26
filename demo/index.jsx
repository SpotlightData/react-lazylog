import { PureComponent } from 'react';
import DocumentViewer from '../DocumentViewer';
import DocumentMinimap from '../DocumentMinimap';
import Worker from './search.worker';
import Search from '../Search';
import { text, text2 } from './demoText';

export default class DocumentSearch extends PureComponent {
  static text = text;
  static text2 = text2;
  constructor(props) {
    super(props);
    this.search = Search.create(() => new Worker());
    this.state = { value: '' };
  }

  componentDidMount() {
    this.search.start();
  }

  componentWillUnmount() {
    this.search.remove();
  }

  updateValue = e => {
    this.setState({ value: e.target.value });
  };

  render() {
    const { search, ...rest } = this.props;
    let fullSearch = [
      {
        type: 'text',
        color: 'yellow',
        caseSensitive: true,
        value: this.state.value,
        className: 'acronym',
      },
      ...search,
    ];
    if (this.state.value.length < 2) {
      fullSearch = search;
    }

    return (
      <div>
        <input value={this.state.value} onChange={this.updateValue} />
        <DocumentViewer
          highlighter={this.search.highlighter}
          search={fullSearch}
          extraContentRender={props => (
            <DocumentMinimap {...props} height={this.props.height} width={100} />
          )}
          {...rest}
        />
      </div>
    );
  }
}
