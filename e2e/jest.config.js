module.exports = {
  preset: 'react-native',
  testTimeout: 120000,
  setupFilesAfterEnv: ['<rootDir>/init.js'],
  testMatch: ['**/*.e2e.js'],
  reporters: ['default'],
};
