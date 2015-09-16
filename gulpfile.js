var bowerPath = {
    dir: './bower_components',
    rc: './bowerrc',
    json: './bower.json'
}
var concatDepsJsPath = 'app/js';
var concatDepsJs = 'deps.js';

// Gulp
var gulp = require('gulp');
// Watcher
var watch = require('gulp-watch');

var connect = require('gulp-connect');
/*
 // LiveReload + Server
 var liveReload = require('gulp-livereload');
 var serve = require('gulp-serve');
 var refresh = require('gulp-livereload');
 var embedlr = require('gulp-embedlr');
 var lr = require('tiny-lr');
 var lrport = 35729;
 var server = lr();
 */

// Concatenate, Uglify, Annotate
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var mainBowerFiles = require('main-bower-files');
// Less / CSS
var less = require('gulp-less');
// Other Utilities
var rename = require('gulp-rename');
var moment = require('moment');
var notify = require('gulp-notify');
var gulpFilter = require('gulp-filter');
var ignore = require('gulp-ignore');
var gutil = require('gulp-util');
require('gulp-help')(gulp, {
    description: 'Help listing.'
});
/**
 *
 * Bower
 *
 * Output: app/js/deps.js
 * On: build only
 *
 */
gulp.task('bower', 'Concatenate main files from bower_components', function () {
    var jsFilter = gulpFilter('**/*.js', {restore: true});
    return gulp.src(mainBowerFiles({
        paths: {
            bowerDirectory: bowerPath.dir,
            bowerrc: bowerPath.rc,
            bowerJson: bowerPath.json,
            includeDev: true
        }
    }), {base: bowerPath.dir})
      .pipe(jsFilter)
      .pipe(ignore.exclude(["**/*.map"]))
      .pipe(concat(concatDepsJs))
      .pipe(uglify().on('error', gutil.log))
      //.pipe(jsFilter.restore())
      .pipe(gulp.dest(concatDepsJsPath))
});

/**
 *
 * Uglify JS
 *
 * Output: app/js/app.min.js
 * On: build / watch
 *
 */
gulp.task('uglify-js', 'Concat, Ng-Annotate, Uglify JavaScript into a single app.min.js.', function () {
    gulp.src(['src/app/js/**/*.js'])
      //gulp.src(['client/js/libraries/**/*.js', 'client/js/source/**/*.js'])
      .pipe(concat('app'))
      .pipe(ngAnnotate())
      .on('error', notify.onError("Error: <%= error.message %>"))
      .pipe(uglify())
      .on('error', notify.onError("Error: <%= error.message %>"))
      .pipe(rename({
          extname: ".min.js"
      }))
      .pipe(gulp.dest(concatDepsJsPath))
      .pipe(notify('Uglified JavaScript (' + moment().format('MMM Do h:mm:ss A') + ')'))
      .pipe(connect.reload());

});

/**
 *
 * Less Compiler
 *
 * Output: app/css/app.css
 * On: build / watch
 *
 */
gulp.task('less', 'Compile less into a single app.css.', function () {
    gulp.src(['src/app/less/main.less'])
      //gulp.src(['client/styles/bootstrap/bootstrap.less', 'client/styles/*.less'])
      .pipe(concat('app'))
      .pipe(less())
      .on('error', notify.onError("Error: <%= error.message %>"))
      .pipe(gulp.dest('app/css'))
      .pipe(notify('Compiled less (' + moment().format('MMM Do h:mm:ss A') + ')'))
      .pipe(connect.reload());
    ;
});




/**
 *
 * HTML
 *
 * Output: app/*.html
 * On: build / watch
 *
 */
gulp.task('html', function () {
    gulp.src("src/app/*.html")
      .pipe(gulp.dest('app'))
      .pipe(connect.reload());
});


gulp.task('connect', function () {
    connect.server({
        host: 'dev.pxs',
        root: 'app',
        livereload: true
    });
});

gulp.task('default', function () {
    gulp.run('bower', 'uglify-js', 'less', 'html');
})

gulp.task('watch', function () {
    gulp.run('uglify-js', 'less', 'html', 'connect');
    gulp.watch('src/**/*.js', function (event) {
        gulp.run('uglify-js');
    })

    gulp.watch('src/**/*.less', function (event) {
        gulp.run('less');
    })

    gulp.watch('src/**/*.html', function (event) {
        gulp.run('html');
    })
})