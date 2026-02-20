<script lang="ts">
    import Header from './Header.svelte';
    import {setContext} from "svelte";
    import type {User} from "$lib/server/db/interfaces";
    import Toast from "$lib/components/toast.svelte";

    let {children, data} = $props();

    // svelte-ignore state_referenced_locally
    const user: User = $state(data.user);

    if (!user) window.location.href = "/logout";

    const toastHandler = new Toast();

    setContext('user', user);
    setContext('toasts', toastHandler);
</script>

<section class="header">
    <Header />
</section>

<div class="toasts">
    {#each toastHandler.toasts as toast}
        {@html toast}
    {/each}
</div>

<section class="main-container">
    {@render children()}
</section>

<style>
    .header {
        z-index: 10000 !important;
    }

    .toasts {
        position: absolute;
        bottom: 2rem;
        right: 2rem;

        display: flex;
        flex-flow: column nowrap;
        align-items: flex-end;

        gap: .75rem;

        z-index: 5 !important;
    }

    .toasts, .toasts * {
        user-select: none;
        pointer-events: none;
    }

    .main-container {
        height: calc(var(--theme-height-header) - 100vh);
        width: 100vw;
        scrollbar-width: none;
        z-index: 1;
    }
</style>