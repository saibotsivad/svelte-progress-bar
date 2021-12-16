require('register-svelte-require')(require('svelte/compiler'), { extensions: [ '.svelte' ] })
const timers = require('timers/promises')
const { test } = require('uvu')
const assert = require('uvu/assert')
const { JSDOM } = require('jsdom')

const delay = async millis => timers.setTimeout(millis)

const { default: ProgressBar } = require('./ProgressBar.svelte')

const dom = new JSDOM()
global.window = dom.window
global.document = dom.window.document

const get = (component, key) => component.$$.ctx[component.$$.props[key]]

test('initialized it does not have width', async () => {
	const bar = new ProgressBar({
		target: document.querySelector('body'),
		props: { intervalTime: 15 },
	})
	assert.equal(get(bar, 'width'), undefined)
	await delay(50)
	assert.equal(get(bar, 'width'), undefined)
})

test('setting a width does not start auto incrementing', async () => {
	const bar = new ProgressBar({
		target: document.querySelector('body'),
		props: { intervalTime: 15 },
	})
	get(bar, 'setWidthRatio')(0.5)
	await delay(50)
	assert.equal(get(bar, 'width'), 0.5)
})

test('calling reset() does not start auto incrementing', async () => {
	const bar = new ProgressBar({
		target: document.querySelector('body'),
		props: { intervalTime: 15 }
	})
	get(bar, 'reset')()
	await delay(50)
	assert.equal(get(bar, 'width'), 0.08, 'the default value')
})

test('calling start() starts auto incrementing', async () => {
	const bar = new ProgressBar({
		target: document.querySelector('body'),
		props: { intervalTime: 15 }
	})
	get(bar, 'start')()
	const earlyWidth = get(bar, 'width')
	await delay(75)
	assert.ok(get(bar, 'width') > earlyWidth, 'the value should increase')
})

test('calling stop() should pause auto incrementing', async () => {
	const bar = new ProgressBar({
		target: document.querySelector('body'),
		props: { intervalTime: 15 }
	})
	get(bar, 'start')()
	await delay(50)
	get(bar, 'stop')()
	const widthAtStop = get(bar, 'width')
	await delay(75)
	assert.equal(get(bar, 'width'), widthAtStop, 'the value should not change')
})

test('auto increment should never reach 100%', async () => {
	const bar = new ProgressBar({
		target: document.querySelector('body'),
		props: {
			intervalTime: 15,
			stepSizes: [ 0.7 ]
		}
	})
	get(bar, 'start')()
	await delay(75)
	assert.equal(get(bar, 'width'), 0.994, 'should not go over maximum')
})

test('when complete() is called the bar goes away', async () => {
	const bar = new ProgressBar({
		target: document.querySelector('body'),
		props: {
			intervalTime: 15,
			settleTime: 15,
			stepSizes: [ 0.7 ]
		}
	})
	get(bar, 'start')()
	await delay(75)
	assert.equal(get(bar, 'width'), 0.994, 'should not go over maximum')
	get(bar, 'complete')()
	assert.equal(get(bar, 'width'), 1, 'bar should be full width')
	// in theory we should only need to wait the `settleTime` but
	// the test runner adds enough overhead that we need to wait more
	await delay(700)
	assert.equal(get(bar, 'width'), 0, 'width resets to zero')
})

test('if color supplied it will be set as style', async () => {
	const bar = new ProgressBar({
		target: document.querySelector('body')
	})
	assert.equal(get(bar, 'barStyle'), '')
	assert.equal(get(bar, 'leaderColorStyle'), '')
	bar.$$set({ color: 'red' })
	await delay(50)
	assert.equal(get(bar, 'barStyle'), 'background-color: red;')
	assert.equal(get(bar, 'leaderColorStyle'), 'background-color: red; color: red;')
})

test.run()
