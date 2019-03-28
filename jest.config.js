const path = require('path');
const name = '@spotlightdata/document-viewer';

module.exports = {
  verbose: true,
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+.tsx?$': 'ts-jest',
  },
  testMatch: ['<rootDir>/tests/**/*.test.tsx'],
  displayName: name,
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    // This is just here so our examples look like they would in a real project
    [name]: path.join(__dirname, '/source'),
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
};
