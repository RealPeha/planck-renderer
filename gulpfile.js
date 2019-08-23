const gulp = require('gulp')
const server = require('browser-sync').create()
const clean = require('gulp-clean')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify-es').default

const path = {
    dist: './dist/',
    input: './lib/renderer.js',
    example: './example/**/*.*',
    public: './public/**/*.*',
}

const cleanDist = () => {
    return gulp.src(path.dist, { read: false })
        .pipe(clean());
}

const minify = () => {
    return gulp.src(path.input)
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min',
        }))
        .pipe(gulp.dest(path.dist));
}

const reload = (done) => {
    server.reload()
    done()
}

const serve = (done) => {
    server.init({
        server: {
            baseDir: "./",
            index: "./public/index.html"
        }
    })
    done()
}

const watch = () => {
    gulp.watch(path.input, gulp.series(minify, reload))
    gulp.watch([path.public, path.example], gulp.series(reload))
}

gulp.task('watch', gulp.series(serve, watch))
gulp.task('build', gulp.series(cleanDist, minify))
gulp.task('default', gulp.series(cleanDist, minify, serve, watch))