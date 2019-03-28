import * as React from 'react';
import { render, fireEvent, cleanup, waitForElement } from 'react-testing-library';
import { DocumentViewer } from '@spotlightdata/document-viewer';

const text = `
Lorem ipsum dolor sit amet, 
consectetur adipiscing elit. 
Nunc semper sagittis libero sit amet venenatis. Curabitur
nec sem condimentum, volutpat sapien nec, pulvinar felis.
Integer orci tellus, bibendum id condimentum sed, tincidunt ac urna.
Integer vehicula vel eros ac pulvinar. Sed accumsan lacus purus
`.split('\n');

describe('DocumentViever', () => {
  it('should create a ruler', () => {
    const { debug } = render(
      <DocumentViewer width={200} height={200} text={text} rulerId="myId" />
    );
    debug();
    // expect();
  });
});
