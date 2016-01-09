'use strict'
import * as gulp from 'gulp'
import * as uglify from 'gulp-uglify'
import * as path from 'path'
import * as watch from 'gulp-watch'
import * as mocha from 'gulp-mocha'
import * as lint from 'gulp-tslint'
import * as gutil from 'gulp-util'
import * as istanbul from 'gulp-istanbul'
import * as typescript from 'gulp-typescript'
import config from './webpack.config'
const stylish = require('gulp-tslint-stylish')
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

const buildTest = (path?: string, destPath?: string) => {
  const Path = path ? [path] : [
    './src/**/*.ts',
    './mock/**/*.ts',
    './test/**/*.ts'
  ]
  let endPipe: any
  Path.forEach((item: string) => {
    const destDir = item.split('/')[1]
    destPath = destPath ? destPath : `./.tmp/${destDir}`
    endPipe = gulp.src(item)
    .pipe(typescript({
      module: 'commonjs',
      target: 'es5',
      isolatedModules: true
    }))
    .pipe(gulp.dest(destPath))
  })
  return endPipe
}

gulp.task('build.test', () => {
  return buildTest()
})

gulp.task('watch', (done: any) => {
  const watchPath = [
    './src/**/*.ts',
    './mock/**/*.ts',
    './test/**/*.ts'
  ]
  const specPath = './.tmp/**/*.js'
  watch(watchPath, (event) => {
    const sourcePath: string = event.path
    const dirLength = process.cwd().length
    const destDirArr = sourcePath.substr(dirLength + 1).split('/')
    destDirArr.pop()
    let dest = destDirArr.join('/')
    dest = path.join(process.cwd(), `.tmp/${dest}/`)
    buildTest(sourcePath, dest)
  })

  watch(specPath, () => {
    gulp.start('mocha')
    gulp.start('lint')
  })
})

gulp.task('pre-test', () => {
  return gulp.src([
    './.tmp/mock/**/*.js',
    './.tmp/src/**/*.js',
    '!./.tmp/**/index.js'
  ])
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
})

gulp.task('mocha', ['pre-test'], (done) => {
  let error = false
  const stream = gulp.src('./.tmp/test/index.js')
    .pipe(mocha({
      reporter: 'spec'
    }))
  stream.on('error', function() {
    gutil.log.apply(gutil, arguments)
    error = true
    this.emit('end')
  })
  if (error) {
    return stream
  }else {
    return stream.pipe(istanbul.writeReports())
  }
})

gulp.task('build', () => {
  const webpackConfig = Object.assign({}, config)
  webpackConfig.watch = false
  webpackConfig.entry = [
    'es6-promise',
    'whatwg-fetch',
    'es6-collections',
    path.join(process.cwd(), 'src/app.ts')
  ]
  delete webpackConfig.output.path
  return gulp.src('./src/app.ts')
    .pipe(webpack(webpackConfig))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'))
})

gulp.task('lint', () => {
  gulp.src([
    './mock/**/*.ts',
    './src/**/*.ts',
    './test/**/*.ts',
    './gulpfile.ts'
  ])
    .pipe(lint())
    .pipe(lint.report(stylish, <any>{
      emitError: false,
      sort: true,
      bell: true,
      fullPath: true
    }))
})
