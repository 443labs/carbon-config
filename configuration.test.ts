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

test('load local env', () => {
  const config = new Configuration();
  const databaseUrl = config.get({ path: 'example.DATABASE_URL' });

  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@localhost:5432/app-db')
});

test('load testing env', () => {
  const config = new Configuration();
  const databaseUrl = config.get({ path: 'example.DATABASE_URL', environment: 'testing' });

  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@test:5432/app-testing-db')
});
