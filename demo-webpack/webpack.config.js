const path = require('path');

module.exports = {
  entry: './public/js/index.js',
  mode:'development',
  devServer: {
    static: {
      directory: path.join(__dirname, './public/'),
    },
    port: 9002,
    hot: true,
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
  },
  module:{
    rules:[
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ]
  }
};