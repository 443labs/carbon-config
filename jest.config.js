module.exports = {
  roots: ['<rootDir>'],
  modulePaths: ['<rootDir>'],
  testRegex: '(.*\\.test\\.(tsx?|jsx?))$',
  modulePathIgnorePatterns: ['/.webpack/'],
  testPathIgnorePatterns: ['/.webpack/'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globalSetup: "./jest.setup.ts"
};
