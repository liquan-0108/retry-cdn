const path = require('path');

module.exports = {
  entry: './src/retry-cdn.js',
  output: {
   filename: 'retry-cdn.js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
    library:{
      name:'RetryCDN', // libName 为对外暴露的库名称
      type:'umd', // 定义模块运行的方式，将它的值设为umd
      export: 'default', // 将默认导出暴露给全局作用域,即可使用 new RetryCDN() 而不是用 new RetryCDN.default(params) 初始化
    }
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