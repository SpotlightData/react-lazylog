export const pxToNum = px => {
  return typeof px === 'string' ? parseInt(px.replace('px', ''), 10) : px;
};
export const inBounds = (min, max, value) => Math.max(min, Math.min(max, value));
