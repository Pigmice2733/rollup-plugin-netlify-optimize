import { createRollupConfig } from './index'

test('creates a config', () => {
  expect(
    createRollupConfig({ babelConfig: {}, routes: {} }, 'production'),
  ).toMatchSnapshot()
})
