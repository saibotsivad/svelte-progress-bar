# svelte-progress-bar

The idea is a little Svelte component that shows a cool progress bar, like
what's on YouTube, or [this cool thing](http://ricostacruz.com/nprogress).

If you're using it in your JavaScript, you'd probably have something like:

```js
const ProgressBar = require('svelte-progress-bar')
const progress = new ProgressBar({
	// you need to "attach" it to some element on the page
	target: document.querySelector('#my-progress-bar')
})
```

Then if you were using some sort of single-page app with a page/state change
event emitter, it might look like:

```js
const router = // some sort of page/state change event emitter
router.on('stateChangeStart', () => {
	progress.start()
})
router.on('stateChangeEnd', () => {
	progress.complete()
})
```

Or if you had some progress event emitter, set it manually with something
like this:

```js
const dataLoad = // some sort of data load progress event emitter
dataLoad.on('percentDone', percent => {
	progress.set({ width: percent })
})
dataLoad.on('end', () => {
	progress.complete()
})
```

Or if you are using the progress bar inside a Svelte template, you might
use it like this:

```html
<ProgressBar ref="progress" />

<script>
import ProgressBar from 'svelte-progress-bar'
export default {
	components: { ProgressBar }
	// somewhere later, use: this.refs.progress.start()
}
</script>
```

## options

The properties available are:

* `minimum` *(number, range: 0-1, default: 0.08)*: The starting percent width
	to use when the bar starts. Starting at `0` doesn't usually look very good.
* `maximum` *(number, range: 0-1, default: 0.994)*: The maximum percent width
	value to use when the bar is at the end but not marked as complete. Letting
	the bar stay at 100% width for a while doesn't usually look very good either.
* `intervalTime` *(number, default: 800)*: Milliseconds to wait between incrementing
	bar width when using the `start` (auto-increment) method.
* `settleTime` *(number, default: 700)*: Milliseconds to wait after the `complete`
	method is called to hide the progress bar. Letting it sit at 100% width for
	a very short time makes it feel more fluid.

## methods

These additional methods are available on an instantiated progress bar:

* `start()`: Set the width to the minimum and increment until maximum width.
* `complete()`: Set the width to `100%` and then hide after `settleTime`.
* `reset()`: Set the width to minimum but do not start incrementing.
* `continue()`: Start incrementing from whatever the current width is.
* `stop()`: Stop incrementing and take no further action.

## license

Published and released under the [Very Oopen License](veryopenlicense.com).
