<script lang="ts">
    import Header from './Header.svelte';
    import {setContext} from "svelte";
    import type {User} from "$lib/server/db/schema";

	let { children,data } = $props();

    const user: User | undefined = data.user ?? undefined;

    setContext('user',user);
</script>

<svelte:head>
</svelte:head>

<Header/>

<section class="main-container">
    {@render children()}
</section>

<style>
    .main-container {
        height: calc(var(--header-height) - 100vh);
        width: 100vw;
        scrollbar-width: none;
    }
</style>