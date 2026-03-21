<script lang="ts">
    import '$lib/styles/index.css';
    import Header from './Header.svelte';
    import {onMount, setContext} from 'svelte';
    import type {User} from '$lib/server/db/interfaces';
    import Toast from '$lib/components/toast.svelte';
    import {blur, slide} from 'svelte/transition';

    let {children, data} = $props();

    // svelte-ignore state_referenced_locally
    const user: User = $state(data.user);

    onMount(() => {
        if (!user) window.location.href = "/logout";
    })

    const toastHandler = new Toast();

    setContext('user', user);
    setContext('toasts', toastHandler);
</script>

<section class="header {user.preferred_theme}">
    <Header/>
</section>

<div class="toasts {user.preferred_theme}">
    {#each toastHandler.toasts as toast}
        <div class="toast" in:slide out:blur|global>
            {@html toast}
        </div>
    {/each}
</div>

<section class="main-container {user.preferred_theme}">
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
        height: 100vh;
        width: 100vw;
        scrollbar-width: none;
        z-index: 10;
        background: var(--theme-background) !important;
        overflow: hidden;
    }
</style>