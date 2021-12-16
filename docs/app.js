import App from './App.svelte'

const app = new App({
	target: document.querySelector('#controls'),
})

app.start()

setTimeout(() => {
	app.complete()
}, 3000)
