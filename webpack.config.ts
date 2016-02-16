import * as path from 'path'

export default {
  entry: [
    'whatwg-fetch',
    path.join(process.cwd(), 'test/app.ts')
  ],
  output: {
    filename: 'bundle.js',
    path: path.join(process.cwd(), 'test/')
  },
  preLoaders: [
    {test: /\.js?$/, loader: 'source-map'}
  ],
  resolve: {
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js'],
    alias: {
      'et-dependency': 'et-template/es5/dependency.js'
    }
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      },
      {
        test: /index\.html/,
        loader: 'file',
        query: {
          name: 'index.html'
        }
      },
      {
        test: /\.html/,
        loader: 'et'
      }
    ]
  },
  ts: {
    configFileName: path.join(process.cwd(), 'tools/build/bundle.json'),
    silent: true
  },
  devtool: 'inline-source-map',
  watch: false,
  devServer: {
    port: 8087
  },
  plugins: []
}
