require('register-svelte-require')(require('svelte'))
const test = require('tape')
const delay = require('delay')
const { JSDOM } = require('jsdom')

const ProgressBar = require('./ProgressBar.html')

const dom = new JSDOM()
global.window = dom.window
global.document = dom.window.document

test('initialized it does not have width', t => {
	const bar = new ProgressBar({
		data: { intervalTime: 15 }
	})
	t.equal(bar.get().width, undefined)
	delay(50)
		.then(() => {
			t.equal(bar.get().width, undefined)
			t.end()
		})
})

test('setting a width does not start auto incrementing', t => {
	const bar = new ProgressBar({
		target: document.querySelector('body'),
		data: { intervalTime: 15 }
	})
	bar.setWidthRatio(0.5)
	delay(50)
		.then(() => {
			t.equal(bar.get().width, 0.5)
			t.end()
		})
})

test('calling reset() does not start auto incrementing', t => {
	const bar = new ProgressBar({
		target: document.querySelector('body'),
		data: { intervalTime: 15 }
	})
	bar.reset()
	delay(50)
		.then(() => {
			t.equal(bar.get().width, 0.08, 'the default value')
			t.end()
		})
})

test('calling start() starts auto incrementing', t => {
	const bar = new ProgressBar({
		target: document.querySelector('body'),
		data: { intervalTime: 15 }
	})
	bar.start()
	const earlyWidth = bar.get().width
	delay(75)
		.then(() => {
			t.ok(bar.get().width > earlyWidth, 'the value should increase')
			t.end()
		})
})

test('calling stop() should pause auto incrementing', t => {
	const bar = new ProgressBar({
		target: document.querySelector('body'),
		data: { intervalTime: 15 }
	})
	bar.start()
	delay(50)
		.then(() => {
			bar.stop()
			return bar.get().width
		})
		.then(delay(75))
		.then(widthAtStop => {
			t.equal(bar.get().width, widthAtStop, 'the value should not change')
			t.end()
		})
})

test('auto increment should never reach 100%', t => {
	const bar = new ProgressBar({
		target: document.querySelector('body'),
		data: {
			intervalTime: 15,
			stepSizes: [ 0.7 ]
		}
	})
	bar.start()
	delay(75)
		.then(() => {
			t.equal(bar.get().width, 0.994, 'should not go over maximum')
			t.end()
		})
})

test('when complete() is called the bar goes away', t => {
	const bar = new ProgressBar({
		target: document.querySelector('body'),
		data: {
			intervalTime: 15,
			settleTime: 15,
			stepSizes: [ 0.7 ]
		}
	})
	bar.start()
	delay(75)
		.then(() => {
			t.equal(bar.get().width, 0.994, 'should not go over maximum')
			bar.complete()
			t.equal(bar.get().width, 1, 'bar should be full width')
		})
		// in theory we should only need to wait the `settleTime` but
		// the test runner adds enough overhead that we need to wait more
		.then(() => delay(700))
		.then(() => {
			t.equal(bar.get().width, 0, 'width resets to zero')
			t.end()
		})
})

test('if color supplied it will be set as style', t => {
	const bar = new ProgressBar({
		target: document.querySelector('body')
	})
	t.equal(bar.get().barStyle, '')
	t.equal(bar.get().leaderColorStyle, '')
	bar.set({ color: 'red' })
	delay(50)
		.then(() => {
			t.equal(bar.get().barStyle, 'background-color: red;')
			t.equal(bar.get().leaderColorStyle, 'background-color: red; color: red;')
			t.end()
		})
})
