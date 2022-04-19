import FS from 'fs';
import gulp from 'gulp';

import typescript from 'gulp-typescript';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import sourceMap from 'gulp-sourcemaps';
//import gr2 from 'gulp-rollup-2';
// import rollup from 'gulp-rollup-each';
// import typescript from '@rollup/plugin-typescript';
// import nodeResolve from '@rollup/plugin-node-resolve';
// import commonjs from '@rollup/plugin-commonjs';
//import {terser} from 'rollup-plugin-terser';

function readJson(pathname) {
	return JSON.parse(FS.readFileSync(pathname));
}

const packageJson               = readJson('package.json');
const {task, src, series, dest} = gulp;
const TS_FILES                  = './src/**/*.ts';
const DTS_FILES                 = './ts-output/**/*.d.ts';
const JS_FILES                  = './ts-output/**/*.js';

const tsProject = typescript.createProject('tsconfig.json');
const banner    = `
/**
	singular
	@version ${packageJson.version}
 */
				`.trim();

task('ts-compile', done => {
	return src(TS_FILES)
		.pipe(tsProject())
		.pipe(dest('./ts-output'));
});

task('dts-copy', done => {
	return src(DTS_FILES)
		.pipe(dest('./dist'));
})

task('js-bundle', done => {
	return src(JS_FILES)
		.pipe(sourceMap.init())
		.pipe(babel({
			presets: [
				'@babel/preset-env'
			]
		}))
		// .pipe(
		// 	rollup(
		// 		{
		// 			output : {
		// 				name  : 'dash',
		// 				format: 'iife',
		// 				banner
		// 			},
		// 			context: 'window',
		// 			plugins: [
		// 				// terser()
		// 			]
		// 		}
		// 	)
		// )
		// .pipe(uglify())
		.pipe(sourceMap.write('./'))
		.pipe(dest('./dist'));
})

task('js-watch', done => {
	gulp.watch(TS_FILES, gulp.series('ts-compile', 'dts-copy'));
	gulp.watch(JS_FILES, gulp.parallel('js-bundle'));
	done();
});

task('js', series('ts-compile', 'dts-copy', 'js-bundle', 'js-watch'));

task('default', series('js'));
