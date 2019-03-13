import * as React from 'react';
import { render } from 'react-dom';
import { text } from './demoText';
import { DocumentViewer } from '../source/DocumentViewer';

render(
  <DocumentViewer text={text.split('\n')} document={document} />,
  document.getElementById('root')
);
