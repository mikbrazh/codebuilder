// The Gulp file by mikbrazh
// ВНИМАНИЕ!: только для Gulp 4
// ver: 2.1, удалено все лишнее. Наконец-то! :)
// Для предотвращения ошибок обработки Thumbs.db и *.DS_Store файлов, рекомендуется отключить создания данных файлов в политиках ОС

// ПЕРЕМЕННЫЕ ->
var syntax          = 'sass', // Установите значение «sass» или «scss» для работы с нужным синтаксисом
    srcFolder       = 'src',
    distFolder      = 'dist',
    localHostFolder = 'C:/OSPanel/domains/test.local'; // Директория локального сервера

var gulp          = require('gulp'),
    sass          = require('gulp-sass'),
    autoprefixer  = require('gulp-autoprefixer'),
    htmlmin       = require('gulp-htmlmin'),
    cleancss      = require('gulp-clean-css'),
    concat        = require('gulp-concat'),
    uglify        = require('gulp-uglify'),
    rename        = require('gulp-rename'),
    del           = require('del'),
    imagemin      = require('gulp-imagemin'),
    imageResize   = require('gulp-image-resize'),
    browserSync   = require('browser-sync'),
    rsync         = require('gulp-rsync'),
    notify        = require('gulp-notify');
// <- ПЕРЕМЕННЫЕ

// КОМПИЛЯЦИЯ, КОНКАТИНАЦИЯ, МИНИФИКАЦИЯ ->
// Минификация HTML и перенос в директорию distFolder
gulp.task('buildhtml', function() {
  return gulp.src(''+srcFolder+'/*.html')
    // .pipe(htmlmin({collapseWhitespace: true})) // Закомментируйте для отключения минификации
    .pipe(gulp.dest(distFolder))
    .pipe(browserSync.reload({ stream: true }));
});
// Компиляция SASS в CSS с использованием автопрефиксов
gulp.task('buildstyles', function() {
  return gulp.src(''+srcFolder+'/'+syntax+'/**/*.'+syntax+'')
  .pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError()))
  .pipe(rename({ suffix: '.min', prefix : '' }))
  .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7']))
  // .pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Закомментируйте для отключения минификации
  .pipe(gulp.dest(''+distFolder+'/css'))
  .pipe(browserSync.stream())
});
// Конкатинация и минификация JS
gulp.task('buildscripts', function() {
  return gulp.src([ // Укажите путь к js библиотекам
    ''+srcFolder+'/libs/jquery/dist/jquery.min.js',
    ''+srcFolder+'/libs/lazysizes/lazy.js',
    ''+srcFolder+'/js/common.js' // Укажите свой js файл. Всегда в конце
    ])
  .pipe(concat('scripts.min.js'))
  // .pipe(uglify()) // Закомментируйте для отключения минификации
  .pipe(gulp.dest(''+distFolder+'/js'))
  .pipe(browserSync.reload({ stream: true }))
});
// <- КОМПИЛЯЦИЯ, КОНКАТИНАЦИЯ, МИНИФИКАЦИЯ

// РАБОТА С ФАЙЛАМИ ->
// Копирование favicons
gulp.task('buildfav', function() {
  return gulp.src([''+srcFolder+'/fav/*.*', '!'+srcFolder+'/fav/Thumbs.db', '!'+srcFolder+'/fav/*.DS_Store'])
  .pipe(gulp.dest(distFolder));
});
// Удаление favicons
gulp.task('killfav', async () => {
  const deletedPaths = await del([''+distFolder+'/*.jpg', ''+distFolder+'/*.jpeg', ''+distFolder+'/*.png', ''+distFolder+'/*.ico', ''+distFolder+'/*.svg', ''+distFolder+'/browserconfig.xml', ''+distFolder+'/site.webmanifest']);
  console.log('Deleted files and directories:\n', deletedPaths.join('\n'));
});
// Копирование шрифтов
gulp.task('buildfonts', function() {
  return gulp.src(''+srcFolder+'/fonts/**/*')
    .pipe( gulp.dest(''+distFolder+'/fonts') );
});
// Удаление шрифтов
gulp.task('killfonts', async () => {
  const deletedPaths = await del(''+distFolder+'/fonts');
  console.log('Deleted files and directories:\n', deletedPaths.join('\n'));
});
// Копирование на локальный сервер
gulp.task('buildlocalhost', function() {
  return gulp.src([''+distFolder+'/**/*', '!'+distFolder+'/**/*/Thumbs.db', '!'+distFolder+'/**/*/*.DS_Store'])
    .pipe( gulp.dest(localHostFolder) );
});
// Удаление с локального сервера
gulp.task('killlocalhost', async () => {
  const deletedPaths = await del(localHostFolder, {force: true});
  console.log('Deleted files and directories:\n', deletedPaths.join('\n'));
});
// <- РАБОТА С ФАЙЛАМИ

