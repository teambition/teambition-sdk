'use strict'
import * as gulp from 'gulp'
import * as path from 'path'
import * as watch from 'gulp-watch'
import * as mocha from 'gulp-mocha'
import * as lint from 'gulp-tslint'
import * as istanbul from 'gulp-istanbul'
import * as typescript from 'gulp-typescript'
import * as sourcemaps from 'gulp-sourcemaps'
import {bundle} from './tools/tasks/bundle'
const stylish = require('gulp-tslint-stylish')

const buildConfigFile = path.join(process.cwd(), 'tools/build/bundle.json')

gulp.task('default', ['build.sdk'])

gulp.task('build.mock', (done) => {
  const entry = path.join(process.cwd(), 'mock/index.ts')
  const configFileName = path.join(process.cwd(), 'tools/build/mock.json')
  return bundle(entry, 'mock.js', configFileName, 'dist/mock', false, false, done)
})

const buildTest = (stream: NodeJS.ReadWriteStream) => {
  return stream.pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(typescript({
      module: 'commonjs',
      target: 'es5',
      isolatedModules: true
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./.tmp'))
}

gulp.task('build.test', () => {
  const stream = gulp.src([
    './**/*.ts',
    '!node_modules/**'
  ])
  return buildTest(stream)
})

const mochaRunner = (report: boolean) => {
  const stream = gulp.src('./.tmp/test/unit/index.js')
  .pipe(mocha({
    reporter: 'spec'
  }))
  stream.on('error', function(err: any) {
    this.emit('end')
  })
  if (!report) {
    return stream
  }else {
    return stream.pipe(istanbul.writeReports())
  }
}

gulp.task('watch', (done: any) => {
  return watch([
    './**/*.ts',
    '!./node_modules'
  ], () => {
    mochaRunner(false)
    gulp.start('lint')
  })
    .pipe(sourcemaps.init({
      loadMaps: true
    }))
    .pipe(typescript({
      module: 'commonjs',
      target: 'es5',
      isolatedModules: true
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./.tmp'))
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

gulp.task('test', ['pre-test'], (done: any) => {
  return mochaRunner(true)
})

gulp.task('build.sdk', (done) => {
  const entry = [
    'es6-promise',
    'whatwg-fetch',
    'es6-collections',
    path.join(process.cwd(), 'src/app.ts')
  ]
  const output = 'tbsdk.js'
  return bundle(entry, output, buildConfigFile, 'dist/bundle', false, false, done)
})

gulp.task('lint', () => {
  return gulp.src([
    '!./test/unit/mock/**/*.ts',
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
