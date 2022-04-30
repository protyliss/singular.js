import {build} from 'esbuild';
import {dtsPlugin} from 'esbuild-plugin-d.ts';
import {copy} from 'esbuild-plugin-copy';

const logLevel = 'debug';
const minify   = true;

function builds(name) {
	const entryPoints = [`./src/${name}.ts`];
	const globalName  = name.replace(/-([^\-.]+)/g, '["$1"]');
	build({
		entryPoints,
		outfile: `./dist/${name}.js`,
		format : 'iife',
		minify,
		globalName,
		logLevel,
		plugins: [
			dtsPlugin()
		]
	})
		.then();

	build({
		entryPoints,
		outfile: `./dist/esm/${name}.js`,
		logLevel,
		minify,
		plugins: [
			copy({
				assets: {
					from: ['./dist/*.d.ts'],
					to  : ['./esm']
				}
			})
		]
	})
		.then()
}

builds('singular');
builds('singular-ui');
