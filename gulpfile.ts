'use strict'
import * as gulp from 'gulp'
import * as uglify from 'gulp-uglify'
import * as path from 'path'
const config = require('./webpack.config')
const webpack = require('gulp-webpack')

const bundle = (watch: boolean, opts?: any) => {
  let webpackConfig = Object.assign({}, config)
  webpackConfig.entry = [
    'whatwg-fetch',
    path.join(process.cwd(), 'src/app.ts')
  ]
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
    .pipe(gulp.dest('./dist/'))
})

gulp.task('default', ['bundle.es6'])

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
