import * as React from 'react';

type Context = {
  rowWidth: number;
  numberWidth: number;
  rowRender: (index: number) => React.ReactNode;
};

type Props = {
  index: number;
  style: React.CSSProperties;
  data: Context;
};

type Styles = {
  numberContainer: React.CSSProperties;
  number: React.CSSProperties;
};

const styles: Styles = {
  numberContainer: {
    display: 'inline-block',
    height: '100%',
  },
  number: {
    float: 'right',
    padding: '0 0.5em 0 0',
  },
};

export const Line: React.FC<Props> = ({ index, style, data }) => {
  const { numberWidth, rowRender } = data;
  return (
    <div style={{ ...style, display: 'flex' }}>
      <div style={{ ...styles.numberContainer, width: numberWidth }}>
        <span style={styles.number}>{index}</span>
      </div>
      <div style={{ width: `calc(100% - ${numberWidth}px)`, display: 'inline-block' }}>
        {rowRender(index)}
      </div>
    </div>
  );
};