// РАБОТА С ИЗОБРАЖЕНИЯМИ ->
// Сжатие и уменьшение размеров изображений с помощью GraphicsMagick (необходимо установить библиотеку GraphicsMagick)
gulp.task('buildimg1x', function() {
  return gulp.src([''+srcFolder+'/img/**/*.*', '!'+srcFolder+'/img/**/*/Thumbs.db', '!'+distFolder+'/img/**/*/*.DS_Store'])
  .pipe(rename({ suffix: '@1x', prefix : '' }))
  .pipe(imageResize({ width: '50%' }))
  .pipe(imagemin())
  .pipe(gulp.dest(''+distFolder+'/img/@1x/'))
});
gulp.task('buildimg2x', function() {
  return gulp.src([''+srcFolder+'/img/**/*.*', '!'+srcFolder+'/img/**/*/Thumbs.db', '!'+distFolder+'/img/**/*/*.DS_Store'])
  .pipe(rename({ suffix: '@2x', prefix : '' }))
  .pipe(imageResize({ width: '100%' }))
  .pipe(imagemin())
  .pipe(gulp.dest(''+distFolder+'/img/@2x/'))
});
gulp.task('buildimg', gulp.parallel('buildimg1x', 'buildimg2x'));

// Удаление изображений
gulp.task('killimg1x', async () => {
  const deletedPaths = await del(''+distFolder+'/img');
  console.log('Deleted files and directories:\n', deletedPaths.join('\n'));
});
gulp.task('killimg2x', async () => {
  const deletedPaths = await del(''+distFolder+'/img');
  console.log('Deleted files and directories:\n', deletedPaths.join('\n'));
});
gulp.task('killimg', gulp.parallel('killimg1x', 'killimg2x'));
// <- РАБОТА С ИЗОБРАЖЕНИЯМИ

// СИНХРОНИЗАЦИЯ И ХОСТИНГ ->
// HTML Live Reload
gulp.task('reloadhtml', function() {
  return gulp.src(''+distFolder+'/*.html')
  .pipe(browserSync.reload({ stream: true }))
});
// Синхронизация в браузере
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: distFolder
    },
    notify: false,
    // open: false, // Не открывать в браузере
    // online: false, // Принудительно указать, что отсутствует интернет соединение (для работы некоторых возможностей browserSync)
    // tunnel: true, tunnel: "projectname", // Размещение на демонстрационном хостинге http://projectname.localtunnel.me
  })
});
// Выгрузка проекта на хостинг
gulp.task('rsync', function() {
  return gulp.src(''+srcFolder+'/**')
  .pipe(rsync({
    root: ''+srcFolder+'/',
    hostname: 'username@yoursite.com',
    destination: 'yoursite/public_html/',
    // include: ['*.htaccess'], // Включить данные файлы в выгрузку на хостинг
    exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Исключить данные файлы из выгрузки на хостинг
    recursive: true,
    archive: true,
    silent: false,
    compress: true
  }))
});
// <- СИНХРОНИЗАЦИЯ И ХОСТИНГ

// СЛЕЖЕНИЕ ЗА ИЗМЕНЕНИЯМИ ФАЙЛОВ ->
gulp.task('watch', function() {
  gulp.watch(''+srcFolder+'/*.html', gulp.parallel('buildhtml'));
  gulp.watch(''+srcFolder+'/'+syntax+'/**/*.'+syntax+'', gulp.parallel('buildstyles'));
  gulp.watch(['libs/**/*.js', ''+srcFolder+'/js/common.js'], gulp.parallel('buildscripts'));
});
// <- СЛЕЖЕНИЕ ЗА ИЗМЕНЕНИЯМИ ФАЙЛОВ

// Таск по умолчанию
gulp.task('default', gulp.parallel('buildhtml', 'buildstyles', 'buildscripts', 'browser-sync', 'watch'));