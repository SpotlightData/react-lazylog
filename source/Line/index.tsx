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
  const { rowWidth, numberWidth, getRowText } = data;
  console.log(data);
  return (
    <div style={style}>
      <div style={{ width: numberWidth }}>
        <span>{index}</span>
      </div>
      <div>{getRowText(index)}</div>
    </div>
  );
};
