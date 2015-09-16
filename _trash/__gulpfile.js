/*
 var gulp = require('gulp');
 var gutil = require('gulp-util');
 var less = require('gulp-less');
 var path = require('path');

 gulp.task('styles', function() {
 gulp.src(['src/app/less/main.less'])
 .pipe(less())
 //.pipe(minifyCSS())
 .pipe(gulp.dest('app/css'))
 //.pipe(refresh(server))
 });

 gulp.task('default', ['styles']);
 */

var gulp = require('gulp');
var browserify = require('gulp-browserify');
var concat = require('gulp-concat');
var less = require('gulp-less');
var refresh = require('gulp-livereload');
var lr = require('tiny-lr');
var server = lr();
var minifyCSS = require('gulp-minify-css');
var embedlr = require('gulp-embedlr');
//var bower = require('gulp-main-bower-files');
var rename = require('gulp-rename');
var gulpFilter = require('gulp-filter');
var uglify = require('gulp-uglify');
var mainBowerFiles = require('gulp-main-bower-files');

var ignore = require('gulp-ignore');
var gutil = require('gulp-util');

//
// concat *.js to `vendor.js`
// and *.css to `vendor.css`
// rename fonts to `fonts/*.*`
//

var mainBowerFiles = require('main-bower-files');

gulp.task('bower', function () {
    var jsFilter = gulpFilter('**/*.js', {restore: true});
    return gulp.src(mainBowerFiles({
        paths: {
            bowerDirectory: './bower_components',
            bowerrc: './bowerrc',
            bowerJson: './bower.json',
            includeDev: true
        }
    }), {base: './bower_components'})
      .pipe(jsFilter)
      .pipe(ignore.exclude(["**/*.map"]))
      .pipe(concat('vendor.js'))
      .pipe(uglify().on('error', gutil.log))
      //.pipe(jsFilter.restore())
      .pipe(gulp.dest('app/js'))
});

//
var ngAnnotate = require('gulp-ng-annotate');
gulp.task('scripts', function () {
    gulp.src(['src/app/**/*.js'])
      //.pipe(ngAnnotate())
      //.pipe(browserify())
      .pipe(concat('deps.js'))
      .pipe(gulp.dest('app/js'))
      .pipe(refresh(server))
})

gulp.task('styles', function () {
    gulp.src(['src/app/less/main.less'])
      .pipe(less())
      .pipe(minifyCSS())
      .pipe(gulp.dest('app/css'))
      .pipe(refresh(server))
})

gulp.task('lr-server', function () {
    server.listen(35729, function (err) {
        if (err)
            return console.log(err);
    });
})

gulp.task('html', function () {
    gulp.src("src/app/*.html")
      .pipe(embedlr())
      .pipe(gulp.dest('app'))
      .pipe(refresh(server));
})

gulp.task('default', function () {
    gulp.run('lr-server', 'bower', 'scripts', 'styles', 'html');

    gulp.watch('src/app/**', function (event) {
        gulp.run('scripts');
    })

    gulp.watch('src/app/**', function (event) {
        gulp.run('styles');
    })

    gulp.watch('src/app/**/*.html', function (event) {
        gulp.run('html');
    })
})