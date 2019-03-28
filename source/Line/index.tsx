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
  const { numberWidth, getRowText } = data;
  return (
    <div style={{ ...style, display: 'flex' }}>
      <div style={{ ...styles.numberContainer, width: numberWidth }}>
        <span style={styles.number}>{index}</span>
      </div>
      <div style={{ width: `calc(100% - ${numberWidth}px)`, display: 'inline-block' }}>
        <span>{getRowText(index)}</span>
      </div>
    </div>
  );
};
