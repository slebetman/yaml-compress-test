const path = require('path');

module.exports = {
  entry: {
    'undo-demo': path.resolve(__dirname, 'lib', 'undo-demo-webpack.mjs'),
    'version-demo': path.resolve(__dirname, 'lib', 'version-demo-webpack.mjs'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'web-test', 'js'),
  },
  // mode: 'development',
  mode: 'production',
};
