const {
  start,
  devServer,
  when,
  bundle,
  library,
  configure,
  customise,
  tag,
  tap,
} = require('@atecake/builder');

const pkg = require('./package.json');

start([
  configure(),
  when('build', [
    bundle({ files: { input: 'src/components/index.js', output: pkg.main } }),
    bundle({
      files: { input: 'src/components/index.js', output: pkg.module },
      build: { rollup: { format: 'esm' } },
      action: Promise.resolve(),
    }),
    library({
      files: { input: 'src/components', output: 'es5' },
      build: { rollup: { format: 'cjs' } },
      action: Promise.resolve(),
    }),
  ]),
  when('start', [devServer()]),
  when('tag', [tag()]),
]);
