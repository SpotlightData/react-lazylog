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
  it('should render', () => {
    const { container } = render(
      <DocumentViewer width={200} height={200} text={text} rulerId="myId" />
    );
    expect(container.innerHTML).toMatchSnapshot();
  });

  it('should create a ruler', () => {
    const rulerId = 'myId';
    const { debug } = render(
      <DocumentViewer width={200} height={200} text={text} rulerId={rulerId} />
    );
    expect(document.querySelector(`#${rulerId}`)).toBeInTheDocument();
  });

  it('should clean up the ruler', () => {
    const rulerId = 'myId';
    const { unmount, container } = render(
      <DocumentViewer width={200} height={200} text={text} rulerId={rulerId} />
    );
    unmount();
    expect(container.querySelector(`#${rulerId}`)).not.toBeInTheDocument();
  });
});
