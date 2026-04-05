<script lang="ts">
    import '$lib/styles/index.css';
    import Header from './Header.svelte';
    import {onMount, setContext} from 'svelte';
    import type {User, UserSettings} from '$lib/server/db/components/user';
    import Toast from '$lib/components/toast.svelte';
    import {blur, slide} from 'svelte/transition';
    import {updateTheme} from "./data.remote.ts";
    import {updatePrimaryInventory} from "./inventory/[id]/data.remote";
    import FaviconDark from "$lib/assets/icons/favicon-dark.svg";
    import FaviconLight from "$lib/assets/icons/favicon-light.svg";
    import {ContextHandler} from "$lib/util/ContextHandler.svelte";

    let {children, data} = $props();

    //svelte-ignore state_referenced_locally
    ContextHandler.setLocale(data.locale);
    //svelte-ignore state_referenced_locally
    ContextHandler.setUser(data.user);
    // svelte-ignore state_referenced_locally
    ContextHandler.setUserSettings(data.userSettings);

    let user: User = $derived(ContextHandler.getUser());
    let userSettings: UserSettings = $derived(ContextHandler.getUserSettings());
    let theme: 'dark' | 'light' = $derived(userSettings.theme);

    // svelte-ignore state_referenced_locally
    let savedSettings = data.userSettings;

    interface PageInfo {
        title: string,
        pillTitle: string,
        backButton?: string | undefined
    }

    let pageInfo: PageInfo = $state({
        title: 'inventar',
        pillTitle: 'inventar',
        backButton: undefined
    });

    setContext('set_page_title', (title: string | undefined) => {
        if (!title || title === '') pageInfo.title = 'inventar';
        else pageInfo.title = title;
    });
    setContext('reset_page_title', () => {pageInfo.title = 'inventar';});
    setContext('get_pill_title', () => pageInfo.pillTitle);
    setContext('set_pill_title', (title: string | undefined) => {
        if (!title || title === '') pageInfo.pillTitle = 'inventar';
        else pageInfo.pillTitle = title;
    });
    setContext('reset_page_info', () => {
        pageInfo.title = 'inventar';
        pageInfo.pillTitle = 'inventar';
    });
    setContext('get_page_back_button', () => pageInfo.backButton);
    setContext('set_page_back_button', (value: string) => {pageInfo.backButton = value});

    $effect(() => {
        /*let changes: boolean = false;

        if (userSettings.theme !== savedSettings.preferred_theme) {
            changes = true;
            savedSettings.preferred_theme = savedSettings.preferred_theme;
            updateTheme({id: user.uuid, theme: userSettings.theme});
        }
        if (userSettings.primary_inventory !== savedSettings.primary_inventory) {
            changes = true;
            savedSettings.primary_inventory = savedSettings.primary_inventory;
            updatePrimaryInventory({user: user.uuid, inventory_uuid: userSettings.primary_inventory ?? undefined});
        }

        if (changes) {
            savedSettings = userSettings;
        }*/
    });

    setContext('update_theme', () => updateTheme({id: user.uuid, theme: userSettings.theme}));

    onMount(() => {
        if (!user) window.location.href = "/logout";
    })

    const toastHandler = new Toast();

    setContext('toasts', toastHandler);
</script>

<svelte:head>
    <title>{pageInfo.title === 'inventar' ? pageInfo.title : 'inventar ▪ ' + pageInfo.title}</title>
    <link rel="icon" type="image/svg" href="{theme==='dark'?FaviconLight:FaviconDark}" />
</svelte:head>

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

<section class="main-container {theme}">
    <div class="page-blur top"></div>
    <div class="page-blur bottom"></div>
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

    .page-blur {
        position: absolute;

        height: 3rem;
        width: 100vw;

        background: linear-gradient(to top, transparent 0%, rgba(from var(--theme-background) r g b / .25) 100%);
        mask-image: linear-gradient(to top, transparent 0%, black 50%);
        backdrop-filter: blur(1px);
        mask-mode: alpha;

        z-index: 100;
    }

    .page-blur.top {
        top:-1rem;
    }

    .page-blur.bottom {
        transform: rotate(180deg);
        bottom: -1rem;
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