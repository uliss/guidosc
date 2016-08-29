var gulp = require('gulp');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var pump = require('pump');
var rename = require('gulp-rename');
var pug = require('gulp-pug');
var bootlint = require('gulp-bootlint');
var htmllint = require('gulp-htmllint')
var gutil = require('gulp-util');
var merge = require('merge-stream');

module.exports.add = function() {
    gulp.task('jshint', function(cb) {
        pump([
            gulp.src([
                './src/js/*.js',
                './src/js/app/*.js',
                './src/js/modules/*.js',
                './src/js/widgets/*.js'
            ]),
            jshint(),
            jshint.reporter('jshint-stylish')
        ], cb);
    });

    gulp.task('jshint:watch', function() {
        gulp.watch([
            './src/js/*.js',
            './src/js/app/*.js',
            './src/js/modules/*.js',
            './src/js/widgets/*.js'
        ], ['jshint']);
    });

    gulp.task('sass', function(cb) {
        pump([
            gulp.src('./src/css/global.scss'),
            sourcemaps.init(),
            sass({
                outputStyle: 'compact'
            }),
            sourcemaps.write('.'),
            gulp.dest('./build/css')
        ], cb);
    });

    gulp.task('sass:watch', function() {
        gulp.watch('./src/css/*.scss', ['sass']);
    });

    gulp.task('browserify', function(cb) {
        pump([
            // { debug: true }
            browserify('src/js/main.js').transform('brfs').bundle(),
            source('bundle.js'),
            gulp.dest('./build/js')
        ], cb);
    });

    gulp.task('browserify:watch', function() {
        gulp.watch([
            './src/js/*.js',
            './src/js/app/*.js',
            './src/js/modules/*.js',
            './src/js/widgets/*.js',
            './src/js/widgets/tmpl/*.html'
        ], ['browserify']);
    });

    gulp.task('compressjs', function(cb) {
        pump([
            gulp.src('./build/js/bundle.js'),
            uglify(),
            rename({
                suffix: '.min'
            }),
            gulp.dest('./build/js')
        ], cb);
    });

    gulp.task('compressjs:watch', function() {
        gulp.watch('./build/js/bundle.js', ['compressjs']);
    });

    gulp.task('pug', function(cb) {
        pump([
            gulp.src(['./src/*.pug']),
            pug({
                pretty: true
            }),
            gulp.dest('./build')
        ], cb);
    });

    gulp.task('pug:watch', function() {
        gulp.watch(['./src/*.pug', './src/*/*.pug'], ['pug']);
    });

    gulp.task('bootlint', function() {
        return gulp.src('./build/*.html')
            .pipe(bootlint({
                loglevel: 'warning',
            }));
    });

    gulp.task('bootlint:watch', function() {
        gulp.watch('./build/*.html', ['bootlint']);
    });

    gulp.task('htmllint', function() {
        return gulp.src('./build/*.html')
            .pipe(htmllint({}, htmllintReporter));
    });

    gulp.task('htmllint:watch', function() {
        gulp.watch('./build/*.html', ['htmllint']);
    });

    function htmllintReporter(filepath, issues) {
        if (issues.length > 0) {
            issues.forEach(function(issue) {
                if (issue.code == "E011") {} else {
                    gutil.log(gutil.colors.cyan('[gulp-htmllint] ') + gutil.colors.white(filepath + ' [' + issue.line + ',' + issue.column + ']: ') + gutil.colors.red('(' + issue.code + ') ' + issue.msg));
                }
            });

            process.exitCode = 1;
        }
    }

    gulp.task('copy', ['copy_nexus', 'copy_tests', 'copy_bower',
        'copy_images', 'copy_opensans',
        'copy_bootstrap', 'copy_bootstrap_slider'
    ]);

    gulp.task('copy_nexus', function(cb) {
        pump([
            gulp.src(['../nexus/nexusUI/dist/*.js']),
            gulp.dest('./build/js/lib')
        ], cb);
    });

    gulp.task('copy_nexus:watch', function() {
        gulp.watch('../nexus/nexusUI/dist/*.js', ['copy_nexus']);
    });


    gulp.task('copy_tests:watch', function() {
        gulp.watch('./src/js/mocha_*.js', ['copy_tests']);
    });

    gulp.task('copy_tests', function(cb) {
        pump([
            gulp.src(['./src/js/mocha_*.js']),
            gulp.dest('./build/js/tests')
        ], cb);
    });

    gulp.task('copy_bower', function(cb) {
        pump([
            gulp.src([
                './bower_components/jquery/dist/jquery*.js'
            ]),
            gulp.dest('./build/js/lib')
        ], cb);
    });

    gulp.task('copy_images', function(cb) {
        pump([
            gulp.src([
                './src/css/cover-default.png'
            ]),
            gulp.dest('./build/css')
        ], cb);
    });

    gulp.task('copy_opensans', function() {
        var css = gulp.src(['./bower_components/open-sans-fontface/open-sans.css'])
            .pipe(gulp.dest('./build/css/open-sans'));

        var fonts = gulp.src(['./bower_components/open-sans-fontface/fonts/*/*.{ttf,woff,eof,svg,woff2}'])
            .pipe(gulp.dest('./build/css/open-sans/fonts'));

        return merge(css, fonts);
    });

    gulp.task('copy_bootstrap', function() {
        var fonts = gulp.src(['./bower_components/bootstrap-css/**/*.{js,css,map,ttf,eot,svg,woff,woff2}'])
            .pipe(gulp.dest('./build/css/bootstrap'));
    });

    gulp.task('copy_bootstrap_slider', function(cb) {
        var js = gulp.src('./bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider*.js')
            .pipe(gulp.dest('./build/js/lib'));

        var css = gulp.src(['./bower_components/seiyria-bootstrap-slider/dist/css/bootstrap-slider*.css']).
        pipe(gulp.dest('./build/css'));

        return merge([js, css]);
    });
};
