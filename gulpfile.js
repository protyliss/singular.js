import gulp from 'gulp';
//import gr2 from 'gulp-rollup-2';
import rollup from 'gulp-rollup-each';
import typescript from 'gulp-typescript';
// import typescript from '@rollup/plugin-typescript';
// import nodeResolve from '@rollup/plugin-node-resolve';
// import commonjs from '@rollup/plugin-commonjs';
import babel from 'gulp-babel';
import {terser} from 'rollup-plugin-terser';
import FS from 'fs';

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
	dash.js
	the tiny framework for un-complex structure.
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
		.pipe(dest('./dist'));
})

task('js-watch', done => {
	gulp.watch(TS_FILES, gulp.series('ts-compile', 'dts-copy'));
	gulp.watch(JS_FILES, gulp.parallel('js-bundle'));
	done();
});

task('js', series('ts-compile', 'dts-copy', 'js-bundle', 'js-watch'));

task('default', series('js'));
