<script>
	export let width = 10
	export let bar

	const progressStart = () => {
		bar.start()
	}
	const progressComplete = () => {
		bar.complete()
	}
	const progressStop = () => {
		bar.stop()
	}
	const progressIncrement = (size) => {
		const max = bar.getState().maximum
		let width = bar.getState().width + size
		if (width > max) {
			width = max
		}
		bar.$$set({ width })
	}
	const progressContinue = () => {
		bar.animate()
	}
	const setWidthRatio = (width) => {
		bar.setWidthRatio(width / 100)
	}
</script>

<button on:click={progressStart}>
	Restart
</button>
<button on:click={progressComplete}>
	Complete
</button>
<button on:click={progressStop}>
	Stop Auto-Increment
</button>
<button on:click={() => progressIncrement(0.2)}>
	Increment by 20%
</button>
<button on:click={progressContinue}>
	Continue Auto-Increment
</button>

<button class="inline" on:click={() => setWidthRatio(width)}>
	Set Width
</button>
<input class="inline" type="number" bind:value={width}>
