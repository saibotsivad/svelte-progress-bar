const Controls = require('./Controls.html')
const ProgressBar = require('../ProgressBar.html')

const bar = new ProgressBar({
	target: document.querySelector('#progress-bar'),
	data: {
		// you can either specify the color as a property here, or using CSS
		color: 'blue'
	}
})

new Controls({
	target: document.querySelector('#controls'),
	data: { bar }
})

bar.start()

setTimeout(() => {
	bar.complete()
}, 1600)
