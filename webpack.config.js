const path = require('path');

module.exports = {
  entry: './lib/main-webpack.mjs',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'web-test', 'js'),
  },
  // mode: 'development',
  mode: 'production',
};
