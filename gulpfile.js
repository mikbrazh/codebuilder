// The Gulp file by mikbrazh
// version: 1.0.0
// ВНИМАНИЕ! Для предотвращения ошибок обработки Thumbs.db и *.DS_Store файлов, рекомендуется отключить создания данных файлов в политиках ОС

// ПЕРЕМЕННЫЕ.
// ======================================================================
var syntax          = 'sass', // Установите значение «sass» или «scss» для работы с нужным синтаксисом.
    gulpVersion     = '4', // Установите значения «3» или «4» для работы с нужной версией Gulp.
    useGM           = true, // Включить/Выключить использование GraphicsMagick для обработки изображений (необходимо установить библиотеку GraphicsMagick).
    srcFolder       = 'src',
    distFolder      = 'dist',
    localHostFolder = 'C:/OSPanel/domains/domain.local'; // Директория локального сервера


var gulp          = require('gulp'),
    sass          = require('gulp-sass'),
    autoprefixer  = require('gulp-autoprefixer'),
    htmlmin       = require('gulp-htmlmin'),
    cleancss      = require('gulp-clean-css'),
    concat        = require('gulp-concat'),
    uglify        = require('gulp-uglify'),
    rename        = require('gulp-rename'),
    del           = require('del'),
    newer         = require('gulp-newer'),
    imagemin      = require('gulp-imagemin'),
    imageResize   = require('gulp-image-resize'),
    browserSync   = require('browser-sync'),
    rsync         = require('gulp-rsync'),
    notify        = require('gulp-notify');


// КОМПИЛЯЦИЯ, КОНКАТИНАЦИЯ, МИНИФИКАЦИЯ.
// ======================================================================
// Минификация HTML и перенос в директорию distFolder.
gulp.task('buildhtml', function() {
  return gulp.src(''+srcFolder+'/*.html')
    // .pipe(htmlmin({collapseWhitespace: true})) // Закомментируйте для отключения минификации.
    .pipe(gulp.dest(distFolder))
    .pipe(browserSync.reload({ stream: true }));
});

// Компиляция SASS в CSS с использованием автопрефиксов.
gulp.task('buildstyles', function() {
  return gulp.src(''+srcFolder+'/'+syntax+'/**/*.'+syntax+'')
  .pipe(sass({ outputStyle: 'expand' }).on("error", notify.onError()))
  .pipe(rename({ suffix: '.min', prefix : '' }))
  .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7']))
  // .pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Закомментируйте для отключения минификации.
  .pipe(gulp.dest(''+distFolder+'/css'))
  .pipe(browserSync.stream())
});

// Конкатинация и минификация JS.
gulp.task('buildscripts', function() {
  return gulp.src([ // Укажите путь к js библиотекам.
    ''+srcFolder+'/libs/jquery/dist/jquery.min.js',
    ''+srcFolder+'/libs/lazysizes/lazy.js',
    ''+srcFolder+'/js/common.js' // Укажите свой js файл. Всегда в конце.
    ])
  .pipe(concat('scripts.min.js'))
  // .pipe(uglify()) // Закомментируйте для отключения минификации.
  .pipe(gulp.dest(''+distFolder+'/js'))
  .pipe(browserSync.reload({ stream: true }))
});


// РАБОТА С ФАЙЛАМИ.
// ======================================================================
// Удаление директории distFolder перед сборкой.
gulp.task('killdist', function() {
  return del.sync(distFolder);
});

// Удаление всех favicons в корне distFolder. Для обновления favicon, размещенных в корне сайта.
gulp.task('killfavicons', function() {
  return del.sync([''+distFolder+'/*.jpg', ''+distFolder+'/*.jpeg', ''+distFolder+'/*.png', ''+distFolder+'/*.ico', ''+distFolder+'/*.svg', ''+distFolder+'/browserconfig.xml', ''+distFolder+'/site.webmanifest']);
});

// Копирование favicons в корень сайта, кроме исключений.
gulp.task('copyfavicons', function() {
  return gulp.src([''+srcFolder+'/img/_fav/*.*', '!'+srcFolder+'/Thumbs.db', '!'+srcFolder+'/*.DS_Store'])
    .pipe(gulp.dest(distFolder));
});

// Удаление всех фалов в директории distFolder/fonts. Для обновления шрифтов.
gulp.task('killfonts', function() {
  return del.sync(''+distFolder+'/fonts/**/*');
});

// Копирование шрифтов в директорию distFolder/fonts. Для обновления шрифтов.
gulp.task('copyfonts', function() {
  return gulp.src(''+srcFolder+'/fonts/**/*')
    .pipe(gulp.dest(''+distFolder+'/fonts'));
});

