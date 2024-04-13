const path = require('path');

module.exports = {
  entry: {
    main: './lib/main-webpack.mjs',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'web-test', 'js'),
  },
  // mode: 'development',
  mode: 'production',
};
