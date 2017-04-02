const ProgressBar = require('../ProgressBar.html')

const progress = new ProgressBar({
	target: document.querySelector('#progress-bar')
})

progress.start()

// progress.set({ width: 0.5 })

// setTimeout(() => {
// 	progress.complete()
// }, 8000)