// Удаление всех фалов в директории distFolder/img, кроме исключений. Для обновления изображений.
gulp.task('killimg', function() {
  return del.sync([''+distFolder+'/img/**/*', '!'+distFolder+'/img/**/*/Thumbs.db', '!'+distFolder+'/img/**/*/*.DS_Store']);
});

// Копирование корневых изображений в корень директории distFolder/img, кроме исключений. Для обновления изображений.
gulp.task('copyimg', function() {
  return gulp.src([''+srcFolder+'/img/**/*', '!'+srcFolder+'/img/{_*,_*/**}', '!'+srcFolder+'/img/Thumbs.db', '!'+srcFolder+'/img/*.DS_Store'])
    .pipe(gulp.dest(''+distFolder+'/img'));
});

// Удаление всех файлов в корне сайта, кроме исключений.
gulp.task('killroot', function() {
  return del.sync([''+distFolder+'/*.*', '!'+distFolder+'/index.html', '!'+distFolder+'/Thumbs.db', '!'+distFolder+'/*.DS_Store']);
});

// Копирование всех файлов в корне сайта, кроме исключений.
gulp.task('copyroot', function() {
  return gulp.src([''+srcFolder+'/*.*', '!'+srcFolder+'/index.html', '!'+srcFolder+'/Thumbs.db', '!'+srcFolder+'/*.DS_Store'])
    .pipe(gulp.dest(distFolder));
});

// Копирование содержимого директории distFolder в директорию локального сервера, кроме исключений. Для тестирования на локальном сервере.
gulp.task('copytolocalhost', function() {
  return gulp.src([' '+distFolder+' /**/*', '!'+distFolder+'/**/*/Thumbs.db', '!'+distFolder+'/**/*/*.DS_Store'])
    .pipe( gulp.dest(localHostFolder) );
});


// СИНХРОНИЗАЦИЯ И ХОСТИНГ.
// ======================================================================
// HTML Live Reload
gulp.task('reloadhtml', function() {
  return gulp.src(''+distFolder+'/*.html')
  .pipe(browserSync.reload({ stream: true }))
});

// Синхронизация в браузере.
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: distFolder
    },
    notify: false,
    // open: false, // Не открывать в браузере.
    // online: false, // Принудительно указать, что отсутствует интернет соединение (для работы некоторых возможностей browserSync).
    // tunnel: true, tunnel: "projectname", // Размещение на демонстрационном хостинге http://projectname.localtunnel.me.
  })
});

// Выгрузка проекта на хостинг.
gulp.task('rsync', function() {
  return gulp.src(''+srcFolder+'/**')
  .pipe(rsync({
    root: ''+srcFolder+'/',
    hostname: 'username@yoursite.com',
    destination: 'yoursite/public_html/',
    // include: ['*.htaccess'], // Включить данные файлы в выгрузку на хостинг.
    exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Исключить данные файлы из выгрузки на хостинг.
    recursive: true,
    archive: true,
    silent: false,
    compress: true
  }))
});


// РАБОТА С ИЗОБРАЖЕНИЯМИ.
// ======================================================================
// Сжатие и уменьшение размеров изображений с помощью GraphicsMagick (необходимо установить библиотеку GraphicsMagick).
gulp.task('buildimg1x', function() {
  return gulp.src([''+srcFolder+'/img/_src/**/*.*', '!'+srcFolder+'/img/_src/**/*/Thumbs.db', '!'+distFolder+'/img/_src/**/*/*.DS_Store'])
  .pipe(newer(''+distFolder+'/img/@1x'))
  .pipe(rename({ suffix: '@1x', prefix : '' }))
  .pipe(imageResize({ width: '50%' }))
  .pipe(imagemin())
  .pipe(gulp.dest(''+distFolder+'/img/@1x/'))
});
gulp.task('buildimg2x', function() {
  return gulp.src([''+srcFolder+'/img/_src/**/*.*', '!'+srcFolder+'/img/_src/**/*/Thumbs.db', '!'+distFolder+'/img/_src/**/*/*.DS_Store'])
  .pipe(newer(''+distFolder+'/img/@1x'))
  .pipe(rename({ suffix: '@2x', prefix : '' }))
  .pipe(imageResize({ width: '100%' }))
  .pipe(imagemin())
  .pipe(gulp.dest(''+distFolder+'/img/@2x/'))
});

