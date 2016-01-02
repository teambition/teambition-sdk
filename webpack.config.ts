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
    extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts-loader'
      }
    ]
  },
  ts: {
    configFileName: path.join(process.cwd(), 'tools/build/bundle.json'),
    silent: true
  },
  devtool: 'inline-source-map',
  watch: true,
  devServer: {
    port: 8087
  }
}
