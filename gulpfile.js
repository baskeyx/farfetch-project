'use strict';

const gulp = require('gulp');
const fs = require('fs');
const rename = require('gulp-rename');
const fileinclude	= require('gulp-file-include');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const htmlmin = require('gulp-htmlmin');
const replace = require('gulp-replace');

gulp.task( 'translate' , function () {
  // get translations from json file and output these to dev
  var translations = JSON.parse(fs.readFileSync('./translations.json'));
  for (let i=0; i<translations.length;i++){
    let lang = "";
    if (translations[i].version !== "en") {
      lang = `-${translations[i].version}`;
    }

    let context = translations[i];

    gulp.src('*.html')
    .pipe( fileinclude({
	  	context
    }))
    .pipe(rename({ suffix: lang }))
    .pipe(gulp.dest('dev'));
  }
});

gulp.task('sass', function () {
  // sass and sourcemap
  gulp.src(['sass/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}))
    .on('error', function (err) {
        console.log(err.toString());
        this.emit('end');
    })
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dev/css/'))
    .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('browser-sync', function () {
  // view dev version
    browserSync.init({
        server: {
            baseDir: "./dev/"
        }
    });
});

gulp.task('copy-images', function (){
  // move images to dev
  gulp.src('img/*')
  .pipe(gulp.dest('dev/img'));
});

gulp.task('concat', function () {
  gulp.src('scripts/*.js')
    .pipe(concat('script.js'))
    .pipe(gulp.dest('dev/js'))
    .pipe(browserSync.stream({match: '**/*.js'}));
});

gulp.task('watch', function () {
  gulp.watch('sass/**', ['sass']);
  gulp.watch(['index.html','translations.json'], ['translate'])
  .on('change', browserSync.reload);
  gulp.watch('img/**', ['copy-images']);
  gulp.watch('scripts/**', ['concat']);
});

// minify JavaScript
gulp.task('compress-js', function () {
  gulp.src('dev/js/script.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('dist/js'))
});

gulp.task('compress-html', function (){
  gulp.src('dev/*.html')
    .pipe(replace('js/script.js', 'js/script.min.js'))
    .pipe(htmlmin({collapseWhitespace: true}))
    .on('error', function (err) {
        console.log(err.toString());
        this.emit('end');
    })
    .pipe(gulp.dest('dist'));
});

gulp.task('copy-prod-css', function (){
  gulp.src('dev/css/*')
  .pipe(gulp.dest('dist/css'));
});

gulp.task('copy-prod-img', function (){
  gulp.src('dev/img/*')
  .pipe(gulp.dest('dist/img'));
});

gulp.task('default', ['sass', 'translate', 'concat', 'copy-images', 'watch', 'browser-sync']);

gulp.task('build', ['compress-js', 'compress-html', 'copy-prod-css', 'copy-prod-img']);