// Копирование изображений в папку проекта. В случае, когда отключен GM.
gulp.task('copyimg1x', function() {
  return gulp.src([''+srcFolder+'/img/_src/**/*.*', '!'+srcFolder+'/img/_src/**/*/Thumbs.db', '!'+distFolder+'/img/_src/**/*/*.DS_Store'])
  .pipe(newer(''+distFolder+'/img/@1x'))
  .pipe(rename({ suffix: '@1x', prefix : '' }))
  .pipe(gulp.dest(''+distFolder+'/img/@1x/'))
});
gulp.task('copyimg2x', function() {
  return gulp.src([''+srcFolder+'/img/_src/**/*.*', '!'+srcFolder+'/img/_src/**/*/Thumbs.db', '!'+distFolder+'/img/_src/**/*/*.DS_Store'])
  .pipe(newer(''+distFolder+'/img/@2x'))
  .pipe(rename({ suffix: '@2x', prefix : '' }))
  .pipe(gulp.dest(''+distFolder+'/img/@2x/'))
});


// ОПРЕДЕЛЕНИЕ ВЕРСИИ GULP И ЗАПУСК ТАСКОВ.
// ======================================================================
// Если Gulp 3.
if (gulpVersion == 3) {

  var taskArr = [];

  if (useGM == true) {
    taskArr = ['killroot', 'killfavicons', 'killfonts', 'killimg', 'copyroot', 'copyfavicons', 'copyfonts', 'copyimg', 'buildimg', 'buildhtml', 'buildstyles', 'buildscripts', 'browser-sync'];
  }
  else if (useGM == false) {
    taskArr = ['killroot', 'killfavicons', 'killfonts', 'killimg', 'copyroot', 'copyfavicons', 'copyfonts', 'copyimg', 'copyimgx', 'buildhtml', 'buildstyles', 'buildscripts', 'browser-sync'];

  }

  // Запуск тасков обработки изображений (стиль Gulp 3).
  gulp.task('buildimg', ['buildimg1x', 'buildimg2x']);
  gulp.task('copyimgx', ['copyimg1x', 'copyimg2x']);

  // Слежение за изменениями файлов (стиль Gulp 3).
  gulp.task('watch', taskArr, function() {
    gulp.watch(''+srcFolder+'/*.html', ['buildhtml']);
    gulp.watch(''+srcFolder+'/'+syntax+'/**/*.'+syntax+'', ['buildstyles']);
    gulp.watch(['libs/**/*.js', ''+srcFolder+'/js/common.js'], ['buildscripts']);
    gulp.watch(''+srcFolder+'/img/*.*', ['copyimg']);
    useGM && gulp.watch(''+srcFolder+'/img/_src/**/*', ['buildimg']); // Если разрешено (useGM == true), GraphicsMagick следит за изменениями изображений.
  });

  // Таск по умолчанию для Gulp 3.
  gulp.task('default', ['watch']);

};

// Если Gulp 4 
if (gulpVersion == 4) {

  // Запуск тасков обработки изображений (стиль Gulp 4).
  gulp.task('buildimg', gulp.parallel('buildimg1x', 'buildimg2x'));
  gulp.task('copyimgx', gulp.parallel('copyimg1x', 'copyimg2x'));

  // Слежение за изменениями файлов (стиль Gulp 4).
  gulp.task('watch', function() {
    gulp.watch(''+srcFolder+'/*.html', gulp.parallel('buildhtml'));
    gulp.watch(''+srcFolder+'/'+syntax+'/**/*.'+syntax+'', gulp.parallel('buildstyles'));
    gulp.watch(['libs/**/*.js', ''+srcFolder+'/js/common.js'], gulp.parallel('buildscripts'));
    gulp.watch(''+srcFolder+'/img/*.*', gulp.parallel('copyimg'));
    useGM && gulp.watch(''+srcFolder+'/img/_src/**/*', gulp.parallel('buildimg')); // Если разрешено (useGM == true), GraphicsMagick следит за изменениями изображений.
  });

  // Таск по умолчанию для Gulp 4.
  useGM ? gulp.task('default', gulp.parallel('killroot', 'killfavicons', 'killfonts', 'killimg', 'copyroot', 'copyfavicons', 'copyfonts', 'copyimg', 'buildimg', 'buildhtml', 'buildstyles', 'buildscripts', 'browser-sync', 'watch'))
        : gulp.task('default', gulp.parallel('killroot', 'killfavicons', 'killfonts', 'killimg', 'copyroot', 'copyfavicons', 'copyfonts', 'copyimg', 'copyimgx', 'buildhtml', 'buildstyles', 'buildscripts', 'browser-sync', 'watch'));
};