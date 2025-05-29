// jest.config.js
module.exports = {
    testEnvironment: 'node',
    verbose: true,
    testTimeout: 10000,
    setupFiles: ['./tests/setup.js'],
    testRegex: './tests/.*\\.test\\.js$',
    collectCoverage: true,
    coverageDirectory: './coverage',
    collectCoverageFrom: [
      'controllers/**/*.js',
      'services/**/*.js',
      'middlewares/**/*.js',
      'routes/**/*.js',
      '!**/node_modules/**',
      '!**/vendor/**',
    ],
  };