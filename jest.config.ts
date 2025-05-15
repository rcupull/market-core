import type { Config } from 'jest';

process.env['APP_CONFIG_PATH'] = '../app-config.json';

const config: Config = {
  prettierPath: require.resolve('prettier-2'),
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  preset: 'ts-jest',
  testPathIgnorePatterns: ['build'],
  maxWorkers: 8,
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/setEnvVars.js']
};

export default config;
