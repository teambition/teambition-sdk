'use strict'
import * as gulp from 'gulp'
import * as uglify from 'gulp-uglify'
import * as path from 'path'
import * as watch from 'gulp-watch'
import * as mocha from 'gulp-mocha'
import config from './webpack.config'
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

gulp.task('build.mock', () => {
  const webpackConfig = Object.assign({}, config)
  webpackConfig.watch = false
  webpackConfig.entry = [
    path.join(process.cwd(), 'mock/index.ts')
  ]
  webpackConfig.output.filename = 'mock.js'
  webpackConfig.ts.configFileName = path.join(process.cwd(), 'tools/build/mock.json')
  delete webpackConfig.output.path
  return gulp.src('./mock/index.ts')
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('./dist/'))
})

gulp.task('build.test', () => {
  const webpackConfig = Object.assign({}, config)
  webpackConfig.watch = false
  webpackConfig.entry = [
    path.join(process.cwd(), 'test/index.ts')
  ]
  webpackConfig.output.filename = 'spec.js'
  webpackConfig.ts.configFileName = path.join(process.cwd(), 'tools/build/test.json')
  delete webpackConfig.output.path
  return gulp.src('./test/index.ts')
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('./.tmp/test'))
})

gulp.task('watch', (done: any) => {
  const watchPath = [
    './src/**/*.ts',
    './mock/**/*.ts',
    './test/**/*.ts'
  ]
  const specPath = './.tmp/test/spec.js'
  watch(watchPath, function() {
    gulp.start('build.test')
  })

  watch(specPath, () => {
    gulp.start('mocha', done)
  })
})

gulp.task('mocha', () => {
  gulp.src('./.tmp/test/spec.js')
    .pipe(mocha({
      reporter: 'spec'
    }))
    .on('error', (e: any) => {
      console.log(e)
    })
})

gulp.task('build', () => {
  const webpackConfig = Object.assign({}, config)
  webpackConfig.watch = false
  webpackConfig.entry = [
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
