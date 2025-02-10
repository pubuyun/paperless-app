const rules = require('./webpack.rules');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: ['.js', '.jsx'], // 添加 .jsx 解析支持
    alias: {
        '@': require('path').resolve(__dirname, 'src/renderer') // 配置 alias 方便引入
    }
  },
};
