'use strict'
import * as gulp from 'gulp'
import * as babel from 'gulp-babel'
import * as sourcemaps from 'gulp-sourcemaps'
import * as watch from 'gulp-watch'
import * as uglify from 'gulp-uglify'
import * as path from 'path'
const config = require('./webpack.config')
const Webpack = require('webpack')
const webpack = require('gulp-webpack')
const webpackDevServer = require('webpack-dev-server')
const sequence = require('gulp-sequence')
const batch = require('batch')

const bundle = (watch: boolean, opts?: any) => {
  let webpackConfig = Object.assign({}, config)
  webpackConfig = Object.assign(webpackConfig, opts)
  webpackConfig.watch = watch
  delete webpackConfig.output.path
  return gulp.src('./src/app.ts')
  .pipe(webpack(
    webpackConfig
  ))
}

gulp.task('bundle.es6', () => {
  return bundle(false)
    .pipe(gulp.dest('./test/'))
})

gulp.task('default', sequence('bundle.es6'))

gulp.task('build', () => {
  const webpackConfig = config
  webpackConfig.watch = false
  config.entry = [
    'es6-promise',
    'whatwg-fetch',
    path.join(process.cwd(), 'src/app.ts')
  ]
  delete webpackConfig.output.path
  return gulp.src('./src/app.ts')
  .pipe(webpack(webpackConfig))
  .pipe(uglify())
  .pipe(gulp.dest('./dist/'))
})
