import * as React from 'react';

type Context = {
  rowWidth: number;
  numberWidth: number;
  getRowText: (index: number) => string;
};

type Props = {
  index: number;
  style: React.CSSProperties;
  data: Context;
};

export const Line: React.FC<Props> = ({ index, style, data }) => {
  const { numberWidth, getRowText } = data;
  return (
    <div style={{ ...style, display: 'flex' }}>
      <div
        style={{ width: numberWidth, display: 'inline-block', height: '100%', padding: '0 0.5em' }}
      >
        <span style={{ float: 'right' }}>{index}</span>
      </div>
      <div style={{ width: `calc(100% - ${numberWidth}px)`, display: 'inline-block' }}>
        <span>{getRowText(index)}</span>
      </div>
    </div>
  );
};
