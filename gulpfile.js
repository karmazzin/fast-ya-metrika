'use strict';

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-*']
});
var runSequence = require('run-sequence');

var path = {
    build: {
        dir: 'build/',
        jsBowerfile: 'libs.js',
        jsAppfile: 'apps.js'

    },
    src: {
        js: 'src/**/*.js'
    }
};

gulp.task('bower:install', function() {
    return plugins.bower();
});

gulp.task('bower:build', function(){
    gulp.src(plugins.mainBowerFiles())
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.uglify())
        .pipe(plugins.concat(path.build.jsBowerfile))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(path.build.dir))
});

gulp.task('js:build', function(){
    gulp.src(path.src.js)
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.uglify())
        .pipe(plugins.concat(path.build.jsAppfile))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(path.build.dir))
});

gulp.task('install', [
    'bower:install'
]);

gulp.task('build', [
    'bower:build',
    'js:build'

]);

gulp.task('watch', function(){
    plugins.watch([path.src.js], function(event, cb) {
        gulp.start('js:build');
    });
});

gulp.task('default', function() {
    runSequence('install', 'build', 'watch');
});
