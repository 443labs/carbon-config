import { Configuration } from "../src";

test('load multiline value', () => {
  const config = new Configuration();
  const value = config.get({ path: 'example.multiline' });

  // this will fall back and load from the production environment, since it isn't a secret and has no reason to be overridden
  expect(value).toBeTruthy();
});
