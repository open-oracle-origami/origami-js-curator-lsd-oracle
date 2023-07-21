import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testMatch: ['**/test/**/*.spec.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.ts',
    '!<rootDir>/src/interfaces/**/*.ts',
    '!<rootDir>/src/types/**/*.ts',
  ],
}

export default config
