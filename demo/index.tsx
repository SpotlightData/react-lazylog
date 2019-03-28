import * as React from 'react';
import { render } from 'react-dom';
import { text, highlightedText } from './demoText';
import { DocumentViewer } from '../source/DocumentViewer';

render(
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <DocumentViewer
      text={text.split('\n')}
      document={document}
      rulerId="ruler"
      width={400}
      height={400}
    />
    <div style={{ height: '50px' }} />
    <DocumentViewer
      text={highlightedText}
      document={document}
      rulerId="ruler"
      width={400}
      height={200}
      rowRender={row => {
        return 'test';
      }}
      extractText={row => {
        if (typeof row === 'string') {
          return row as string;
        }
        return row.reduce((str, entry) => {
          let result;
          if (typeof entry === 'string') {
            result = entry as string;
          } else {
            result = entry.text;
          }
          return str + result;
        }, '');
      }}
    />
  </div>,
  document.getElementById('root')
);
