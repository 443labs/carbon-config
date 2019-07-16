import { Configuration } from "../src";

test('load production env', async () => {
  const config = new Configuration();

  // explicitly read from an environment
  let databaseUrl = await config.get({ path: 'example.DATABASE_URL', environment: 'production'} );
  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@YOUR_PRODUCTION_HOST:5432/app--db');

  // now swap from the default env to production
  config.options.environment = 'production';

  databaseUrl = await config.get({ path: 'example.DATABASE_URL' } );
  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@YOUR_PRODUCTION_HOST:5432/app--db')
});

test('load staging env', async () => {
  const config = new Configuration();
  const databaseUrl = await config.get({ path: 'example.DATABASE_URL', environment: 'staging' });

  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@staging:5432/app-db')
});

test('load development env', async () => {
  const config = new Configuration();
  const databaseUrl = await config.get({ path: 'example.DATABASE_URL', environment: 'development' });

  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@development:5432/app-db')
});

test('load test env', async () => {
  const config = new Configuration(); // NODE_ENV=test by default when running jest
  const databaseUrl = await config.get({ path: 'example.DATABASE_URL' });

  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@test:5432/app-testing-db')
});

test('load value using fallbacks', async () => {
  const config = new Configuration();

  // foo.enabled: true is set in production, but overridden in localhost.yml
  expect(await config.get({ path: 'foo.enabled' })).toBe(false);

  // bar.enabled: true is set in production, so the test env will fallback to that value
  expect(await config.get({ path: 'bar.enabled' })).toBe(true);
});


test('load value using multiple environments', async () => {
  const config = new Configuration();

  // this will fall back and load from the production environment, since it isn't a secret and has no reason to be overridden
  expect(await config.get({ path: 'example.DATABASE_URL', environment: 'production' })).toMatch('postgres://username:password@YOUR_PRODUCTION_HOST:5432/app--db');
  expect(await config.get({ path: 'example.DATABASE_URL', environment: 'staging'})).toMatch('postgres://username:password@staging:5432/app-db');
  expect(await config.get({ path: 'example.DATABASE_URL', environment: 'development'})).toMatch('postgres://username:password@development:5432/app-db');
  expect(await config.get({ path: 'example.DATABASE_URL', environment: 'test'})).toMatch('postgres://username:password@test:5432/app-testing-db');
});

test('load list and separators', async () => {
  const config = new Configuration();

  // this will fall back and load from the production environment, since it isn't a secret and has no reason to be overridden
  expect(await config.get({ path: 'example.list' })).toStrictEqual(['a', 'b', 'c']);
  expect(await config.get({ path: 'example/list' })).toStrictEqual(['a', 'b', 'c']);
  expect(await config.get({ path: 'example:list' })).toStrictEqual(['a', 'b', 'c']);
});

test('load foo from test', async () => {
  const config = new Configuration();

  // off during tests
  expect(await config.get({ path: 'foo.enabled' })).toStrictEqual(false);

  // on in prod
  expect(await config.get({ path: 'foo.enabled', environment: 'production' })).toStrictEqual(true);
});

test('load aws secret', async () => {
  const config = new Configuration();
  const secret = await config.get({ path: 'foo.secret' });

  console.log(secret);
  expect(secret).toBeTruthy();
});
