# svelte-progress-bar

The idea is a little Svelte component that shows a cool progress bar, like
[this sort of thing](http://ricostacruz.com/nprogress), or what's on YouTube.

If you're using it in your JavaScript, you'd probably have something like:

```js
const ProgressBar = require('svelte-progress-bar')
const progress = new ProgressBar({
	target: document.querySelector('#my-progress-bar'),
	data: {
		// all these properties are optional
		color: 'green',
		minimum: 0.3,
		speed: 500
	}
})

const router = // some sort of page/state change event emitter
router.on('stateChangeStart', () => {
	progress.start()
})
router.on('stateChangeEnd', () => {
	progress.complete()
})
```

You can manually set the width, or change settings on the fly:

```js
// change the color
progress.set({ color: 'green' })
// set the width manually, if desired
progress.set({ width: 0.8 })
// change the CSS easing speed
progress.set({ speed: 500 })
```

Or if you are using the progress bar inside a Svelte template, you can
do it like this:

```html
<ProgressBar color="green" minimum="0.3" ref="progress" />

<script>
import ProgressBar from 'svelte-progress-bar'
export default {
	components: { ProgressBar }
	// somewhere down here, maybe: this.refs.progress.start()
}
</script>
```

You can also use an observable, e.g. `color="{{myColor}}"`, for any
of the properties.

## options

The properties available are:

* `color` *(string)*: The CSS color of the progress bar. If unset, it
	will be oncolored, and you must set it in your own CSS.
* `minimum` *(number, range: 0-1, default: 0.08)*: The starting value to
	use when the bar starts. Starting at `0` doesn't usually look very good.
* `speed` *(number)*: Used in the CSS easing style. Used raw, as milliseconds.
* `height` *(number, default: 2)*: Pixel height of the progress bar.
* `settleTime` *(number, default: 700)*: Milliseconds to wait after complete
	to hide the progress bar.

## methods

These additional methods are available on an instantiated progress bar:

* `start()`: Set the width to the minimum and increment until maximum width.
* `complete()`: Set the width to `100%` and then hide after `settleTime`.
* `reset()`: Set the width to minimum but do not start incrementing.
* `continue()`: Start incrementing from whatever the current width is.
* `stop()`: Stop incrementing and take no further action.

## license

[VOL](veryopenlicense.com)
