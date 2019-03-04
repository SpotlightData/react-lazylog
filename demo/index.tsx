import React from 'react';
import { render } from 'react-dom';
import { text } from './demoText';
import { DocumentViewer } from '../source/DocumentViewer';

console.log('test');

render(<DocumentViewer />, document.getElementById('root'));
