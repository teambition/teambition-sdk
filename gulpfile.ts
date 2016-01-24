'use strict'
import * as gulp from 'gulp'
import * as path from 'path'
import * as watch from 'gulp-watch'
import * as mocha from 'gulp-mocha'
import * as lint from 'gulp-tslint'
import * as gutil from 'gulp-util'
import * as istanbul from 'gulp-istanbul'
import * as typescript from 'gulp-typescript'
import config from './webpack.config'
const webpack = require('webpack')
const stylish = require('gulp-tslint-stylish')

const buildConfigFile = path.join(process.cwd(), 'tools/build/bundle.json')

const bundle = (entry: any, output: string, minify: boolean, tsconfig?: string, callback?: any) => {
  let webpackConfig: any = Object.assign({}, config)
  let plugins = []
  if (minify) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      mangle: {
        except: ['$super', '$', 'exports', 'require']
      }
    }))
  }
  if (tsconfig) {
    webpackConfig.ts.configFileName = tsconfig
  }
  webpackConfig.entry =  entry
  webpackConfig.plugins = plugins
  delete webpackConfig.output.path
  webpackConfig.output.filename = `dist/${output}`
  return webpack(webpackConfig, (err, stats) => {
    if (err) {
      throw new gutil.PluginError('webpack', err)
    }
    gutil.log('[webpack]', stats.toString())
    callback()
  })
}

gulp.task('bundle.es6', (done) => {
  const entry = [
    'whatwg-fetch',
    path.join(process.cwd(), 'src/app.ts')
  ]
  return bundle(entry, 'tbsdk.js', false, buildConfigFile, done)
})

gulp.task('default', ['bundle.es6'])

gulp.task('build.mock', (done) => {
  const entry = path.join(process.cwd(), 'mock/index.ts')
  const configFileName = path.join(process.cwd(), 'tools/build/mock.json')
  return bundle(entry, 'mock.js', false, configFileName, done)
})

const buildTest = (path?: string, destPath?: string) => {
  const Path = path ? [path] : [
    './src/**/*.ts',
    './mock/**/*.ts',
    './test/**/*.ts'
  ]
  let endPipe: NodeJS.ReadWriteStream
  Path.forEach((item: string) => {
    const destDir = item.split('/')[1]
    const dest = destPath ? destPath : `./.tmp/${destDir}`
    endPipe = gulp.src(item)
    .pipe(typescript({
      module: 'commonjs',
      target: 'es5',
      isolatedModules: true
    }))
    .pipe(gulp.dest(dest))
  })
  return endPipe
}

gulp.task('build.test', () => {
  return buildTest()
})

const mochaRunner = (report: boolean) => {
  const stream = gulp.src('./.tmp/test/index.js')
  .pipe(mocha({
    reporter: 'spec'
  }))
  stream.on('error', function(err: any) {
    console.error(err)
    this.emit('end')
  })
  if (!report) {
    return stream
  }else {
    return stream.pipe(istanbul.writeReports())
  }
}

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
    mochaRunner(false)
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

gulp.task('test', ['pre-test'], (done: any) => {
  return mochaRunner(true)
})

gulp.task('build', (done) => {
  const entry = [
    'es6-promise',
    'whatwg-fetch',
    'es6-collections',
    path.join(process.cwd(), 'src/app.ts')
  ]
  const output = 'tbsdk.min.js'
  bundle(entry, output, true, buildConfigFile, done)
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
