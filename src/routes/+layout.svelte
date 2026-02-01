<script lang="ts">
	import './app.css';
    import {getContext, setContext} from "svelte";

	let { children,data } = $props();

    const user = data.user;

    setContext('user', user);
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
        scrollbar-width: none;
    }
</style>