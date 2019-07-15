import { Configuration } from "../src";

test('load list value', () => {
  const config = new Configuration();
  const list = config.get({ path: 'example.list' });

  // this will fall back and load from the production environment, since it isn't a secret and has no reason to be overridden
  expect(list).toBeTruthy();
});
