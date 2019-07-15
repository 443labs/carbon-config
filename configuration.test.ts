import { Configuration } from "./configuration";

test('load production env', () => {
  const config = new Configuration();

  // explicitly read from an environment
  let databaseUrl = config.get({ path: 'example.DATABASE_URL', environment: 'production'} );
  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@YOUR_PRODUCTION_HOST:5432/app--db');

  // now swap from the default env to production
  config.options.environment = 'production';

  databaseUrl = config.get({ path: 'example.DATABASE_URL' } );
  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@YOUR_PRODUCTION_HOST:5432/app--db')
});

test('load staging env', () => {
  const config = new Configuration();
  const databaseUrl = config.get({ path: 'example.DATABASE_URL', environment: 'staging' });

  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@staging:5432/app-db')
});

test('load development env', () => {
  const config = new Configuration();
  const databaseUrl = config.get({ path: 'example.DATABASE_URL', environment: 'development' });

  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@development:5432/app-db')
});

test('load test env', () => {
  const config = new Configuration(); // NODE_ENV=test by default when running jest
  const databaseUrl = config.get({ path: 'example.DATABASE_URL' });

  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@test:5432/app-testing-db')
});

test('load value using fallbacks', () => {
  const config = new Configuration();

  // this will fall back and load from the production environment, since it isn't a secret and has no reason to be overridden
  expect(config.get({ path: 'foo.enabled' })).toBe(true);
  expect(config.get({ path: 'bar.enabled' })).toBe(true);
});


test('load value using multiple environments', () => {
  const config = new Configuration();

  // this will fall back and load from the production environment, since it isn't a secret and has no reason to be overridden
  expect(config.get({ path: 'example.DATABASE_URL', environment: 'production' })).toMatch('postgres://username:password@YOUR_PRODUCTION_HOST:5432/app--db');
  expect(config.get({ path: 'example.DATABASE_URL', environment: 'staging'})).toMatch('postgres://username:password@staging:5432/app-db');
  expect(config.get({ path: 'example.DATABASE_URL', environment: 'development'})).toMatch('postgres://username:password@development:5432/app-db');
  expect(config.get({ path: 'example.DATABASE_URL', environment: 'test'})).toMatch('postgres://username:password@test:5432/app-testing-db');
});

test('load list and separators', () => {
  const config = new Configuration();

  // this will fall back and load from the production environment, since it isn't a secret and has no reason to be overridden
  expect(config.get({ path: 'example.list' })).toStrictEqual(['a', 'b', 'c']);
  expect(config.get({ path: 'example/list' })).toStrictEqual(['a', 'b', 'c']);
  expect(config.get({ path: 'example:list' })).toStrictEqual(['a', 'b', 'c']);
});

test('load foo from test', () => {
  const config = new Configuration();

  // off during tests
  expect(config.get({ path: 'foo.enabled' })).toStrictEqual(false);

  // on in prod
  expect(config.get({ path: 'foo.enabled', environment: 'production' })).toStrictEqual(true);
});

