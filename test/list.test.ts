import { Configuration } from "../src";

test('load list value', async () => {
  const config = new Configuration();
  const list = await config.get({ path: 'example.list' });

  // this will fall back and load from the production environment, since it isn't a secret and has no reason to be overridden
  expect(list).toBeTruthy();
});
