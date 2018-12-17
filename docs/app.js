import Controls from './Controls.html'
import ProgressBar from '../ProgressBar.html'

const bar = new ProgressBar({
	target: document.querySelector('body'),
	data: {
		// you can either specify the color as a property here, or using CSS
		color: 'blue'
	}
})

// wire up the control buttons

new Controls({
	target: document.querySelector('#controls'),
	data: { bar }
})

bar.start()

setTimeout(() => {
	bar.complete()
}, 1600)
