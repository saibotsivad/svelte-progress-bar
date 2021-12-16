import npmRun from 'rollup-plugin-npm-run'
import resolve from '@rollup/plugin-node-resolve'
import svelte from 'rollup-plugin-svelte'

const watch = process.env.ROLLUP_WATCH

const plugins = [
	svelte({
		emitCss: false,
	}),
	resolve({
		browser: true,
	}),
]

const outputs = [
	'cjs',
	'es',
	'umd',
]

const outputExtras = {
	cjs: {
		exports: 'default',
	},
	umd: {
		name: 'ProgressBar',
	},
}

export default [
	{
		input: 'docs/app.js',
		output: {
			file: 'docs/build.js',
			format: 'iife',
		},
		plugins: watch
			? [ ...plugins, npmRun('start') ]
			: plugins,
	},
	...outputs.map(format => ({
		input: 'src/ProgressBar.svelte',
		output: {
			file: `dist/ProgressBar.${format}.js`,
			format,
			...(outputExtras[format] || {}),
		},
		plugins,
	})),
]
