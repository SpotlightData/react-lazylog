import * as React from 'react';
import { render } from 'react-dom';
import { text, highlightedText } from './demoText';
import { DocumentViewer } from '../source/DocumentViewer';
import * as R from 'ramda';

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
        if (typeof row === 'string') {
          return row;
        }
        return row.map((entry, i) => {
          if (typeof entry === 'string') {
            return entry;
          }
          return (
            <span
              key={`${i}-${entry.color}-${entry.text}`}
              style={{ backgroundColor: entry.color }}
            >
              {entry.text}
            </span>
          );
        });
      }}
      extractText={row => {
        if (typeof row === 'string') {
          return row;
        }
        return R.reduce(
          (str: string, entry) => {
            const appendix = typeof entry === 'string' ? entry : entry.text;
            return str + appendix;
          },
          '',
          row
        );
      }}
    />
  </div>,
  document.getElementById('root')
);
