<script>
	import Controls from './Controls.svelte'
	import ProgressBar from '../src/ProgressBar.svelte'

	let bar
	let width

	export const start = () => bar.start()
	export const complete = () => bar.complete()
</script>

<ProgressBar color="blue" bind:this={bar} bind:width />

<Controls bind:bar currentWidth={width} />
