const defaultBabelConfig = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          ie: 11,
        },
        modules: false,
        exclude: ['transform-async-to-generator', 'transform-regenerator'],
      },
    ],
    '@babel/preset-react',
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-do-expressions',
    '@babel/plugin-proposal-class-properties',
  ],
};

const fileExtensions = /\.(js|jsx|css|less|sass)$/;
const files = {
  input: 'src',
  output: 'es',
  extensions: fileExtensions,
  exclude: [],
};

const build = {
  format: 'es',
  babel: defaultBabelConfig,
  resolve: { module: true, extensions: ['.mjs', '.js', '.jsx', '.json'] },
  commonjs: {
    include: 'node_modules/**',
    ignore: [],
  },
  external: [],
};

module.exports = { files, build };
