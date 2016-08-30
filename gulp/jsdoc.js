var gulp = require('gulp');
var jsdoc = require('gulp-jsdoc3');

module.exports.add = function() {
    gulp.task('doc', function(cb) {
        gulp.src(['./server/src/*.js'], {
                read: false
            })
            .pipe(jsdoc(cb));
    });
};
