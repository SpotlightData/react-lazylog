const pkg = require('./package.json');
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

module.exports = (builder, opts) => {
  builder.update(options =>
    builder.deepMerge(options, {
      files: { input: 'src/components', exclude: [/Demo/] },
      build: {
        external,
        commonjs: {
          ignore: external,
          namedExports: {
            'node_modules/immutable/dist/immutable.js': ['Map', 'Set', 'Range', 'List'],
          },
        },
      },
    })
  );
};
