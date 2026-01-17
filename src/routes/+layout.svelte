<script lang="ts">
	import './app.css';

	let { children } = $props();
</script>

<svelte:head>
</svelte:head>

<section class="main-container">
    {@render children()}
</section>

<style>
    .main-container {
        height: 100vh;
        width: 100vw;
        overflow: hidden;
    }
</style>