var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
// We'll use mocha in this example, but any test framework will work
var mocha = require('gulp-mocha');

module.exports.add = function() {
    gulp.task('pre-test', function() {
        return gulp.src(['server/**/*.js', 'client/src/js/*.js', 'client/src/js/**/*.js'])
            // Covering files
            .pipe(istanbul())
            // Force `require` to return covered files
            .pipe(istanbul.hookRequire());
    });

    gulp.task('test', ['pre-test'], function() {
        return gulp.src(['server/test/*.js', 'client/test/*.js'])
            .pipe(mocha())
            // Creating the reports after tests ran
            .pipe(istanbul.writeReports())
            // Enforce a coverage of at least 90%
            .pipe(istanbul.enforceThresholds({
                // thresholds: {
                //     global: 70
                // }
            }));
    });
};
