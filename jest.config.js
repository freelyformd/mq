module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
  "transform": {
    "^.+\\.ts$": "ts-jest"
  },
  "testRegex": "(/__tests__/.*|(\\.|/)(test))\\.ts$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  "collectCoverage": true,
  "collectCoverageFrom": [
    "**/*.{ts,js}",
    "!**/node_modules/**",
    "!**/vendor/**"
  ]
};
