/* browserify task
   ---------------
   Bundle javascripty things with browserify!

   If the watch task is running, this uses watchify instead
   of browserify for faster bundling using caching.
*/

var browserify   = require('browserify');
var watchify     = require('watchify');
var bundleLogger = require('../util/bundleLogger');
var gulp         = require('gulp');
var mocha = require('gulp-mocha');
var handleErrors = require('../util/handleErrors');
var source       = require('vinyl-source-stream');
var uglify       = require('gulp-uglify');
var streamify    = require('gulp-streamify');

gulp.task('browserify', function() {

  var bundleMethod = global.isWatching ? watchify : browserify;

  var bundler = bundleMethod({
    entries: ['./src/javascript/app.js'],
    extensions: ['.js', '.hbs'],
    debug: true
  });

  var bundle = function() {
    bundleLogger.start();

    return bundler
      .bundle()
      .on('error', handleErrors)
      .pipe(source('app.js'))
      // .pipe(streamify(uglify()))
      .pipe(gulp.dest('./build/'))
      .on('end', bundleLogger.end);
  };

  if(global.isWatching) {
    bundler.on('update', bundle);
  }

  return bundle();
});
