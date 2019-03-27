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
    [name]: require.resolve('./source'),
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
};
