import { Configuration } from "./configuration";

test('load production env', () => {
  const config = new Configuration();
  const databaseUrl = config.get('example.DATABASE_URL', 'production');

  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@YOUR_PRODUCTION_HOST:5432/app--db')
});

test('load staging env', () => {
  const config = new Configuration();
  const databaseUrl = config.get('example.DATABASE_URL', 'staging');

  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@staging:5432/app-db')
});

test('load development env', () => {
  const config = new Configuration();
  const databaseUrl = config.get('example.DATABASE_URL', 'development');

  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@development:5432/app-db')
});

test('load local env', () => {
  const config = new Configuration();
  const databaseUrl = config.get('example.DATABASE_URL', 'local');

  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@localhost:5432/app-db')
});

test('load testing env', () => {
  const config = new Configuration();
  const databaseUrl = config.get('example.DATABASE_URL', 'testing', true);

  expect(databaseUrl).toBeTruthy();
  expect(databaseUrl).toMatch('postgres://username:password@test:5432/app-testing-db')
});
