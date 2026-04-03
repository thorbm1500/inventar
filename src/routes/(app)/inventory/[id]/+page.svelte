<!--suppress ALL -->
<script module lang="ts">
    import {getContext, onDestroy, onMount} from "svelte";
    import {page} from "$app/state";
    import type {Inventory, User} from "$lib/server/db/interfaces";
    import {parseTimestamp} from '$lib/util/utilities'
    import {getInventory, quickAdd, createItem, deleteItem} from "./data.remote";
    import {ignorePasswordManagers} from "$lib/util/utilities";
    import {blur} from "svelte/transition";
    import {ItemHandler} from "./item/[item_id]/itemHandler.svelte";
    import {getCurrencyFormat} from "$lib/util/currencies";
    import {ContextHandler} from "$lib/util/ContextHandler.svelte";
    import type {UserSettings} from "$lib/server/db/interfaces";
    import type {ApplicationLocale} from "$lib/server/internal/locales";

    const confirmItemCreationIcons: string[] = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M21 12.5v-4.509a1.98 1.98 0 0 0 -1 -1.717l-7 -4.008a2.016 2.016 0 0 0 -2 0l-7 4.007c-.619 .355 -1 1.01 -1 1.718v8.018c0 .709 .381 1.363 1 1.717l7 4.008a2.016 2.016 0 0 0 2 0" /><path d="M12 22v-10" /><path d="M12 12l8.73 -5.04" /><path d="M3.27 6.96l8.73 5.04" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v13" /><path d="M13.02 21.655a1.7 1.7 0 0 1 -2.04 0l-5.98 -4.485a2.5 2.5 0 0 1 -1 -2v-11.17a1 1 0 0 1 1 -1h14a1 1 0 0 1 1 1v8" /><path d="M4.3 3.3l6.655 5.186a1.7 1.7 0 0 0 2.09 0l6.655 -5.186" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12c0 1.657 4.03 3 9 3c1.116 0 2.185 -.068 3.172 -.192m5.724 -2.35a1.1 1.1 0 0 0 .104 -.458" /><path d="M20.984 12.546a9 9 0 1 0 -8.442 8.438" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6a8 3 0 1 0 16 0a8 3 0 1 0 -16 0" /><path d="M4 6v.143a1 1 0 0 0 .048 .307l1.952 5.55l-1.964 5.67a1 1 0 0 0 -.036 .265v.065c0 1.657 3.582 3 8 3c.17 0 .34 -.002 .508 -.006m5.492 -8.994l1.952 -5.55a1 1 0 0 0 .048 -.307v-.143" /><path d="M6 12c0 1.105 2.686 2 6 2s6 -.895 6 -2" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12.841 21.309a1.945 1.945 0 0 1 -1.682 0l-7.035 -3.365a1.99 1.99 0 0 1 -1.064 -2.278l2.538 -10.158a1.98 1.98 0 0 1 1.11 -1.328l4.496 -2.01a1.95 1.95 0 0 1 1.59 0l4.496 2.01c.554 .246 .963 .736 1.112 1.328l1.67 6.683" /><path d="M18 4.82l-5.198 2.324a1.963 1.963 0 0 1 -1.602 0l-5.2 -2.325" /><path d="M12 7.32v14.18" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18.719 11.985l-5.889 -9.539a.999 .999 0 0 0 -1.664 0l-8.54 13.836a1.005 1.005 0 0 0 .386 1.452l8.092 4.054a1.994 1.994 0 0 0 1.789 0l.149 -.074" /><path d="M12 2v20" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 6a7 3 0 1 0 14 0a7 3 0 1 0 -14 0" /><path d="M5 6v12c0 1.657 3.134 3 7 3c.173 0 .345 -.003 .515 -.008m6.485 -8.992v-6" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 9a9 3 0 1 0 18 0a9 3 0 1 0 -18 0" /><path d="M3 9a9 9 0 0 0 9 9m8.396 -5.752a8.978 8.978 0 0 0 .604 -3.248" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M21.498 12.911l.206 -.208a.984 .984 0 0 0 0 -1.407l-8.845 -8.948a1.233 1.233 0 0 0 -1.718 0l-8.845 8.949a.984 .984 0 0 0 0 1.407l8.845 8.949a1.234 1.234 0 0 0 1.718 -.001l.08 -.081" /><path d="M2 12c.004 .086 .103 .178 .296 .246l8.845 2.632c.459 .163 1.259 .163 1.718 0l2.634 -.784m5.41 -1.61l.801 -.238c.195 -.07 .294 -.156 .296 -.243" /><path d="M12 2.12v19.76" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20.792 6.996l-3.775 2.643a2.005 2.005 0 0 1 -1.147 .361h-7.74c-.41 0 -.81 -.126 -1.146 -.362l-3.774 -2.641" /><path d="M8 10v11" /><path d="M16 10v3.5" /><path d="M21 12.5v-5.131c0 -.655 -.318 -1.268 -.853 -1.643l-3.367 -2.363a2 2 0 0 0 -1.147 -.363h-7.266c-.41 0 -.811 .126 -1.147 .363l-3.367 2.363a2.006 2.006 0 0 0 -.853 1.644v9.261c0 .655 .318 1.269 .853 1.644l3.367 2.363a2 2 0 0 0 1.147 .362h4.133" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18.642 12.04l-5.804 -9.583a.996 .996 0 0 0 -1.676 0l-7.846 12.954a1.988 1.988 0 0 0 .267 2.483l2.527 2.523c.374 .373 .88 .583 1.408 .583h4.982" /><path d="M12 2l-5 18.9" /><path d="M12 2l3.304 12.489" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M21 12.5v-3.509a1.98 1.98 0 0 0 -1 -1.717l-4 -2.008a2.016 2.016 0 0 0 -2 0l-10 5.007c-.619 .355 -1 1.01 -1 1.718v5.018c0 .709 .381 1.363 1 1.717l4 2.008a2.016 2.016 0 0 0 2 0l2.062 -1.032" /><path d="M9 21v-7.5" /><path d="M9 13.5l11.5 -5.5" /><path d="M3.5 11l5.5 2.5" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 12l1.752 -6.13a1 1 0 0 0 -.592 -1.205l-6.282 -2.503a2.46 2.46 0 0 0 -1.756 0l-6.282 2.503a1 1 0 0 0 -.592 1.204l1.752 6.131l-1.752 6.13a1 1 0 0 0 .592 1.205l6.282 2.503a2.46 2.46 0 0 0 1.756 0l.221 -.088" /><path d="M4.5 5.5l6.622 2.33a2.35 2.35 0 0 0 1.756 0l6.622 -2.33" /><path d="M6 12l5.21 1.862a2.34 2.34 0 0 0 1.58 0l5.21 -1.862" /><path d="M12 22v-14" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6c0 1.657 3.582 3 8 3s8 -1.343 8 -3s-3.582 -3 -8 -3s-8 1.343 -8 3" /><path d="M4 6v6c0 1.657 3.582 3 8 3c1.075 0 2.1 -.08 3.037 -.224" /><path d="M20 12v-6" /><path d="M4 12v6c0 1.657 3.582 3 8 3c.166 0 .331 -.002 .495 -.006" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`
    ];

    const latestIcons: number[] = [99, 99, 99];

    function getRandomIcon(): string {
        let next: number = 99;

        while (next === 99 || latestIcons?.includes(next)) {
            next = Math.floor(Math.random() * (14));
        }

        latestIcons?.shift();
        latestIcons?.push(next);
        return confirmItemCreationIcons[next];
    }

    let itemCreatorConfirmCreationButtonIcon = $state(getRandomIcon());

    let inventory: Inventory | undefined = $state(undefined);
    let handler: ItemHandler | undefined = $state(undefined);

    let itemSize: string = $state('small');
    let tableType: string = $state('table');

    let addItemHover = $state(false);
    let isItemCreatorOpen: boolean = $state(false);
    let isFilterContainerOpen: boolean = $state(false);
</script>

<script lang="ts">
    let locale: ApplicationLocale = $derived(ContextHandler.getLocale());
    const user: User = $derived(ContextHandler.getUser());

    let userSettings: UserSettings = $derived(ContextHandler.getUserSettings());

    let isLoaded: boolean = $derived(handler?.isLoaded ?? false);
    const updatePageTitle: Function | undefined = getContext('set_page_title') as Function;

    onMount(() => {
        const openItemCreatorButtonElement = document.getElementById('create-item-button');
        openItemCreatorButtonElement?.addEventListener('mouseover', () => addItemHover = true);
        openItemCreatorButtonElement?.addEventListener('mouseout', () => addItemHover = false);

        const resetPageInfo: Function | undefined = getContext('reset_page_info');
        if (resetPageInfo) onDestroy(() => resetPageInfo());
    })

    onMount(async () => {
        inventory = await getInventory(String(page.params.id));
        if (!inventory.uuid) return;

        handler = new ItemHandler(inventory.uuid, () => userSettings);
        await handler.init();
        await handler.refreshPage();

        if (updatePageTitle) updatePageTitle(inventory.name);
    });
</script>

<div class="page-content">
    <div class="body-section">
        <section class="inventory-outer-section">
            <section class="inventory-section">
                <section class="inventory-header-section">
                    <div class="inventory-header-content">
                        <div class="inventory-name">
                            <h1>{isLoaded ? inventory?.name : locale.generics.loading}</h1>
                            {#if isLoaded}
                                <button class="primary-inventory-bookmark-icon" onclick={() => {
                                userSettings.primary_inventory = userSettings.primary_inventory === inventory?.uuid ? undefined : inventory?.uuid;
                            }}>
                                    {#if userSettings.primary_inventory === inventory?.uuid }
                                        <svg style="color:var(--theme-color-accent);" width="24" height="24" viewBox="0 0 24 24">
                                            <path fill="currentColor" fill-rule="evenodd"
                                                  d="M21 11.098v4.993c0 3.096 0 4.645-.734 5.321c-.35.323-.792.526-1.263.58c-.987.113-2.14-.907-4.445-2.946c-1.02-.901-1.529-1.352-2.118-1.47a2.2 2.2 0 0 0-.88 0c-.59.118-1.099.569-2.118 1.47c-2.305 2.039-3.458 3.059-4.445 2.945a2.24 2.24 0 0 1-1.263-.579C3 20.736 3 19.188 3 16.091v-4.994C3 6.81 3 4.666 4.318 3.333S7.758 2 12 2s6.364 0 7.682 1.332S21 6.81 21 11.098M8.25 6A.75.75 0 0 1 9 5.25h6a.75.75 0 0 1 0 1.5H9A.75.75 0 0 1 8.25 6"
                                                  clip-rule="evenodd"/>
                                        </svg>
                                    {:else}
                                        <svg width="24" height="24" viewBox="0 0 24 24">
                                            <g fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M21 16.09v-4.992c0-4.29 0-6.433-1.318-7.766C18.364 2 16.242 2 12 2S5.636 2 4.318 3.332S3 6.81 3 11.098v4.993c0 3.096 0 4.645.734 5.321c.35.323.792.526 1.263.58c.987.113 2.14-.907 4.445-2.946c1.02-.901 1.529-1.352 2.118-1.47c.29-.06.59-.06.88 0c.59.118 1.099.569 2.118 1.47c2.305 2.039 3.458 3.059 4.445 2.945c.47-.053.913-.256 1.263-.579c.734-.676.734-2.224.734-5.321Z"/>
                                                <path stroke-linecap="round" d="M15 6H9" opacity="0.5"/>
                                            </g>
                                        </svg>
                                    {/if}
                                </button>
                            {/if}
                        </div>
                        <div class="header-buttons">
                            {#if tableType === 'table'}
                                <div class="theme-button size-switcher">
                                    <button class="{itemSize==='small'?'selected':''}" title="Small" onclick="{() => itemSize = 'small'}">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                             stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M5 9l4 0l0 -4"/>
                                            <path d="M3 3l6 6"/>
                                            <path d="M5 15l4 0l0 4"/>
                                            <path d="M3 21l6 -6"/>
                                            <path d="M19 9l-4 0l0 -4"/>
                                            <path d="M15 9l6 -6"/>
                                            <path d="M19 15l-4 0l0 4"/>
                                            <path d="M15 15l6 6"/>
                                        </svg>
                                    </button>
                                    <div class="size-switcher-button-seperator"></div>
                                    <button class="{itemSize==='large'?'selected':''}" title="Large" onclick="{() => itemSize = 'large'}">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                             stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M16 4l4 0l0 4"/>
                                            <path d="M14 10l6 -6"/>
                                            <path d="M8 20l-4 0l0 -4"/>
                                            <path d="M4 20l6 -6"/>
                                            <path d="M16 20l4 0l0 -4"/>
                                            <path d="M14 14l6 6"/>
                                            <path d="M8 4l-4 0l0 4"/>
                                            <path d="M4 4l6 6"/>
                                        </svg>
                                    </button>
                                </div>
                            {/if}
                            <div class="theme-button size-switcher">
                                <button class="{tableType==='table'?'selected':''}" title="Table" onclick="{() => tableType = 'table'}">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 9L21 9M9 3L9 21M7.8 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11984 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V7.8C3 6.11984 3 5.27976 3.32698 4.63803C3.6146 4.07354 4.07354 3.6146 4.63803 3.32698C5.27976 3 6.11984 3 7.8 3Z"
                                              stroke="currentColor"
                                              stroke-width="2"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"/>
                                    </svg>
                                </button>
                                <div class="size-switcher-button-seperator"></div>
                                <button class="{tableType==='list'?'selected':''}" title="List" onclick="{() => tableType = 'list'}">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.5 17H6.5M17.5 13H6.5M3 9H21M7.8 3H16.2C17.8802 3 18.7202 3 19.362 3.32698C19.9265 3.6146 20.3854 4.07354 20.673 4.63803C21 5.27976 21 6.11984 21 7.8V16.2C21 17.8802 21 18.7202 20.673 19.362C20.3854 19.9265 19.9265 20.3854 19.362 20.673C18.7202 21 17.8802 21 16.2 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V7.8C3 6.11984 3 5.27976 3.32698 4.63803C3.6146 4.07354 4.07354 3.6146 4.63803 3.32698C5.27976 3 6.11984 3 7.8 3Z"
                                              stroke="currentColor"
                                              stroke-width="2"
                                              stroke-linecap="round"
                                              stroke-linejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                            <button id="filters-button" class="theme-button filters-button {isFilterContainerOpen?'open':''}" title="Filters" onclick={() => {
                                isItemCreatorOpen = false;
                                isFilterContainerOpen = !isFilterContainerOpen;

                                if (!isItemCreatorOpen) {
                                    document.getElementById('item-creator-form-reset-button')?.click();
                                }
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                     stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-filter-spark">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M15 12.5v-.5l4.414 -4.414a2 2 0 0 0 .586 -1.414v-2.172h-16v2.227c0 .497 .185 .977 .52 1.345l4.48 4.928v8.5l2 -.667"/>
                                    <path d="M18.5 22a4.75 4.75 0 0 1 3.5 -3.5a4.75 4.75 0 0 1 -3.5 -3.5a4.75 4.75 0 0 1 -3.5 3.5a4.75 4.75 0 0 1 3.5 3.5"/>
                                </svg>
                                {locale.inventory.id.filters}
                            </button>
                            <button id="create-item-button" class="theme-button create-item-button {handler && handler.isEmpty ? 'no-items' : ''} {isItemCreatorOpen?'open':''}" onclick={() => {
                                isFilterContainerOpen = false;
                                isItemCreatorOpen = !isItemCreatorOpen;

                                if (!isItemCreatorOpen) {
                                    document.getElementById('item-creator-form-reset-button')?.click();
                                }}}>
                                {#if isItemCreatorOpen || addItemHover}
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="currentColor"
                                              d="M2 10.96a.985.985 0 0 1-.37-1.37L3.13 7c.11-.2.28-.34.47-.42l7.83-4.4c.16-.12.36-.18.57-.18s.41.06.57.18l7.9 4.44c.19.1.35.26.44.46l1.45 2.52c.28.48.11 1.09-.36 1.36l-1 .58v4.96c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18s-.41-.06-.57-.18l-7.9-4.44A.99.99 0 0 1 3 16.5v-5.54c-.3.17-.68.18-1 0m10-6.81v6.7l5.96-3.35zM5 15.91l6 3.38v-6.71L5 9.21zm14 0v-3.22l-5 2.9c-.33.18-.7.17-1 .01v3.69zm-5.15-2.55l6.28-3.63l-.58-1.01l-6.28 3.63z"/>
                                    </svg>
                                {:else}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                         stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5"/>
                                        <path d="M12 12l8 -4.5"/>
                                        <path d="M12 12l0 9"/>
                                        <path d="M12 12l-8 -4.5"/>
                                        <path d="M16 5.25l-8 4.5"/>
                                    </svg>
                                {/if}
                                {locale.inventory.id.add_item}
                            </button>
                            <button id="refresh-button" class="theme-button refresh-button" title="Refresh" onclick="{async () => await handler?.refreshPage()}">
                                <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
                                </svg>
                            </button>
                            <button id="inventory-settings-button" class="theme-button inventory-settings-button" title="Settings"
                                    onclick="{() => window.location.href=`/inventory/${inventory?.uuid??'unknown'}/settings`}">
                                <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                                </svg>
                            </button>
                            {#if handler && handler.isEmpty}
                                <div id="create-item-button-no-items">
                                    <div id="create-item-button-no-items-mask">
                                        <div id="child"></div>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    </div>
                </section>
                {#if isFilterContainerOpen || isItemCreatorOpen}
                    <div transition:blur={{duration:150}}>
                        {#if isLoaded && isFilterContainerOpen }
                            <div class="extra-container open inventory-filter-container">
                                <div class="header" style="display:flex;flex-flow:row nowrap;align-items:center;justify-content:space-between;">
                                    <h1>Filters</h1>
                                    <button class="filters-save-button {handler?.filters?.unsavedChanges ? 'new' : 'default' }" title="Save Filters">
                                        <svg width="16" height="16" fill="currentColor" class="bi bi-floppy-fill" viewBox="0 0 16 16">
                                            <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0H3v5.5A1.5 1.5 0 0 0 4.5 7h7A1.5 1.5 0 0 0 13 5.5V0h.086a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5H14v-5.5A1.5 1.5 0 0 0 12.5 9h-9A1.5 1.5 0 0 0 2 10.5V16h-.5A1.5 1.5 0 0 1 0 14.5z"/>
                                            <path d="M3 16h10v-5.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5zm9-16H4v5.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5zM9 1h2v4H9z"/>
                                        </svg>
                                    </button>
                                </div>
                                <section class="filters">
                                    <div class="filter columns">
                                        <div style="display:flex;flex-flow:row nowrap;gap:.2rem;">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                                 stroke-linejoin="round" class="lucide lucide-table2-icon lucide-table-2">
                                                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                                            </svg>
                                            <h1>Columns</h1>
                                        </div>
                                        <div class="buttons">
                                            <button class="extra-container-button price filter-button {handler?.filters?.price ? '' : 'off'}"
                                                    style="order:{handler?.filters?.price ? 1 : 101};display:flex;flex-flow:row nowrap;align-items:center;"
                                                    onclick={() => {
                                                if (handler && handler.filters) {
                                                    handler.filters.price = !handler.filters.price;
                                                    handler.filters.reset();
                                                }
                                            }}>
                                                {#if handler?.filters?.price }
                                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                                        <path fill="currentColor"
                                                              d="M12 9a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M3.18 12a9.821 9.821 0 0 0 17.64 0a9.821 9.821 0 0 0-17.64 0"/>
                                                    </svg>
                                                {:else}
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                              d="M21 9q-3.6 4-9 4T3 9m0 6l2.5-3.8M21 14.976L18.508 11.2M9 17l.5-4m5.5 4l-.5-4"/>
                                                    </svg>
                                                {/if}
                                                Prices
                                            </button>
                                            <button class="extra-container-button last-updated filter-button {handler?.filters?.last_updated ? '' : 'off'}"
                                                    style="order:{handler?.filters?.last_updated ? 2 : 102};display:flex;flex-flow:row nowrap;align-items:center;"
                                                    onclick={() => {if (handler && handler.filters) {
                                                        handler.filters.last_updated = !handler.filters.last_updated;
                                                        handler.filters.reset();
                                                        }}}>
                                                {#if handler?.filters?.last_updated }
                                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                                        <path fill="currentColor"
                                                              d="M12 9a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M3.18 12a9.821 9.821 0 0 0 17.64 0a9.821 9.821 0 0 0-17.64 0"/>
                                                    </svg>
                                                {:else}
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                              d="M21 9q-3.6 4-9 4T3 9m0 6l2.5-3.8M21 14.976L18.508 11.2M9 17l.5-4m5.5 4l-.5-4"/>
                                                    </svg>
                                                {/if}
                                                Last Updated
                                            </button>
                                            <button class="extra-container-button description filter-button {handler?.filters?.description ? '' : 'off'}"
                                                    style="order:{handler?.filters?.description ? 3 : 103};display:flex;flex-flow:row nowrap;align-items:center;"
                                                    onclick={() => {if (handler && handler.filters) {
                                                         handler.filters.description = !handler.filters.description
                                                         handler.filters.reset();
                                                        }}}>
                                                {#if handler?.filters?.description }
                                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                                        <path fill="currentColor"
                                                              d="M12 9a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M3.18 12a9.821 9.821 0 0 0 17.64 0a9.821 9.821 0 0 0-17.64 0"/>
                                                    </svg>
                                                {:else}
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                              d="M21 9q-3.6 4-9 4T3 9m0 6l2.5-3.8M21 14.976L18.508 11.2M9 17l.5-4m5.5 4l-.5-4"/>
                                                    </svg>
                                                {/if}
                                                Description
                                            </button>
                                        </div>
                                    </div>
                                    <div class="filter row-amount" style="display:flex;flex-flow:column nowrap">
                                        <div style="display:flex;flex-flow:row nowrap;">
                                            <svg width="24" height="24" viewBox="0 0 24 24">
                                                <path fill="currentColor"
                                                      d="M8 5.5h8a3 3 0 0 0 3-3a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5a3 3 0 0 0 3 3m8 13H8a3 3 0 0 0-3 3a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5a3 3 0 0 0-3-3"
                                                      opacity="0.5"/>
                                                <path fill="currentColor"
                                                      d="M5 11.5c0-1.886 0-2.828.586-3.414S7.114 7.5 9 7.5h6c1.886 0 2.828 0 3.414.586S19 9.614 19 11.5v1c0 1.886 0 2.828-.586 3.414S16.886 16.5 15 16.5H9c-1.886 0-2.828 0-3.414-.586S5 14.386 5 12.5z"/>
                                            </svg>
                                            <h1>Row Amount</h1>
                                        </div>
                                        <div style="display:flex;flex-flow:row nowrap;gap:.25rem;">
                                            <button onclick={() => {if (handler && handler.filters) handler.filters.rowAmount = 15}}
                                                    class="extra-container-button filter-button row-amount {handler && handler.filters && handler.filters.rowAmount === 15 ? 'selected' : ''}">
                                                15
                                            </button>
                                            <button onclick={() => {if (handler && handler.filters) handler.filters.rowAmount = 30}}
                                                    class="extra-container-button filter-button row-amount {handler && handler.filters && handler?.filters.rowAmount === 30 ? 'selected' : ''}">
                                                30
                                            </button>
                                            <button onclick={() => {if (handler && handler.filters) handler.filters.rowAmount = 45}}
                                                    class="extra-container-button filter-button row-amount {handler && handler.filters && handler?.filters.rowAmount === 45 ? 'selected' : ''}">
                                                45
                                            </button>
                                            <button onclick={() => {if (handler && handler.filters) handler.filters.rowAmount = 60}}
                                                    class="extra-container-button filter-button row-amount {handler && handler.filters && handler?.filters.rowAmount === 60 ? 'selected' : ''}">
                                                60
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        {:else if isLoaded && isItemCreatorOpen }
                            <div class="extra-container open create-item-container" id="create-item-container" style="display:flex;flex-flow:column nowrap;">
                                <form {...createItem.enhance(async ({form, submit}) => {
                                    try {
                                        await submit();
                                        form.reset();
                                        isItemCreatorOpen = false;
                                        await handler?.refreshPage();
                                    } catch (err) {
                                        console.log(err);
                                    }
                                })} id="item-creator-form" class="item-creator-form" autocomplete="off" enctype="multipart/form-data">
                                    <button type="reset" id="item-creator-form-reset-button" title="Reset form" hidden></button>
                                    <input {...quickAdd.fields.user.as('text')} value="{user.uuid??'x'}" use:ignorePasswordManagers hidden required/>
                                    <input {...quickAdd.fields.inventoryUuid.as('text')} value="{page.params?.id??'x'}" use:ignorePasswordManagers hidden required/>
                                    <div class="options-top-section" style="display:flex;flex-flow:row nowrap;justify-content:space-between;">
                                        <div class="option-container" style="width:52rem;">
                                            <h1>{locale.generics.name}</h1>
                                            <input style="width:100%;" {...quickAdd.fields.name.as('text')} placeholder="{locale.inventory.id.item_creator.name_placeholder}" use:ignorePasswordManagers required/>
                                        </div>
                                        <div class="option-container">
                                            <h1>{locale.generics.amount}</h1>
                                            <input {...quickAdd.fields.amount.as('number')} value=0 required/>
                                        </div>
                                    </div>
                                </form>
                                <div style="display:flex;flex-flow:row nowrap;align-items:center;justify-content:flex-start;gap:.4rem;margin:.5rem 0;">
                                    <button form="item-creator-form" type="button" class="theme-button" onclick="{() => window.location.href = window.location.href.concat('/item/new')}">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                             stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M19.953 8.017l1.047 6.983v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-2l1.245 -8.297a2 2 0 0 1 1.977 -1.703h3.778"/>
                                            <path d="M3 15h18"/>
                                            <path d="M13 3l5.5 1.5"/>
                                            <path d="M15.75 3.75l-2 7"/>
                                            <path d="M7 10.5c1.667 -.667 3.333 -.667 5 0c1.667 .667 3.333 .667 5 0"/>
                                        </svg>
                                        {locale.inventory.id.item_creator.open_creator}
                                    </button>
                                    <button onmouseenter="{() => itemCreatorConfirmCreationButtonIcon = getRandomIcon() }"
                                            onfocus="{() => itemCreatorConfirmCreationButtonIcon = getRandomIcon() }"
                                            form="item-creator-form" type="submit" class="theme-button confirm-creation-button" id="confirm-creation-button">
                                        {@html itemCreatorConfirmCreationButtonIcon }
                                        {locale.inventory.id.item_creator.quick_add}
                                    </button>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/if}
                <section class="inventory-body-section">
                    {#if tableType === 'list'}
                        <div class="inventory-list-container {itemSize}">
                            {#each handler?.currentItems as item}
                                <a data-sveltekit-preload-data="tap" href='{window.location.href}/item/{item.uuid}' class="inventory-list-entry">
                                    <div class="entry-item image">
                                        {#if item.image }
                                            <img src='/src/lib/assets/uploads/item-images/{item.image}' alt="Item Thumbnail">
                                        {:else }
                                            <svg fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="size-6">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                      d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/>
                                            </svg>
                                        {/if}
                                    </div>
                                    <div class="entry-item meta">
                                        <div class="name">
                                            <h1 class="name">{item.name}</h1>
                                        </div>
                                    </div>
                                    <div class="entry-item labels">
                                        {#each item.labels as {name, color}}
                                            <div class="label {color}">
                                                <p class="label-title">{name}</p>
                                            </div>
                                        {/each}
                                    </div>
                                </a>
                            {/each}
                        </div>
                    {:else}
                        <div class="inventory-table-container {itemSize}">
                            <div class="inventory-header">
                                <div class="header-items">
                                    <div class="header-item name">
                                        <button onclick="{() => {handler?.updateFilterOrder('name')}}" class="header-button {handler?.filters?.current === 'name' ? 'active' : ''}">
                                            {locale.generics.name}
                                            {#if handler?.filters?.current === 'name'}
                                                {#if handler?.filters.order === 'DESC'}
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M17 4V15M17 15L13 11M17 15L21 11M7 4V20M7 20L3 16M7 20L11 16"
                                                              stroke="currentColor"
                                                              stroke-width="2"
                                                              stroke-linecap="round"
                                                              stroke-linejoin="round"/>
                                                    </svg>
                                                {:else}
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M7 20V4M7 4L3 8M7 4L11 8M17 20V9M17 9L13 13M17 9L21 13"
                                                              stroke="currentColor"
                                                              stroke-width="2"
                                                              stroke-linecap="round"
                                                              stroke-linejoin="round"/>
                                                    </svg>
                                                {/if}
                                            {:else}
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0;">
                                                    <path d="M7 4V20M7 20L3 16M7 20L11 16M17 20V4M17 4L13 8M17 4L21 8"
                                                          stroke="currentColor"
                                                          stroke-width="2"
                                                          stroke-linecap="round"
                                                          stroke-linejoin="round"/>
                                                </svg>
                                            {/if}
                                        </button>
                                    </div>
                                    <div class="header-item part-number">
                                        <button onclick="{() => {handler?.updateFilterOrder('part_number')}}" class="header-button {handler?.filters?.current === 'part_number' ? 'active' : ''}">
                                            {locale.generics.part_number_short}
                                            {#if handler?.filters?.current === 'part_number'}
                                                {#if handler?.filters.order === 'DESC'}
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M17 4V15M17 15L13 11M17 15L21 11M7 4V20M7 20L3 16M7 20L11 16"
                                                              stroke="currentColor"
                                                              stroke-width="2"
                                                              stroke-linecap="round"
                                                              stroke-linejoin="round"/>
                                                    </svg>
                                                {:else}
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M7 20V4M7 4L3 8M7 4L11 8M17 20V9M17 9L13 13M17 9L21 13"
                                                              stroke="currentColor"
                                                              stroke-width="2"
                                                              stroke-linecap="round"
                                                              stroke-linejoin="round"/>
                                                    </svg>
                                                {/if}
                                            {:else}
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0;">
                                                    <path d="M7 4V20M7 20L3 16M7 20L11 16M17 20V4M17 4L13 8M17 4L21 8"
                                                          stroke="currentColor"
                                                          stroke-width="2"
                                                          stroke-linecap="round"
                                                          stroke-linejoin="round"/>
                                                </svg>
                                            {/if}
                                        </button>
                                    </div>
                                    <div class="header-item updated">
                                        <button onclick="{() => {handler?.updateFilterOrder('last_update')}}" class="header-button {handler?.filters?.current === 'last_update' ? 'active' : ''}">
                                            {locale.generics.updated}
                                            {#if handler?.filters?.current === 'last_update'}
                                                {#if handler?.filters.order === 'DESC'}
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M17 4V15M17 15L13 11M17 15L21 11M7 4V20M7 20L3 16M7 20L11 16"
                                                              stroke="currentColor"
                                                              stroke-width="2"
                                                              stroke-linecap="round"
                                                              stroke-linejoin="round"/>
                                                    </svg>
                                                {:else}
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M7 20V4M7 4L3 8M7 4L11 8M17 20V9M17 9L13 13M17 9L21 13"
                                                              stroke="currentColor"
                                                              stroke-width="2"
                                                              stroke-linecap="round"
                                                              stroke-linejoin="round"/>
                                                    </svg>
                                                {/if}
                                            {:else}
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0;">
                                                    <path d="M7 4V20M7 20L3 16M7 20L11 16M17 20V4M17 4L13 8M17 4L21 8"
                                                          stroke="currentColor"
                                                          stroke-width="2"
                                                          stroke-linecap="round"
                                                          stroke-linejoin="round"/>
                                                </svg>
                                            {/if}
                                        </button>
                                    </div>
                                    <div class="header-item price">
                                        <button onclick="{() => {handler?.updateFilterOrder('price')}}" class="header-button {handler?.filters?.current === 'price' ? 'active' : ''}">
                                            {locale.generics.price}
                                            {#if handler?.filters?.current === 'price'}
                                                {#if handler?.filters.order === 'DESC'}
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M17 4V15M17 15L13 11M17 15L21 11M7 4V20M7 20L3 16M7 20L11 16"
                                                              stroke="currentColor"
                                                              stroke-width="2"
                                                              stroke-linecap="round"
                                                              stroke-linejoin="round"/>
                                                    </svg>
                                                {:else}
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M7 20V4M7 4L3 8M7 4L11 8M17 20V9M17 9L13 13M17 9L21 13"
                                                              stroke="currentColor"
                                                              stroke-width="2"
                                                              stroke-linecap="round"
                                                              stroke-linejoin="round"/>
                                                    </svg>
                                                {/if}
                                            {:else}
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0;">
                                                    <path d="M7 4V20M7 20L3 16M7 20L11 16M17 20V4M17 4L13 8M17 4L21 8"
                                                          stroke="currentColor"
                                                          stroke-width="2"
                                                          stroke-linecap="round"
                                                          stroke-linejoin="round"/>
                                                </svg>
                                            {/if}
                                        </button>
                                    </div>
                                    <div class="header-item amount">
                                        <button onclick="{() => {handler?.updateFilterOrder('amount')}}" class="header-button {handler?.filters?.current === 'amount' ? 'active' : ''}">
                                            {locale.generics.amount}
                                            {#if handler?.filters?.current === 'amount'}
                                                {#if handler?.filters.order === 'DESC'}
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M17 4V15M17 15L13 11M17 15L21 11M7 4V20M7 20L3 16M7 20L11 16"
                                                              stroke="currentColor"
                                                              stroke-width="2"
                                                              stroke-linecap="round"
                                                              stroke-linejoin="round"/>
                                                    </svg>
                                                {:else}
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M7 20V4M7 4L3 8M7 4L11 8M17 20V9M17 9L13 13M17 9L21 13"
                                                              stroke="currentColor"
                                                              stroke-width="2"
                                                              stroke-linecap="round"
                                                              stroke-linejoin="round"/>
                                                    </svg>
                                                {/if}
                                            {:else}
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0;">
                                                    <path d="M7 4V20M7 20L3 16M7 20L11 16M17 20V4M17 4L13 8M17 4L21 8"
                                                          stroke="currentColor"
                                                          stroke-width="2"
                                                          stroke-linecap="round"
                                                          stroke-linejoin="round"/>
                                                </svg>
                                            {/if}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="inventory-table">
                                {#if isLoaded }
                                    {#if handler && !handler.isEmpty }
                                        {#each handler?.currentItems as item}
                                            <a data-sveltekit-preload-data="tap" href='{window.location.href}/item/{item.uuid}'
                                               class="inventory-table-entry {handler.partialFill ? '' : 'no-bottom-border'}">
                                                <div class="entry-item meta">
                                                    <div class="name-label">
                                                        <h1 class="name">{item.name}</h1>
                                                        {#each item.labels as {name, color}}
                                                            <div class="label {color}">
                                                                <p class="label-title">{name}</p>
                                                            </div>
                                                        {/each}
                                                    </div>
                                                    <span class="description">
                                                        {#if item.description}
                                                                {item.description}
                                                            {:else}
                                                                {locale.generics.no_description_set}
                                                            {/if}
                                                    </span>
                                                </div>
                                                <div class="entry-item part-number">
                                                    {#if !item.part_number}
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M18.5708 20C19.8328 20 20.8568 18.977 20.8568 17.714V13.143L21.9998 12L20.8568 10.857V6.286C20.8568 5.023 19.8338 4 18.5708 4M5.429 4C4.166 4 3.143 5.023 3.143 6.286V10.857L2 12L3.143 13.143V17.714C3.143 18.977 4.166 20 5.429 20"
                                                                  stroke="currentColor"
                                                                  stroke-width="2"
                                                                  stroke-linecap="round"
                                                                  stroke-linejoin="round"/>
                                                        </svg>
                                                    {:else}
                                                        {item.part_number ?? 0}
                                                    {/if}
                                                </div>
                                                <div class="entry-item updated">
                                                    {item?.last_update ? parseTimestamp(item.last_update instanceof Date ? item.last_update.getTime() : Date.parse(String(item.last_update))) : 'Unknown'}
                                                </div>
                                                <div class="entry-item price">
                                                    {getCurrencyFormat(item.currency).replace('%value%', String(item.current_price ?? 0))}
                                                </div>
                                                <div class="entry-item amount">
                                                    {item.amount.toLocaleString('da-DK')}
                                                </div>
                                                <div class="quick-delete">
                                                    <button title="Delete Item" onclick="{() => {
                                                    deleteItem({id: item.uuid, user: user.uuid});
                                                }}">
                                                        <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </a>
                                        {/each}
                                    {:else}
                                        <div class="empty-inventory-table">
                                        <span class="text-theme-text-third">
                                            {#if navigator.onLine }
                                                {locale.inventory.id.create_first_item}
                                            {:else}
                                                {locale.inventory.id.no_internet}.
                                            {/if}
                                        </span>
                                        </div>
                                    {/if}
                                {:else}
                                    <div class="inventory-list-loading">
                                        <div class="spinner">
                                            <svg width="24" height="24" viewBox="0 0 24 24">
                                                <rect width="10" height="10" x="1" y="1" fill="currentColor" rx="1">
                                                    <animate id="SVG7WybndBt" fill="freeze" attributeName="x" begin="0;SVGo3aOUHlJ.end" dur="0.2s" values="1;13"/>
                                                    <animate id="SVGVoKldbWM" fill="freeze" attributeName="y" begin="SVGFpk9ncYc.end" dur="0.2s" values="1;13"/>
                                                    <animate id="SVGKsXgPbui" fill="freeze" attributeName="x" begin="SVGaI8owdNK.end" dur="0.2s" values="13;1"/>
                                                    <animate id="SVG7JzAfdGT" fill="freeze" attributeName="y" begin="SVG28A4To9L.end" dur="0.2s" values="13;1"/>
                                                </rect>
                                                <rect width="10" height="10" x="1" y="13" fill="currentColor" rx="1">
                                                    <animate id="SVGUiS2jeZq" fill="freeze" attributeName="y" begin="SVG7WybndBt.end" dur="0.2s" values="13;1"/>
                                                    <animate id="SVGU0vu2GEM" fill="freeze" attributeName="x" begin="SVGVoKldbWM.end" dur="0.2s" values="1;13"/>
                                                    <animate id="SVGOIboFeLf" fill="freeze" attributeName="y" begin="SVGKsXgPbui.end" dur="0.2s" values="1;13"/>
                                                    <animate id="SVG14lAaeuv" fill="freeze" attributeName="x" begin="SVG7JzAfdGT.end" dur="0.2s" values="13;1"/>
                                                </rect>
                                                <rect width="10" height="10" x="13" y="13" fill="currentColor" rx="1">
                                                    <animate id="SVGFpk9ncYc" fill="freeze" attributeName="x" begin="SVGUiS2jeZq.end" dur="0.2s" values="13;1"/>
                                                    <animate id="SVGaI8owdNK" fill="freeze" attributeName="y" begin="SVGU0vu2GEM.end" dur="0.2s" values="13;1"/>
                                                    <animate id="SVG28A4To9L" fill="freeze" attributeName="x" begin="SVGOIboFeLf.end" dur="0.2s" values="1;13"/>
                                                    <animate id="SVGo3aOUHlJ" fill="freeze" attributeName="y" begin="SVG14lAaeuv.end" dur="0.2s" values="1;13"/>
                                                </rect>
                                            </svg>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                            <div class="inventory-footer">
                                <div class="inventory-footer-items">
                                    <button class="pagination-back-button pagination-button{ handler?.isFirstPage ? ' disabled' : '' }"
                                            onclick={() => handler?.firstPage()} title="Switch to previous page">
                                        <svg width="19" height="19" viewBox="0 0 16 16">
                                            <path fill="currentColor" fill-rule="evenodd"
                                                  d="M7.721 2.22a.75.75 0 0 1 1.061 1.06L4.061 8.002l4.721 4.721a.75.75 0 0 1-1.06 1.061L2.47 8.532a.75.75 0 0 1 0-1.06L7.722 2.22Zm5 0a.75.75 0 0 1 1.061 1.06L9.061 8.002l4.721 4.721a.75.75 0 0 1-1.06 1.061L7.47 8.532a.75.75 0 0 1 0-1.06z"
                                                  clip-rule="evenodd"/>
                                        </svg>
                                    </button>
                                    <button class="pagination-back-button pagination-button{ handler?.isFirstPage ? ' disabled' : '' }"
                                            onclick={() => handler?.previousPage()} title="Switch to previous page">
                                        <svg width="19" height="19" viewBox="0 0 16 16">
                                            <path fill="currentColor" fill-rule="evenodd"
                                                  d="M10.78 2.22a.75.75 0 0 0-1.06 0L4.468 7.472a.75.75 0 0 0 0 1.06l5.252 5.252a.75.75 0 1 0 1.06-1.06L6.06 8.001l4.72-4.721a.75.75 0 0 0 0-1.06"
                                                  clip-rule="evenodd"/>
                                        </svg>
                                    </button>
                                    <p class="pagination-current-page">
                                        {handler?.page}
                                    </p>
                                    <button class="pagination-forward-button pagination-button{ handler?.isLastPage ? ' disabled' : '' }"
                                            onclick={() => handler?.nextPage()} title="Switch to next page">
                                        <svg width="19" height="19" viewBox="0 0 16 16">
                                            <path fill="currentColor" fill-rule="evenodd"
                                                  d="M5.22 2.22a.75.75 0 0 1 1.06 0l5.252 5.252a.75.75 0 0 1 0 1.06L6.28 13.784a.75.75 0 1 1-1.06-1.06l4.72-4.723L5.22 3.28a.75.75 0 0 1 0-1.06"
                                                  clip-rule="evenodd"/>
                                        </svg>
                                    </button>
                                    <button class="pagination-forward-button pagination-button{ handler?.isLastPage ? ' disabled' : '' }"
                                            onclick={() => handler?.lastPage()} title="Switch to next page">
                                        <svg width="19" height="19" viewBox="0 0 16 16">
                                            <path fill="currentColor" fill-rule="evenodd"
                                                  d="M3.53 2.22a.75.75 0 0 0-1.06 1.06l4.72 4.722l-4.72 4.721a.75.75 0 0 0 1.06 1.061l5.252-5.252a.75.75 0 0 0 0-1.06zm5 0a.75.75 0 0 0-1.06 1.06l4.721 4.722l-4.721 4.721a.75.75 0 0 0 1.06 1.061l5.252-5.252a.75.75 0 0 0 0-1.06z"
                                                  clip-rule="evenodd"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    {/if}
                </section>
            </section>
        </section>
    </div>
    <div class="blur-box"></div>
</div>

<style>
    :root {
        --inventory-header-height: 6rem;
    }

    .page-content {
        color: var(--theme-color-white);

        .blur-box {
            position: absolute;
            width: 92rem;
            height: 8rem;
            background: var(--theme-background-blur-main);

            top: 12rem;
            margin: 0 calc(50vw - 46rem);

            filter: blur(80px) brightness(.7);

            animation: backgroundAnimation 10s infinite ease;
        }
    }

    .inventory-table * {
        transition: 100ms;
        transition-timing-function: cubic-bezier(0.5, 0.25, .5, .45) !important;
    }

    .auto-hide-filter-icon {
        opacity: 0;

        transition: 1750ms 500ms ease-in-out,
        transform 0ms;
    }

    .body-section {
        max-height: fit-content;
        height: 100vh;
        overflow: visible;
        box-sizing: border-box;
        width: 100vw;
        position: absolute;
        z-index: 1 !important;
    }

    .inventory-outer-section {
        max-height: 100%;
        overflow: auto;
        overflow-y: scroll;
        overflow-x: hidden;
        scrollbar-width: none;
    }

    .inventory-section {
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        padding-top: 4rem;

        width: 100vw;
        height: fit-content;

        .inventory-header-section {
            display: flex;
            flex-flow: column nowrap;
            align-items: center;
            align-content: center;
            margin: .5rem 0;

            .inventory-header-content {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: space-between;

                width: 80rem;
                padding: 2rem 0;

                .inventory-name {
                    display: flex;
                    flex-flow: row nowrap;
                    align-items: center;
                    justify-content: flex-start;
                    overflow: visible;
                    user-select: none;

                    h1 {
                        font-family: 'FunnelDisplay', sans-serif;
                        font-size: 2.5rem;
                        font-weight: 900;

                        background-image: var(--theme-text-gradient);
                        background-clip: text;
                        color: transparent;

                        filter: drop-shadow(0 0 2rem rgba(from var(--theme-text) r g b / .4));
                    }

                    .primary-inventory-bookmark-icon {
                        svg {
                            stroke-width: 2.5;
                            height: 1.85rem;
                            width: 1.85rem;
                            color: var(--theme-text);
                            align-self: center;
                            margin-top: .2rem;
                            margin-left: .35rem;
                            cursor: pointer;
                        }
                    }

                    .primary-inventory-bookmark-icon:hover {
                        svg {
                            color: var(--theme-color-accent);
                        }
                    }
                }

                .header-buttons {
                    display: flex;
                    flex-flow: row nowrap;
                    gap: .5rem;

                    .size-switcher {
                        color: var(--theme-color-base);

                        gap: 0;
                        padding: 0;

                        .size-switcher-button-seperator {
                            background: linear-gradient(0deg, rgba(from var(--theme-border-button) r g b / .5) 0%, var(--theme-border-button) 50%, rgba(from var(--theme-border-button) r g b / .5) 100%);
                            opacity: .5;
                            width: 4px;
                            height: 65%;
                            border-radius: .05rem;
                        }

                        button {
                            display: flex;
                            align-items: center;
                            justify-content: center;

                            height: 100%;
                            width: 100%;
                            cursor: pointer;

                            padding: 0 .375rem;

                            svg {
                                max-height: 1.3rem;
                            }
                        }

                        button:first-child {
                            padding-right: .45rem;
                            padding-left: .70rem;
                        }

                        button:last-child {
                            padding-left: .45rem;
                            padding-right: .6rem;
                        }

                        button.selected {
                            color: var(--theme-color-accent);

                            svg {
                                stroke-width: 2.5;
                            }
                        }

                        button:hover {
                            color: var(--theme-color-accent);
                        }
                    }

                    #create-item-button-no-items {
                        position: relative;
                        pointer-events: none !important;

                        align-self: center;
                        transform: translateX(-14.75rem);

                        overflow: visible;

                        height: 0 !important;
                        width: 0 !important;

                        z-index: 500;

                        #create-item-button-no-items-mask {

                            position: absolute;
                            content: '';

                            overflow: hidden;

                            align-self: center;
                            align-content: center;

                            mask-image: linear-gradient(to right ,black 0%, white 45%, white 55%, black 100%);
                            mask-mode: luminance;

                            height: 12rem;
                            width: 4rem;

                            filter: blur(2px) brightness(2) contrast(1.25) saturate(1.15);

                            animation: buttonBorderRotationAnim 1.5s infinite linear, buttonBorderGrayscaleAnim 4s infinite ease;

                            z-index: 320;

                            #child {
                                justify-self: center;
                                width: 8rem !important;
                                height: 2.6rem !important;
                                border: .1rem solid;
                                border-radius: var(--theme-border-radius);
                                filter: blur(1px) brightness(2) contrast(2) saturate(1.25);
                                border-color: oklch(58.6% 0.253 17.585);

                                animation: buttonBorderRotationAnim 1.5s infinite linear reverse, buttonBorderColorAnim 2.5s infinite ease;
                            }
                        }
                    }

                    .create-item-button {
                        width: 8rem;
                        height: 2.6rem;

                    }

                    .refresh-button, .inventory-settings-button {
                        padding: .5em 1em !important;
                    }

                    .filters-button.open, .create-item-button.open {
                        color: var(--theme-color-accent);
                        fill: var(--theme-color-accent);

                        transition: var(--theme-transition-in);
                    }

                    .refresh-button, .filters-button, .create-item-button, .inventory-settings-button {
                        stroke-width: 1.8;
                        transition: var(--theme-transition-out);
                    }

                    .size-switcher:hover svg, .refresh-button:hover, .filters-button:hover, .create-item-button:hover, .inventory-settings-button:hover {
                        stroke-width: 2.25;

                        transition: var(--theme-transition-in);
                    }

                    .refresh-button, .inventory-settings-button {
                        svg {
                            transform: rotate(0deg);
                            transition-duration: 500ms;
                            transition-timing-function: cubic-bezier(.5, .5, -.1, 3) !important;
                        }
                    }

                    .refresh-button:hover {
                        svg {
                            transform: rotate(360deg);
                            transition-duration: 250ms;
                            transition-timing-function: cubic-bezier(1, .4, .4, 1) !important;
                        }
                    }

                    .refresh-button:active {
                        svg {
                            transform: rotate(580deg);
                            transition-duration: 50ms;
                            transition-timing-function: cubic-bezier(.25, .4, .1, 2) !important;
                        }
                    }
                }
            }
        }

        .extra-container {
            display: flex;
            flex-flow: column wrap;
            justify-content: flex-start;

            width: 90rem;
            opacity: 0;
            margin-top: 0;
            margin-bottom: 2.5rem;
            height: 0;
            z-index: auto;

            transition: 125ms ease-in-out;

            background: var(--theme-background-container);
            border-color: var(--theme-border-container);
            border-width: var(--theme-border-width);
            border-radius: var(--theme-border-radius);

            .header {
                h1 {
                    font-size: 1.7rem;
                    font-family: 'FunnelDisplay', sans-serif;
                    font-weight: 650;
                    color: var(--theme-text);
                    margin-bottom: 1rem;
                }
            }

            .extra-container-button {
                background: var(--theme-background-button);
                border: var(--theme-border-width) solid var(--theme-border-button);
                border-radius: var(--theme-border-radius);
                padding: .75rem 1.5rem;

                color: var(--theme-text);
                font-size: 1rem;
                font-weight: 700;

                gap: .25rem;

                cursor: pointer;
                user-select: none;

                transition: filter 100ms ease-in-out;
            }

            .extra-container-button:hover {
                background: var(--theme-background-button-hover);
            }

            .extra-container-button:active {
                transform: scale(0.975);
            }
        }

        .extra-container.open {
            padding: 1.75rem 2.5rem;
            visibility: visible;
            height: fit-content;
            opacity: 1;
            z-index: 2000;
        }

        .extra-container.closed {
            visibility: hidden;
            margin-top: 0;
            opacity: 0;
        }

        .extra-container.create-item-container {
            display: flex;
            align-items: flex-start;
            align-content: center;
            z-index: 2000;

            color: var(--theme-text);
            font-family: 'FunnelDisplay', sans-serif;

            form {
                width: 100%;

                input {
                    background: var(--theme-background-input);
                    border: var(--theme-border-width) solid var(--theme-border-input);
                    border-radius: var(--theme-border-radius);
                    margin-bottom: .25rem;

                    font-family: 'FunnelSans', sans-serif;
                    color: var(--theme-text);
                    caret-color: var(--theme-text);

                    transition: border-color var(--theme-transition-out);

                    resize: none;
                }

                input:focus {
                    box-shadow: none;
                    border-color: var(--theme-border-input-focus);

                    transition: border-color var(--theme-transition-in),
                    box-shadow 0ms linear;
                }

                .option-container:first-child {
                    width: 100% !important;
                    margin-right: .35rem;
                }

                .option-container:last-child {
                    margin-left: .35rem;
                }

                .option-container {
                    h1 {
                        font-size: 1.1rem;
                        margin-top: .5rem;
                        margin-bottom: .25rem;
                    }
                }
            }
        }

        .extra-container.inventory-filter-container {
            z-index: 2000 !important;

            .header {
                .filters-save-button {
                    svg {
                        width: 1.75rem;
                        height: 1.75rem;
                        color: var(--theme-text);
                    }
                }

                .filters-save-button.default {
                    svg {
                        color: var(--theme-text-third);
                        opacity: .5;
                    }
                }

                .filters-save-button.new {
                    cursor: pointer;

                    svg {
                        color: var(--theme-text);
                    }
                }

                .filters-save-button.new:hover {
                    svg {
                        color: var(--theme-text-accent);
                    }
                }
            }

            .filters {
                display: flex;
                flex-flow: row wrap;
                align-items: center;
                justify-content: flex-start;
                width: 100%;
                height: fit-content;

                .filter {
                    flex: 1;
                    align-items: center;
                    color: var(--theme-text);
                    font-family: 'Google Sans', sans-serif;

                    .filter-button.off {
                        filter: saturate(.5) opacity(.5);
                        transition: filter 100ms ease-in-out;
                    }
                }

                .filter h1 {
                    font-weight: 600;
                    font-size: 1.1rem;
                    margin-bottom: .3rem;
                }

                .filter.columns {
                    .buttons {
                        display: flex;
                        flex-flow: row wrap;
                        justify-content: flex-start;
                        gap: .25rem;
                    }
                }

                .filter.row-amount {
                    align-items: flex-start;
                    justify-content: flex-start;

                    .row-amount.selected {
                        background: var(--theme-background-button-selected);
                    }
                }
            }
        }

        .inventory-body-section {
            user-select: none !important;

            .inventory-table-container,
            .inventory-table-container.small,
            .inventory-table-container.large {
                transition: var(--theme-transition-in),
                transform var(--theme-transition-out);
            }

            .inventory-table-container {

                margin: 0 0 4rem 0;

                background: rgba(from var(--theme-background-container) r g b / .85);
                backdrop-filter: var(--theme-backdrop-container);
                border: var(--theme-border-width) solid var(--theme-border-container);
                border-radius: .35rem;
                color: var(--theme-text);

                width: 90vw;
                min-width: 60rem;
                max-width: 125rem;
                z-index: inherit;

                .inventory-header {
                    border-width: var(--theme-border-width);
                    width: 100%;
                    border-color: transparent;
                    border-bottom-color: inherit;
                    height: 2.5rem !important;

                    .header-items {
                        display: flex;
                        flex-flow: row nowrap;
                        height: 100%;
                        width: 100%;

                        padding: 0 1.5rem;

                        transition: padding 75ms ease;

                        .header-item.name .header-button svg {
                            transform: translateX(2.75rem);
                        }

                        .header-item.part-number .header-button svg {
                            transform: translateX(3.55rem);
                        }

                        .header-item.updated .header-button svg {
                            transform: translateX(3.9rem);
                        }

                        .header-item.price .header-button svg {
                            transform: translateX(2.35rem);
                        }

                        .header-item.amount .header-button svg {
                            transform: translateX(3.7rem);
                        }

                        .header-item {
                            flex: 1;

                            display: flex;
                            flex-flow: row nowrap;
                            align-items: center;
                            justify-content: center;

                            font-family: 'FunnelSans', sans-serif;
                            font-weight: 600;

                            .header-button {
                                cursor: pointer;
                                display: flex;
                                flex-flow: row nowrap;
                                gap: .25rem;

                                svg {
                                    width: 1.25rem;
                                    height: 1.25rem;
                                    align-self: center;

                                    position: absolute;

                                    transition: 65ms ease-out;
                                }
                            }

                            .header-button.active {
                                svg {
                                    opacity: 1 !important;

                                    transition: 50ms ease-out;
                                }
                            }

                            .header-button:hover {
                                color: var(--theme-color-accent);
                                filter: brightness(1.1) drop-shadow(0 0 .75rem rgba(from currentColor r g b / .15));

                                svg {
                                    opacity: 1 !important;

                                    transition: 50ms ease-out;
                                }
                            }
                        }
                    }
                }

                .inventory-table {
                    display: flex;
                    flex-flow: column nowrap;
                    justify-content: flex-start;
                    height: 37.1rem;
                    min-height: fit-content;

                    .empty-inventory-table {
                        display: flex;
                        align-content: center;
                        align-items: center;
                        justify-content: center;
                        height: 100%;

                        span {
                            margin: auto;
                            font-size: 1.05rem;
                        }
                    }

                    .inventory-list-loading {
                        display: flex;
                        align-content: center;
                        align-items: center;
                        justify-content: center;
                        height: 12rem;

                        .spinner {
                            height: 3rem;
                            width: 3rem;

                            svg {
                                height: 100%;
                                width: 100%;
                            }
                        }
                    }

                    .inventory-table-entry:nth-of-type(odd) {
                        background: rgba(from var(--theme-background-list-odd) r g b / .25);
                    }

                    .inventory-table-entry.no-bottom-border:last-child {
                        border-bottom-color: transparent;
                    }

                    .inventory-table-entry {
                        display: flex;
                        flex-flow: row nowrap;
                        justify-content: center;
                        align-items: center;
                        align-content: center;

                        width: 100%;
                        padding-left: 1.5rem;
                        box-sizing: border-box;
                        overflow: hidden;

                        background: rgba(from var(--theme-background-list-even) r g b / .25);
                        border-bottom: var(--theme-border-width) solid var(--theme-border-container);

                        .image {
                            visibility: hidden;
                        }

                        .meta {
                            flex: 1 35%;
                        }

                        .entry-item.part-number {
                            svg {
                                color: var(--theme-text-fourth);
                            }
                        }

                        .entry-item {
                            flex: 1;

                            display: flex;
                            flex-flow: row nowrap;
                            align-items: center;
                            align-content: center;
                            justify-content: center;

                            font-family: 'FunnelSans', sans-serif;
                        }

                        .entry-item.meta {
                            .name-label {
                                display: flex;
                                flex-flow: row nowrap;
                                align-items: center;
                                justify-content: flex-start;
                                gap: .3rem;
                            }
                        }

                        .quick-delete {
                            align-items: center;
                            opacity: 0;
                            filter: blur(2px);

                            transition: 350ms,
                            opacity 500ms,
                            filter 400ms ease;
                            transition-timing-function: cubic-bezier(0.57, 0.1, 0.25, 1.5) !important;
                            user-select: none;

                            z-index: 25;

                            button {
                                cursor: pointer;

                                svg {
                                    justify-self: center;
                                    stroke: var(--theme-text);
                                    width: 100%;
                                    height: 100%;

                                    padding: .4em .25em;

                                    background: var(--theme-background-button);
                                    border: .122em solid var(--theme-border-button);
                                    border-radius: .7em;
                                    transition: 35ms ease-in-out;
                                }
                            }

                            button:hover {
                                svg {
                                    background: var(--theme-background-button-hover);
                                    stroke: oklch(58.6% 0.253 17.585) !important;
                                    stroke-width: 2.25;
                                    transition: 10ms linear;
                                }
                            }
                        }
                    }

                    .inventory-table-entry:hover {
                        background: var(--theme-background-button-hover);
                        filter: brightness(1.1);

                        .quick-delete {
                            opacity: 1;
                            filter: blur(0px);
                            transition: 15ms;
                            transition-timing-function: cubic-bezier(0.57, 0.1, 0.25, 1.5) !important;

                            svg {
                                stroke: var(--theme-text);
                            }
                        }
                    }
                }

                .inventory-footer {
                    border-color: transparent;
                    border-top-color: inherit;
                    border-width: var(--theme-border-width);
                    width: 100%;
                    height: 2.5rem !important;

                    .inventory-footer-items {
                        display: flex;
                        flex-flow: row nowrap;
                        align-items: center;
                        justify-content: center;
                        gap: 1rem;
                        height: 100%;

                        font-family: 'FunnelSans', sans-serif;

                        .pagination-current-page {
                            width: 3rem;

                            text-align: center;
                            font-weight: 500;
                        }

                        .pagination-button {
                            cursor: pointer;
                            color: var(--theme-text);
                        }

                        .pagination-button:hover {
                            color: var(--theme-text-accent);
                        }

                        .pagination-button.disabled {
                            cursor: initial;
                            color: var(--theme-text-third);
                            pointer-events: none;
                        }
                    }
                }
            }

            .inventory-table-container.small {
                .inventory-header {
                    .header-items {
                        padding-left: 1rem;
                        transition: padding 75ms ease;
                    }

                    .header-item:first-child {
                        flex: 1 35%;
                        justify-content: flex-start;
                    }

                    .header-item:last-child {
                        margin-right: 2.5rem;
                    }
                }

                .inventory-table-entry {
                    padding-left: 1rem;
                    height: 2.475rem;

                    .quick-delete {
                        margin-top: .425rem;
                        padding: 0 1rem;

                        button {
                            width: 2rem;
                            height: 2rem;
                        }
                    }

                    .image {
                        visibility: force-hidden;
                        position: absolute;
                    }

                    .meta {
                        flex: 1 35%;
                        justify-content: flex-start;

                        .name-label {
                            .name {
                                margin: 0;
                                padding-right: .4rem;
                                font-size: 1.05rem;
                                font-weight: 550;
                            }
                        }
                    }

                    .entry-item {
                        line-clamp: 1;
                        text-wrap: nowrap;
                        height: fit-content;
                        max-height: 2rem !important;

                        .description {
                            visibility: hidden;
                            position: absolute;
                        }
                    }
                }
            }

            .inventory-table-container.large {
                .inventory-header {
                    .header-item:first-child {
                        flex: 1 35%;
                        justify-content: flex-start;
                    }

                    .header-item {
                        flex: 1;
                    }

                    .header-item:last-child {
                        margin-right: 1.5rem;
                    }
                }

                .inventory-table {
                    .inventory-table-entry:first-child {
                        border-top-color: transparent;
                    }

                    .inventory-table-entry {
                        height: 5rem;

                        .quick-delete {
                            padding: 0 .5rem;

                            button {
                                width: 2.25rem;
                                height: 2.25rem;
                            }
                        }

                        .entry-item {
                            flex: 1;
                        }

                        .meta {
                            flex: 1 35%;

                            display: flex;
                            flex-flow: column nowrap;
                            align-items: flex-start;
                            justify-content: flex-start;

                            .name-label {
                                .name {
                                    font-weight: 700;
                                    font-size: 1.5rem;
                                    max-width: 50rem;
                                    line-clamp: 1 !important;
                                    text-overflow: ellipsis;
                                    overflow: hidden;
                                    text-wrap: nowrap;
                                }
                            }

                            .description {
                                font-size: 0.85rem;
                                color: var(--theme-text-third);
                                line-clamp: 2 !important;
                                text-overflow: ellipsis;
                                max-width: 50rem;
                                overflow: hidden;

                                transition: color 300ms 100ms ease;
                            }
                        }

                        .price, .amount, .updated {
                            text-align: center;
                        }
                    }

                    .name-label {
                        flex: 1 0 70%;
                    }

                    .price {
                        flex: 1 0 10%;
                    }

                    .amount {
                        flex: 1 0 10%;
                    }
                }
            }

            .inventory-list-container {
                height: fit-content;
                box-sizing: border-box;
                margin: 0 0 4rem 0;

                color: var(--theme-text);

                width: 90vw;
                min-width: fit-content;
                max-width: 125rem;

                .inventory-list-entry {
                    display: flex;
                    flex-flow: row nowrap;
                    justify-content: flex-start;

                    width: 100%;
                    height: 100%;

                    padding: 1rem .5rem;
                    margin: .5rem 0;

                    background: var(--theme-background-container);
                    border: var(--theme-border-width) solid var(--theme-border-container);
                    border-radius: .35rem;

                    .entry-item.image {
                        height: 100%;
                        margin: auto 1rem;

                        svg {
                            width: 2.25rem;
                            height: 2.25rem;
                        }
                    }

                    .entry-item.meta {
                        height: 100%;
                        margin: auto 1rem auto 0;

                        .name {
                            font-size: 1.2rem;
                            font-weight: 700;
                            text-wrap: nowrap;
                        }
                    }

                    .entry-item.labels {
                        display: flex;
                        flex-flow: row nowrap;
                        align-items: center;
                        gap: .25rem;
                    }
                }
            }
        }
    }

    @keyframes backgroundAnimation {
        0%, 100% {
            opacity: .8;
        }
        50% {
            opacity: .75;
        }
    }

    @keyframes buttonBorderGrayscaleAnim {
        0%,20%,80%,100% {
            filter: grayscale(0%) brightness(2);
        }
        50% {
            filter: grayscale(100%) brightness(2);
        }
    }

    @keyframes buttonBorderColorAnim {
        0%,100% {
            filter: blur(1px) brightness(2) contrast(2) saturate(1.25) hue-rotate(0deg) brightness(2);
        }
        50% {
            filter: blur(1px) brightness(2) contrast(2) saturate(1.25) hue-rotate(360deg) brightness(2);
        }
    }

    @keyframes buttonBorderRotationAnim {
        0% {
            transform: rotate(0deg);
        }
        25% {
            transform: rotate(110deg);
        }
        50% {
            transform: rotate(180deg);
        }
        75% {
            transform: rotate(250deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>