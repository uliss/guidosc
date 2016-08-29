var gulp = require('gulp');
var tasks = require('./gulp');

tasks.add();

gulp.task('build', ['copy', 'jshint', 'browserify', 'compressjs', 'pug', 'sass', 'bootlint', 'htmllint']);
gulp.task('default', ['build', 'watch']);
gulp.task('watch', [
    'jshint:watch',
    'copy_nexus:watch',
    'copy_tests:watch',
    'sass:watch',
    'browserify:watch',
    'compressjs:watch',
    'pug:watch',
    'bootlint:watch',
    'htmllint:watch']);
