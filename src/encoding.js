import { TextDecoder, TextEncoder } from 'text-encoding-utf-8';

export const decode = value => new TextDecoder('utf-8').decode(value);
export const encode = value => new TextEncoder('utf-8').encode(value);
