import gulp from 'gulp';
import yargs from 'yargs';
import sass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import gulpif from 'gulp-if';
import sourcemaps from 'gulp-sourcemaps';
import imagemin from 'gulp-imagemin';
import del from 'del';
import gulpWebpack from 'webpack-stream';
import named from 'vinyl-named';
import browserSync from 'browser-sync';
import zip from 'gulp-zip';
import replace from 'gulp-replace';
import info from './package.json';

const server = browserSync.create();
const URL = 'http://base.local/';
const themePlaceholder = '_themename';

const prod = yargs.argv.prod;

const paths = {
  styles: {
    src: ['assets/scss/main.scss', 'assets/scss/admin.scss'],
    dest: 'dist/assets/css',
  },
  images: {
    src: 'assets/images/**/*.{jpg,jpeg,png,svg,gif}',
    dest: 'dist/assets/images',
  },
  scripts: {
    src: ['assets/js/bundle.js', 'assets/js/admin.js'],
    dest: 'dist/assets/js',
  },
  copy: {
    src: [
      'assets/**/*',
      '!assets/{images,js,scss}',
      '!assets/{images,js,scss}/**/*',
    ],
    dest: 'dist/assets',
  },
  package: {
    src: [
      '**/*',
      '!.vscode',
      '!node_modules{,/**}',
      '!packaged{,/**}',
      '!assets{,/**}',
      '!.gitnore',
      '!.babelrc',
      '!gulpfile.babel.js',
      '!package.json',
      '!package-lock.json',
      '!tsconfig.json',
    ],
    dest: 'packaged',
  },
};

export const serve = (done) => {
  server.init({
    proxy: URL,
  });
  done();
};

export const refresh = (done) => {
  server.reload();
  done();
};

export const clean = () => del(['dist']);

export const styles = () => {
  return gulp
    .src(paths.styles.src)
    .pipe(gulpif(!prod, sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulpif(prod, cleanCSS({ compatibility: 'ie8' })))
    .pipe(gulpif(!prod, sourcemaps.write()))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(server.stream());
};

export const images = () => {
  return gulp
    .src(paths.images.src)
    .pipe(gulpif(prod, imagemin()))
    .pipe(gulp.dest(paths.images.dest));
};

export const copy = () => {
  return gulp.src(paths.copy.src).pipe(gulp.dest(paths.copy.dest));
};

export const scripts = () => {
  return gulp
    .src(paths.scripts.src)
    .pipe(named())
    .pipe(
      gulpWebpack({
        module: {
          rules: [
            {
              test: /\.tsx?$/,
              use: 'ts-loader',
              exclude: /node_modules/,
            },
            {
              test: /\.js$/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env'],
                },
              },
              exclude: /node_modules/,
            },
          ],
        },
        resolve: {
          extensions: ['.tsx', '.ts', '.js'],
        },
        externals: {
          jquery: 'jQuery',
        },
        output: {
          filename: '[name].js',
        },
        devtool: !prod ? 'source-map' : false,
        mode: prod ? 'production' : 'development',
      })
    )
    .pipe(gulp.dest(paths.scripts.dest));
};

export const watch = () => {
  gulp.watch('assets/scss/**/*.scss', styles);
  gulp.watch('**/*.php', refresh);
  gulp.watch(paths.images.src, gulp.series(images, refresh));
  gulp.watch('assets/js/**/*.{js,ts}', gulp.series(scripts, refresh));
  gulp.watch(paths.copy.src, gulp.series(copy, refresh));
};

export const compress = () => {
  return gulp
    .src(paths.package.src)
    .pipe(replace(themePlaceholder, info.name.replace('-', '_')))
    .pipe(zip(`${info.name}.zip`.replace('-', '_')))
    .pipe(gulp.dest(paths.package.dest));
};

export const build = gulp.series(
  clean,
  gulp.parallel(styles, images, scripts, copy)
);

export const dev = gulp.series(
  clean,
  gulp.parallel(styles, images, scripts, copy),
  serve,
  watch
);

export const bundle = gulp.series(build, compress);

export default build;
