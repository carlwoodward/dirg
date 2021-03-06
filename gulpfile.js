// All build tasks
// ===============

var gulp = require('gulp');

// Build configurations.
var path = require('path');

var Config = {
  port:       4567,
  srcDir:     path.resolve('./src'),
  publicDir:  path.resolve('./public')
};

var handleErrors = function(err) {
  console.log(err)
  this.emit('end');
};

// SASS.
var sass = require('gulp-ruby-sass');

gulp.task('sass', function() {
  return sass(Config.srcDir + '/index.scss')
    .on('error', handleErrors)
    .pipe(gulp.dest(Config.publicDir))
});
// ---

// Autoprefixer.
var prefix = require('gulp-autoprefixer');

gulp.task('autoprefixer', ['sass'], function() {
  return gulp.src(Config.publicDir + '/index.css')
    .pipe(prefix("last 1 version", "ie 10"))
    .pipe(gulp.dest(Config.publicDir))
});

// Server.
var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');
var serve = serveStatic(Config.publicDir, {'index': ['index.html']});
var server = http.createServer(function(req, res) {
  var done = finalhandler(req, res);
  serve(req, res, done);
})

gulp.task('serve', function() {
  server.listen(Config.port)
});
// ---

// Deployment.
var shell = require('gulp-shell');

gulp.task('deploy', shell.task([
  'git checkout gh-pages',
  'git checkout master -- public .gitignore',
  'mv public/* .',
  'git add .',
  'git commit -m "Deployment"',
  'git push origin gh-pages',
  'git checkout master',
  'git clean -fd'
]));
// ---

// Watch.
gulp.task('watch', function() {
  gulp.watch(Config.srcDir + '/**', ['autoprefixer']);
});
// ---

gulp.task('build',   ['autoprefixer']);
gulp.task('default', ['build', 'watch', 'serve']);
