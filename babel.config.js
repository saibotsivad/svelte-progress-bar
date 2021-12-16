module.exports = {
	plugins: [
		'@babel/plugin-transform-modules-umd'
	],
	presets: [
		[
			'@babel/env',
			{
				targets: '> 0.25%, not dead',
				useBuiltIns: 'usage',
			}
		]
	]
}
