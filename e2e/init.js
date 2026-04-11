const detox = require('detox');
const config = require('../detox.config');
const adapter = require('detox/runners/jest/adapter');

jest.setTimeout(120000);

beforeAll(async () => {
  await detox.init(config, { initGlobals: true });
});

beforeEach(async () => {
  await adapter.beforeEach();
});

afterAll(async () => {
  await detox.cleanup();
});

afterEach(async () => {
  await adapter.afterEach();
});
