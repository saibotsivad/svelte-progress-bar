<script>
	// Towards the end of the progress bar animation, we want to shorten the increment
	// step size, to give it the appearance of slowing down. This indicates to the user
	// that progress is still happening, but not as fast as they might like.
	const getIncrement = number => {
		if (number >= 0 && number < 0.2) return 0.1
		else if (number >= 0.2 && number < 0.5) return 0.04
		else if (number >= 0.5 && number < 0.8) return 0.02
		else if (number >= 0.8 && number < 0.99) return 0.005
		return 0
	}

	// Internal private state.
	let running
	let updater
	let completed = false

	// z-index override
	export let zIndex

	// You'll need to set a color.
	export let color

	// You can set the width manually, if you know the percent of completion, but if you're
	// using the start/complete methods you won't need to set this.
	export let width

	// These are defaults that you shouldn't need to change, but are exposed here in case you do.
	export let minimum = 0.08
	export let maximum = 0.994
	export let settleTime = 700
	export let intervalTime = 700
	export let stepSizes = [ 0, 0.005, 0.01, 0.02 ]

	// Reset the progress bar back to the beginning, leaving it in a running state.
	export const reset = () => {
		width = minimum
		running = true
	}

	// Continue the animation of the progress bar from whatever position it is in, using
	// a randomized step size to increment.
	export const animate = () => {
		if (updater) {
			// prevent multiple intervals by clearing before making
			clearInterval(updater)
		}
		running = true
		updater = setInterval(() => {
			const randomStep = stepSizes[Math.floor(Math.random() * stepSizes.length)]
			const step = getIncrement(width) + randomStep
			if (width < maximum) {
				width = width + step
			}
			if (width > maximum) {
				width = maximum
				stop()
			}
		}, intervalTime)
	}

	// Restart the bar at the minimum, and begin the auto-increment progress.
	export const start = () => {
		reset()
		animate()
	}

	// Stop the progress bar from incrementing, but leave it visible.
	export const stop = () => {
		if (updater) {
			clearInterval(updater)
		}
	}

	// Moves the progress bar to the fully completed position, wait an appropriate
	// amount of time so the user can feel the completion, then hide and reset.
	export const complete = () => {
		clearInterval(updater)
		width = 1
		running = false
		setTimeout(() => {
			// complete the bar first
			completed = true
			setTimeout(() => {
				// after some time (long enough to finish the hide animation) reset it back to 0
				completed = false
				width = 0
			}, settleTime)
		}, settleTime)
	}

	// Stop the auto-increment functionality and manually set the width of the progress bar.
	export const setWidthRatio = (widthRatio) => {
		stop()
		width = widthRatio
		completed = false
		running = true
	}

	// Primarily used for tests, but can also be used for external monitoring.
	export const getState = () => {
		return {
			width,
			running,
			completed,
			color,
			minimum,
			maximum,
			settleTime,
			intervalTime,
			stepSizes,
		}
	}

	export let barStyle
	$: barStyle = (color && `background-color: ${color};` || '') 
		+ (width && width * 100 && `width: ${width * 100}%;` || '')

	export let barZIndexStyle
	$: barZIndexStyle = typeof zIndex !== 'undefined' && `z-index: ${zIndex};` || ''

	// the box shadow of the leader bar uses `color` to set its shadow color
	export let leaderColorStyle
	$: leaderColorStyle = (color && `background-color: ${color}; color: ${color};` || '')

	export let leaderZIndexStyle
	$: leaderZIndexStyle = typeof zIndex !== 'undefined' && `z-index: ${parseInt(zIndex, 10) + 1};` || ''
</script>

{#if width}
	<div class="svelte-progress-bar" class:running class:svelte-progress-bar-hiding={completed} style={barStyle}{barZIndexStyle}>
		{#if running}
			<div class="svelte-progress-bar-leader" style={leaderColorStyle}{leaderZIndexStyle}></div>
		{/if}
	</div>
{/if}

<style>
	:global(.svelte-progress-bar) {
		position: fixed;
		top: 0;
		left: 0;
		height: 2px;
		transition: width 0.21s ease-in-out;
		z-index: 1;
	}

	:global(.svelte-progress-bar-hiding) {
		transition: top 0.8s ease;
		top: -8px;
	}

	:global(.svelte-progress-bar-leader) {
		position: absolute;
		top: 0;
		right: 0;
		height: 3px;
		width: 100px;
		transform: rotate(2.5deg) translate(0px, -4px);
		box-shadow: 0 0 8px;
		z-index: 2;
	}
</style>
