const ProgressBar = require('../ProgressBar.html')

const progress = new ProgressBar({
	target: document.querySelector('#progress-bar')
})

progress.start()

// setTimeout(() => {
// 	progress.complete()
// }, 8000)
