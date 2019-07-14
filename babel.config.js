module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '8.10'
        },
        modules: 'commonjs',
        useBuiltIns: 'usage'
      }
    ]
  ]
};