test('regex for secrets manager', () => {
  let text = '${ssm:/aws/reference/secretsmanager/sentry~true}';
  let regex = /\${ssm:([A-Za-z0-9_\-\/]+)(~?true|false)\}/gm;
  // @ts-ignore: TS2525
  let [, path, encrypted] = regex.exec(text) || [];

  expect(path).toBeTruthy();
  expect(encrypted).toBeTruthy();
});