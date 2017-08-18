var gulp = require('gulp'),
	minifycss = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat')
	rename = require('gulp-rename'),
	pump = require('pump');
gulp.task('addJquery',function(){
	return gulp
			.src('node_modules/jquery/dist/jquery.min.js')
			.pipe(gulp.dest('dist/js'));
});
gulp.task('minifyjs',function(cb){
	pump([
			gulp.src('src/*.js'),
			gulp.dest('dist/js'),
			uglify(),
			rename({suffix: '.min'}),
			gulp.dest('dist/js')
		],cb);
});

gulp.task('minifycss',function(){
	return gulp
			.src('src/*.css')
			.pipe(gulp.dest('dist/css'))
			.pipe(minifycss())
			.pipe(rename({suffix: '.min'}))
			.pipe(gulp.dest('dist/css'));
});
gulp.task('movehtml',function(){
	return gulp
			.src('src/*.html')
			.pipe(gulp.dest('dist'));
});
gulp.task('build',['addJquery','minifycss','minifyjs','movehtml']);

gulp.task('watch',['build'],function(){
	gulp.watch(['node_modules/jquery/dist/*.min.js','src/*.js','src/*.css','src/*.html'],['build']);
});

gulp.task('default',['build','watch']);