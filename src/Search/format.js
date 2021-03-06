// TODO add polyfil for text decoder
import * as R from 'ramda';
import { decode } from '../../encoding';
import {
  locationSearch,
  textSearch,
  markPositionalSearches,
  markTextSearches,
  combineEntries,
  markEntries,
} from './utils';

// In future should check for \r\n
const NEW_LINE_LENGTH = 1;

// Each row should return an array of entries, even if it's a single one
const formatRow = ({ searches, formatted, startIndex }, row) => {
  const text = decode(row);
  const endIndex = startIndex + text.length + NEW_LINE_LENGTH;
  const [inRowSearches, otherSearches] = R.splitWhen(
    search => search.position.end > endIndex,
    searches.location
  );
  // const entries = [text];
  const combinedEntries = combineEntries(
    markPositionalSearches(text, inRowSearches, startIndex),
    markTextSearches(text, searches.text, 0, startIndex)
  );
  const entries = combinedEntries.length === 0 ? [text] : markEntries(text, combinedEntries, 0);
  return {
    searches: { text: searches.text, location: otherSearches },
    formatted: [...formatted, entries],
    startIndex: endIndex,
  };
};

const formatText = initialSearches => {
  const initialState = { formatted: [], searches: initialSearches, startIndex: 0 };
  return R.pipe(
    R.reduce(formatRow, initialState),
    R.prop('formatted')
  );
};

export function search(e) {
  const { lines, search } = e.data;
  const initialSearches = {
    location: locationSearch(search),
    text: textSearch(search),
  };
  return formatText(initialSearches)(lines);
}
