import gulp from 'gulp';
import typescript from 'gulp-typescript';
import rollup from 'gulp-rollup-each';
import iifeNS from 'rollup-plugin-iife-namespace';
import FS from 'fs';

function readJson(pathname) {
	return JSON.parse(FS.readFileSync(pathname));
}

const packageJson = readJson('package.json');
const tsProject = typescript.createProject('tsconfig.json');
const {task, src, series, dest} = gulp;
const TS_FILES = './src/**/*.ts';
const DTS_FILES = './ts-output/**/*.d.ts';
const JS_FILES = './ts-output/**/*.js';


task('ts-compile', done => {
	return src(TS_FILES)
		.pipe(tsProject())
		.pipe(dest('./ts-output'));
})

task('dts-copy', done => {
	return src(DTS_FILES)
		.pipe(dest('./dist'));
})

task('js-bundle', done => {
	return src(JS_FILES)
		.pipe(rollup({
			output: {
				banner: `
/**
	dash.js
	the tiny framework for un-complex structure.
	@version ${packageJson.version}
 */
				`.trim(),
				name: 'dash',
				format: 'iife'
			},
			// plugins: [
			// 	iifeNS({
			// 		context:'window.dash'
			// 	})
			// ]
		}))
		.pipe(dest('./dist'));
})

task('js-watch', done => {
	gulp.watch(TS_FILES, gulp.series('ts-compile', 'dts-copy'));
	gulp.watch(JS_FILES, gulp.parallel('js-bundle'));
	done();
});

task('js', series('ts-compile', 'dts-copy', 'js-bundle', 'js-watch'));

task('default', series('js'));
