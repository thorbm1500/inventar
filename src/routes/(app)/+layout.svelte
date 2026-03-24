<script lang="ts">
    import '$lib/styles/index.css';
    import Header from './Header.svelte';
    import {onMount, setContext} from 'svelte';
    import type {PageTheme, User, UserSettings} from '$lib/server/db/interfaces';
    import Toast from '$lib/components/toast.svelte';
    import {blur, slide} from 'svelte/transition';
    import {updateTheme} from "./data.remote.ts";
    import {updatePrimaryInventory} from "./inventory/[id]/data.remote.ts";

    let {children, data} = $props();

    // svelte-ignore state_referenced_locally
    let user: User = $state(data.user);
    // svelte-ignore state_referenced_locally
    let userSettings: UserSettings = $state(data.userSettings as UserSettings);
    let theme: PageTheme = $derived(userSettings.preferred_theme);

    setContext('user', () => user);
    setContext('user_settings', () => userSettings);
    let savedSettings = data.userSettings;

    $effect(() => {
        console.log('now', userSettings.preferred_theme !== savedSettings.preferred_theme);
        let changes: boolean = false;

        if (userSettings.preferred_theme !== savedSettings.preferred_theme) {
            changes = true;
            savedSettings.preferred_theme = savedSettings.preferred_theme;
            updateTheme({id: user.uuid, theme: userSettings.preferred_theme});
        }
        if (userSettings.primary_inventory !== savedSettings.primary_inventory) {
            changes = true;
            savedSettings.primary_inventory = savedSettings.primary_inventory;
            updatePrimaryInventory({user: user.uuid, inventory_uuid: userSettings.primary_inventory});
        }

        if (changes) {
            savedSettings = userSettings;
        }
    });

    setContext('update_theme', () => {
        updateTheme({id: user.uuid, theme: userSettings.preferred_theme});
    });

    onMount(() => {
        if (!user) window.location.href = "/logout";
    })

    const toastHandler = new Toast();

    setContext('toasts', toastHandler);
</script>

<section class="header {theme}">
    <Header/>
</section>

<div class="toasts {theme}">
    {#each toastHandler.toasts as toast}
        <div class="toast" in:slide out:blur|global>
            {@html toast}
        </div>
    {/each}
</div>

<section class="main-container {userSettings.preferred_theme}">
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