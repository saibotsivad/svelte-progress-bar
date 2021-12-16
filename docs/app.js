import Controls from './Controls.svelte'
import ProgressBar from '../src/ProgressBar.svelte'

const bar = new ProgressBar({
	target: document.querySelector('body'),
	props: {
		// you can either specify the color as a property here, or using CSS
		color: 'blue'
	}
})

// wire up the control buttons

new Controls({
	target: document.querySelector('#controls'),
	props: { bar }
})

bar.start()

// setTimeout(() => {
// 	bar.complete()
// }, 1000)
