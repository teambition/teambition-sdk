'use strict'
import * as path from 'path'
import * as gutil from 'gulp-util'
import config from '../../webpack.config'
const webpack = require('webpack')

export const bundle = (entry: any, output: string, tsconfig?: string, outputDir?: string, watch?: boolean, minify?: boolean, callback?: any) => {
  let webpackConfig = Object.assign<{[index: string]: any}, typeof config>({}, config)
  let plugins = []
  if (minify) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      mangle: {
        except: ['$super', '$', 'exports', 'require']
      },
      compress: {
        warnings: false
      }
    }))
    delete webpackConfig.devtool
  }
  if (tsconfig) {
    webpackConfig.ts.configFileName = tsconfig
  }
  webpackConfig.entry = entry
  webpackConfig.plugins = plugins
  webpackConfig.output.path = path.join(process.cwd(), outputDir || 'dist')
  webpackConfig.output.filename = output
  webpackConfig.watch = watch
  return webpack(webpackConfig, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack', err)
    }
    gutil.log('[webpack]', stats.toString())
    callback()
  })
}