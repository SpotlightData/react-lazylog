const itemLength = item => (typeof item === 'string' ? item.length : item.value.length);

const atLeastOne = n => Math.max(1, Math.round(n));

export function resizeEntries(lines, lineHeight, charWidth) {
  return lines.reduce((list, row, rowIndex) => {
    const columns = row.reduce(
      ({ entries, position }, column) => {
        const newPosition = position + itemLength(column);
        if (typeof column === 'string') {
          return { entries, position: newPosition };
        }
        const newEntry = {
          top: atLeastOne(rowIndex * lineHeight),
          left: atLeastOne(position * charWidth),
          width: atLeastOne(itemLength(column) * charWidth),
          height: atLeastOne(lineHeight),
          color: column.color,
        };
        return { entries: [...entries, newEntry], position: newPosition };
      },
      { entries: [], position: 0 }
    );
    return list.concat(columns.entries);
  }, []);
}

export function longestLine(list) {
  return list.reduce((length, line) => {
    const lineLength = line.reduce((sum, entry) => sum + itemLength(entry), 0);
    return length > lineLength ? length : lineLength;
  }, 0);
}
