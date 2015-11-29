var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    del = require('del'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    rev = require('gulp-rev'),
    browserSync = require('browser-sync').create(),
    bower = require('gulp-bower'),
    inject = require('gulp-inject');

var config = { 
    sassPath: './src/style',
    jsPath: './src/scripts',
    imagePath: './src/images',
     bowerDir: './bower_components' 
}

var scriptsconfig = [
    config. bowerDir + '/jquery/dist/jquery.js',
    config. bowerDir + '/bootstrap-sass/javascripts/bootstrap.js',
    config. bowerDir + '/angular/angular.js',
    config. bowerDir + '/angular-animate/angular-animate.js',
    config. bowerDir + '/angular-aria/angular-aria.js',
    config. bowerDir + '/angular-cookies/angular-cookies.js',
    config. bowerDir + '/angular-messages/angular-messages.js',
    config. bowerDir + '/angular-resource/angular-resource.js',
    config. bowerDir + '/angular-route/angular-route.js',
    config. bowerDir + '/angular-sanitize/angular-sanitize.js',
    config. bowerDir + '/angular-touch/angular-touch.js',
    './src/app.js'
]

var cssconfig = [
    config.sassPath + '/main.scss'
]

var scssconfig = [
    config.bowerDir + '/bootstrap-sass/assets/stylesheets' ,
    config.bowerDir + '/font-awesome/scss'
]

var cleanpath = [
    'dist/fonts/**',
    'dist/images/**',
    'dist/scripts/**',
    'dist/styles/**',
    '.tmp/fonts/**',
    '.tmp/images/**',
    '.tmp/scripts/**',
    '.tmp/styles/**'
]

//clean all files
gulp.task('clean', function() {
    return del(cleanpath);
});

//styles compass
gulp.task('styles', function() {
    return gulp.src(cssconfig).pipe(sass({ 
                style: 'compressed',
                 loadPath: scssconfig
            }) 
            .on("error", notify.onError(function(error) { 
                return "Error: " + error.message; 
            })))  
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')) //自動加入前綴，提高瀏覽器支援
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe(notify({
            message: 'Styles task complete'
        }));
});

//scripts ugify
gulp.task('scripts', function() {

    return gulp.src(scriptsconfig)
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('.tmp/scripts'))
        .pipe(notify({
            message: 'Scripts task complete'
        }));
});

//images compress
gulp.task('images', function() {
    return gulp.src(config.imagePath + '/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('.tmp/images'))
        .pipe(notify({
            message: 'Images task complete'
        }));
});

//icons
gulp.task('icons', function() { 
    return gulp.src(config. bowerDir + '/font-awesome/fonts/**.*') 
        .pipe(gulp.dest('.tmp/fonts')); 
});

//build styles compass
gulp.task('build-styles', function() {
    return gulp.src(cssconfig)
        .pipe(sass({ 
                style: 'compressed',
                 loadPath: scssconfig
            }) 
            .on("error", notify.onError(function(error) { 
                return "Error: " + error.message; 
            })))  
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4')) //自動加入前綴，提高瀏覽器支援
        .pipe(concat('vendor.css'))
        .pipe(rev())
        .pipe(minifycss())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dist/styles'))
        .pipe(notify({
            message: 'build styles task complete'
        }));
});

//build scripts ugify
gulp.task('build-scripts', function() {

    return gulp.src(scriptsconfig)
        .pipe(concat('vendor.js'))
        .pipe(rev())
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('dist/scripts'))
        .pipe(notify({
            message: 'build scripts task complete'
        }));
});

//build images compress
gulp.task('build-images', function() {
    return gulp.src(config.imagePath + '/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(rev())
        .pipe(gulp.dest('dist/images'))
        .pipe(notify({
            message: 'build images task complete'
        }));
});

//icons
gulp.task('build-icons', function() { 
    return gulp.src(config. bowerDir + '/font-awesome/fonts/**.*') 
        .pipe(gulp.dest('dist/fonts')); 
});


//build app
gulp.task('build', ['clean', 'build-styles', 'build-scripts', 'build-images', 'build-icons'], function() {
    var target = gulp.src('./src/index.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths: 
    var sources = gulp.src(['./dist/scripts/**/*.js', './dist/styles/**/*.css'], {
        read: false,
    });

    return target.pipe(inject(sources, {

            // Do not add a root slash to the beginning of the path
            addRootSlash: false,

            // Remove the `public` from the path when doing the injection
            ignorePath: 'dist'
        }))
        .pipe(gulp.dest('dist'));

});

//run server
gulp.task('serve', ['clean', 'styles', 'scripts', 'images', 'icons'], function() {

    browserSync.init({
        server: {
            baseDir: ['./src/', './.tmp/']
        }
    });


    gulp.watch(config.sassPath + '/**/*.scss', ['styles']);
    gulp.watch(config.jsPath + '/**/*.js', ['scripts']);
    gulp.watch(config.imagePath + '/images/**/*', ['images']);

    gulp.watch(['./src/scripts/**', './src/styles/**', './src/image/**', './src/index.html'], [browserSync.reload]);

    var target = gulp.src('./src/index.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths: 
    var sources = gulp.src(['.tmp/scripts/**/*.js', '.tmp/styles/**/*.css'], {
        read: false
    });

    target.pipe(inject(sources, {

        // Do not add a root slash to the beginning of the path
        addRootSlash: false,

        // Remove the `public` from the path when doing the injection
        ignorePath: '.tmp'
    })).pipe(gulp.dest('src'));

});

gulp.task('default', ['serve']);