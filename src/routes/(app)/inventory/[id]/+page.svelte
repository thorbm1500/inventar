<script module lang="ts">
    import {error} from '@sveltejs/kit';
    import {validate} from 'uuid';
    import type {Inventory} from "$lib/server/db/schema";
    import type {PageProps} from "../../../../../.svelte-kit/types/src/routes/(app)/inventory/[id]/$types";
    import type {Item, User} from "$lib/server/db/schema";
    import ItemCreator from "../components/ItemCreator.svelte";
    import ItemCreationSuccessfulToast from "../../../../components/Toasts/ItemCreationSuccessful.svelte";
    import GenericErrorToast from "../../../../components/Toasts/GenericError.svelte";
    import {parseTimestamp} from '$lib/utilities'
    import FilterSettings from "./utilities.svelte.js";
    import {getInventory, getItems, getTotalItemCount} from './data.remote.ts';
    import {Spring} from "svelte/motion";

    const imageModules = import.meta.glob('$lib/assets/uploads/item-images/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}',
        {
            eager: true,
            query: {
                enhanced: false
            }
        }
    )

    /*
    * <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><g fill="currentColor"><circle cx="5" cy="10" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="15" cy="10" r="2"/></g></svg>
    * <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><path fill="currentColor" fill-rule="evenodd" d="M4 5.543V4.25H3a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1h1a1 1 0 1 1 0 2H3a3 3 0 0 1-3-3v-3.5a3 3 0 0 1 3-3h1V.957a.5.5 0 0 1 .854-.353l2.292 2.292a.5.5 0 0 1 0 .708L4.854 5.896A.5.5 0 0 1 4 5.543m6 6.207v1.293a.5.5 0 0 1-.854.354l-2.292-2.293a.5.5 0 0 1 0-.708l2.292-2.292a.5.5 0 0 1 .854.353V9.75h1a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1h-1a1 1 0 1 1 0-2h1a3 3 0 0 1 3 3v3.5a3 3 0 0 1-3 3z" clip-rule="evenodd"/></svg>
    * Refresh icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 12q0-3.75 2.625-6.375T12 3V2q0-.3.275-.45t.525.05l3.125 2.35q.4.3.4.8t-.4.8L12.8 7.9q-.25.2-.525.05T12 7.5v-1q-2.275 0-3.888 1.613T6.5 12q0 .825.238 1.588T7.4 15q.275.4.225.863T7.2 16.6l-.85.625q-.45.35-1 .275t-.875-.55q-.725-1.075-1.1-2.325T3 12m9 9v1q0 .3-.275.45t-.525-.05l-3.125-2.35q-.4-.3-.4-.8t.4-.8L11.2 16.1q.25-.2.525-.05t.275.45v1q2.275 0 3.888-1.613T17.5 12q0-.825-.238-1.588T16.6 9q-.275-.4-.225-.862T16.8 7.4l.85-.625q.45-.35 1-.263t.875.538q.7 1.075 1.088 2.325T21 12q0 3.75-2.625 6.375T12 21"/></svg>
    * Row height: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M5 22q-.425 0-.712-.288T4 21t.288-.712T5 20h14q.425 0 .713.288T20 21t-.288.713T19 22zm7-3.425q-.2 0-.375-.062T11.3 18.3l-2.6-2.6q-.275-.275-.287-.687T8.7 14.3q.275-.275.688-.288t.712.263l.9.875v-6.3l-.9.875Q9.825 10 9.413 10T8.7 9.7q-.275-.275-.275-.7t.275-.7l2.6-2.6q.15-.15.325-.212T12 5.425t.375.063t.325.212l2.6 2.6q.275.275.287.688T15.3 9.7q-.275.275-.687.288t-.713-.263L13 8.85v6.3l.9-.875q.275-.275.688-.275t.712.3q.275.275.275.7t-.275.7l-2.6 2.6q-.15.15-.325.213t-.375.062M5 4q-.425 0-.712-.288T4 3t.288-.712T5 2h14q.425 0 .713.288T20 3t-.288.713T19 4z"/></svg>
    *  */
</script>

<script lang="ts">
    import {page} from "$app/state";
    import {getContext, onMount} from "svelte";
    import Utility from "../../browse/utility";

    if (!page.params.id || !validate(page.params.id)) {
        error(404, 'Inventory ID is required!');
    }

    const id = page.params.id;

    let {form}: PageProps = $props();
    const user: User = getContext('user');

    let inventory: Inventory | undefined = $state(undefined);
    let itemCount: number = $state(0);
    let totalPages = $state(0);
    let items: Item[] = $state.raw([]);

    //todo: Add option to save filters, and make them persistent for the user.
    const filterSettings: FilterSettings = new FilterSettings();

    onMount(async () => {
        const rawInventory = await getInventory(id);
        if (!rawInventory) error(404, 'Failed to find inventory!');
        inventory = rawInventory;
        totalPages = Math.ceil(itemCount / filterSettings.columnSize);

        itemCount = await getTotalItemCount(String(id)) ?? 0;
        // const userFilterSettings = getUserFilterSettings();
        // filterSettings.load(userFilterSettings); Set filter settings loaded from user data.
    })

    let creatorScale = $state(new Spring(0, {
        stiffness: 0.1,
        damping: 0.3
    }))

    let itemCreatorOpacity = $derived(creatorScale.current);
    let isItemCreatorOpen: boolean = $derived(itemCreatorOpacity !== 0);
    let isFilterContainerOpen: boolean = $state(false);

    /* Item Container*/
    let order_by = $state('name');
    let order = $state('');
    let currentPage = $state(1);

    await refresh();

    let nameFilter = $state('DEFAULT');
    let latestChangeFilter = $state('DEFAULT');
    let priceFilter = $state('DEFAULT');
    let itemsFilter = $state('DEFAULT');

    async function goToFirstPage() {
        currentPage = 1;
        await refresh();
    }

    async function goToLastPage() {
        currentPage = totalPages;
        await refresh();
    }

    async function updatePage(pageChange: number = 0) {
        currentPage += pageChange;
        await refresh();
    }

    async function refresh() {
        const offset = filterSettings.columnSize * (currentPage - 1);

        const newItems: Item[] = await getItems({inventory_uuid: String(page.params.id), amount: filterSettings.columnSize, order_by, order, offset}) || [];
        items = newItems;
    }

    async function updateFilter(filter: string, current: string) {
        const next = String(getNextState(current));

        if (next === 'DEFAULT') {
            order = '';
            order_by = 'name';

            nameFilter = 'DEFAULT';
            itemsFilter = 'DEFAULT';
            priceFilter = 'DEFAULT';
            latestChangeFilter = 'DEFAULT';
        } else {
            order = next;

            if (filter == 'name') {
                nameFilter = next;
                order_by = 'name';

                priceFilter = 'DEFAULT';
                itemsFilter = 'DEFAULT';
                latestChangeFilter = 'DEFAULT';
            } else if (filter == 'price') {
                priceFilter = next;
                order_by = 'price';

                itemsFilter = 'DEFAULT';
                nameFilter = 'DEFAULT';
                latestChangeFilter = 'DEFAULT';
            } else if (filter == 'amount') {
                itemsFilter = next;
                order_by = 'amount';

                nameFilter = 'DEFAULT';
                itemsFilter = 'DEFAULT';
                latestChangeFilter = 'DEFAULT';
            } else if (filter == 'last_modified') {
                latestChangeFilter = next;
                order_by = 'last_modified';

                nameFilter = 'DEFAULT';
                itemsFilter = 'DEFAULT';
                itemsFilter = 'DEFAULT';
            }
        }

        await refresh();
    }

    function getNextState(currentState: string) {
        switch (currentState) {
            case 'DESC':
                return 'ASC';
            case 'ASC':
                return 'DEFAULT';
            case 'DEFAULT':
                return 'DESC';
        }
    }
</script>

{#if form?.success }
    <div class="item-creation-success-toast generic-toast-parent-class play-animation">
        <ItemCreationSuccessfulToast/>
    </div>
{/if}

{#if form && form.failed }
    <div class="item-creation-failed-toast generic-toast-parent-class play-animation">
        {#if form.error }
            <GenericErrorToast error={String(form.error)}/>
        {:else}
            <GenericErrorToast/>
        {/if}
    </div>
{/if}

<div class="item-creation-container"
     style="opacity: {itemCreatorOpacity}; visibility: {isItemCreatorOpen ? 'visible' : 'hidden'}; transform: scale({itemCreatorOpacity});">
    <ItemCreator bind:creatorScale/>
</div>

<div class="page-content">
    <div class="body-section">
        <section class="inventory-outer-section">
            <section class="inventory-section">
                <section class="inventory-header-section">
                    <div class="inventory-header-content">
                        <div class="inventory-name">
                            <h1>{inventory ? inventory.name : 'Loading'}</h1>
                            <div class="primary-inventory-bookmark-icon">
                                {#if user.primary_inventory === page.params.id }
                                    <svg viewBox="0 0 24 24" fill="currentColor" class="size-6 primary-inventory-icon">
                                        <path fill-rule="evenodd"
                                              d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z"
                                              clip-rule="evenodd"/>
                                    </svg>
                                {:else}
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"/>
                                    </svg>
                                {/if}
                            </div>
                        </div>
                        <div class="header-buttons">
                            <button id="refresh-button" class="refresh-button" title="Refresh" onclick="{refresh}">
                                <svg fill="currentColor" width="24" height="24" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M3 12q0-3.75 2.625-6.375T12 3V2q0-.3.275-.45t.525.05l3.125 2.35q.4.3.4.8t-.4.8L12.8 7.9q-.25.2-.525.05T12 7.5v-1q-2.275 0-3.888 1.613T6.5 12q0 .825.238 1.588T7.4 15q.275.4.225.863T7.2 16.6l-.85.625q-.45.35-1 .275t-.875-.55q-.725-1.075-1.1-2.325T3 12m9 9v1q0 .3-.275.45t-.525-.05l-3.125-2.35q-.4-.3-.4-.8t.4-.8L11.2 16.1q.25-.2.525-.05t.275.45v1q2.275 0 3.888-1.613T17.5 12q0-.825-.238-1.588T16.6 9q-.275-.4-.225-.862T16.8 7.4l.85-.625q.45-.35 1-.263t.875.538q.7 1.075 1.088 2.325T21 12q0 3.75-2.625 6.375T12 21"/>
                                </svg>
                                Refresh
                            </button>
                            <button id="filters-button" class="filters-button" title="Filters" onclick={() => isFilterContainerOpen = !isFilterContainerOpen}>
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"/>
                                </svg>
                                Filters
                            </button>
                            <button id="create-item-button" class="create-item-button" onclick={() => creatorScale.target = 1}>
                                <svg width="19" height="19" viewBox="0 0 14 14">
                                    <path fill="currentColor" fill-rule="evenodd"
                                          d="M1.5 1.784c0-.157.127-.284.284-.284h3.182c.157 0 .284.127.284.284v3.182a.284.284 0 0 1-.284.284H1.784a.284.284 0 0 1-.284-.284zM1.784.25C.937.25.25.937.25 1.784v3.182C.25 5.813.937 6.5 1.784 6.5h3.182c.847 0 1.534-.687 1.534-1.534V1.784C6.5.937 5.813.25 4.966.25zM8.75 9.034c0-.157.127-.284.284-.284h3.182c.157 0 .284.127.284.284v3.182a.284.284 0 0 1-.284.284H9.034a.284.284 0 0 1-.284-.284zM9.034 7.5c-.847 0-1.534.687-1.534 1.534v3.182c0 .847.687 1.534 1.534 1.534h3.182c.847 0 1.534-.687 1.534-1.534V9.034c0-.847-.687-1.534-1.534-1.534zM.25 9.034C.25 8.187.937 7.5 1.784 7.5h3.182c.847 0 1.534.687 1.534 1.534v3.182c0 .847-.687 1.534-1.534 1.534H1.784A1.534 1.534 0 0 1 .25 12.216zM10.625.25a.75.75 0 0 1 .75.75v1.625H13a.75.75 0 0 1 0 1.5h-1.625V5.75a.75.75 0 0 1-1.5 0V4.125H8.25a.75.75 0 0 1 0-1.5h1.625V1a.75.75 0 0 1 .75-.75"
                                          clip-rule="evenodd"/>
                                </svg>
                                Add Item
                            </button>
                        </div>
                    </div>
                </section>
                {#if (isFilterContainerOpen) }
                    <div class="inventory-filter-container"
                         style="{isFilterContainerOpen?'padding:1.75rem 2.5rem;visibility:visible;margin-top:2rem;height:fit-content;opacity:1;':'visibility:hidden;margin-top:0;opacity:0;'}">
                        <div class="header" style="display:flex;flex-flow:row nowrap;align-items:center;justify-content:space-between;">
                            <h1>Filters</h1>
                            <button class="filters-save-button {filterSettings.unsavedChanges ? 'new' : 'default' }" title="Save Filters">
                                <svg width="16" height="16" fill="currentColor" class="bi bi-floppy-fill" viewBox="0 0 16 16">
                                    <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0H3v5.5A1.5 1.5 0 0 0 4.5 7h7A1.5 1.5 0 0 0 13 5.5V0h.086a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5H14v-5.5A1.5 1.5 0 0 0 12.5 9h-9A1.5 1.5 0 0 0 2 10.5V16h-.5A1.5 1.5 0 0 1 0 14.5z"/>
                                    <path d="M3 16h10v-5.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5zm9-16H4v5.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5zM9 1h2v4H9z"/>
                                </svg>
                            </button>
                        </div>
                        <section class="filters">
                            <div class="filter columns">
                                <div style="display:flex;flex-flow:row nowrap;gap:.2rem;">
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M17.75 20.25q-1.575 0-2.662-1.088T14 16.5t1.088-2.662t2.662-1.088t2.663 1.088T21.5 16.5t-1.088 2.663t-2.662 1.087M11 17.5H5q-.425 0-.712-.288T4 16.5t.288-.712T5 15.5h6q.425 0 .713.288T12 16.5t-.288.713T11 17.5m-4.75-6.25q-1.575 0-2.662-1.088T2.5 7.5t1.088-2.662T6.25 3.75t2.663 1.088T10 7.5t-1.088 2.663T6.25 11.25M19 8.5h-6q-.425 0-.712-.288T12 7.5t.288-.712T13 6.5h6q.425 0 .713.288T20 7.5t-.288.713T19 8.5"/>
                                    </svg>
                                    <h1>Columns</h1>
                                </div>
                                <div class="buttons">
                                    <button class="price filter-button {filterSettings.price ? '' : 'off'}" style="order:{filterSettings.price ? 1 : 101}" onclick={() => filterSettings.price = !filterSettings.price}>
                                        Prices
                                    </button>
                                    <button class="last-updated filter-button {filterSettings.lastUpdated ? '' : 'off'}" style="order:{filterSettings.lastUpdated ? 2 : 102}"
                                            onclick={() => filterSettings.lastUpdated = !filterSettings.lastUpdated}>
                                        Last Updated
                                    </button>
                                    <button class="description filter-button {filterSettings.description ? '' : 'off'}" style="order:{filterSettings.description ? 3 : 103}" onclick={() => filterSettings.description = !filterSettings.description}>
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
                                <div style="display:flex;flex-flow:row nowrap;gap:.35rem;">
                                    <button onclick={() => filterSettings.columnSize = 15} class="filter-button row-amount {filterSettings.columnSize === 15 ? 'selected' : ''}">15</button>
                                    <button onclick={() => filterSettings.columnSize = 30} class="filter-button row-amount {filterSettings.columnSize === 30 ? 'selected' : ''}">30</button>
                                    <button onclick={() => filterSettings.columnSize = 45} class="filter-button row-amount {filterSettings.columnSize === 45 ? 'selected' : ''}">45</button>
                                    <button onclick={() => filterSettings.columnSize = 60} class="filter-button row-amount {filterSettings.columnSize === 60 ? 'selected' : ''}">60</button>
                                </div>
                            </div>
                            <div class="filter row-height">
                                <div style="display:flex;flex-flow:row nowrap;">
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M5 22q-.425 0-.712-.288T4 21t.288-.712T5 20h14q.425 0 .713.288T20 21t-.288.713T19 22zm7-3.425q-.2 0-.375-.062T11.3 18.3l-2.6-2.6q-.275-.275-.287-.687T8.7 14.3q.275-.275.688-.288t.712.263l.9.875v-6.3l-.9.875Q9.825 10 9.413 10T8.7 9.7q-.275-.275-.275-.7t.275-.7l2.6-2.6q.15-.15.325-.212T12 5.425t.375.063t.325.212l2.6 2.6q.275.275.287.688T15.3 9.7q-.275.275-.687.288t-.713-.263L13 8.85v6.3l.9-.875q.275-.275.688-.275t.712.3q.275.275.275.7t-.275.7l-2.6 2.6q-.15.15-.325.213t-.375.062M5 4q-.425 0-.712-.288T4 3t.288-.712T5 2h14q.425 0 .713.288T20 3t-.288.713T19 4z"/>
                                    </svg>
                                    <h1>Row Height</h1>
                                </div>
                                <input type="range" bind:value={filterSettings.rowHeight} min="60" max="80" />
                            </div>
                        </section>
                    </div>
                {/if}
                <section class="inventory-body-section">
                    <div class="inventory-list-container ui-container" style="box-sizing:border-box;">
                        <div class="inventory-header border-b-container-border dark:border-b-dark-container-border">
                            <div class="header-items">
                                <div class="header-item name-filter">
                                    <button id="name-filter-button" title="Filter by name"
                                            onclick={async () => await updateFilter("name",nameFilter)}>
                                        Name
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6 { nameFilter === 'DEFAULT' ? 'auto-hide-filter-icon' : '' }" style="opacity:0;">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="{Utility.getFilterSymbol(nameFilter)}"/>
                                        </svg>
                                    </button>
                                </div>
                                {#if (filterSettings.lastUpdated)}
                                    <div class="header-item latest-change-filter">
                                        <button id="latest-change-filter-button" title="Filter by latest update"
                                                onclick={async () => await updateFilter("last_modified",latestChangeFilter)}>
                                            Latest update
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6 { latestChangeFilter === 'DEFAULT' ? 'auto-hide-filter-icon' : '' }"
                                                 style="opacity:0;">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="{Utility.getFilterSymbol(latestChangeFilter)}"/>
                                            </svg>
                                        </button>
                                    </div>
                                {/if}
                                {#if (filterSettings.price) }
                                    <div class="header-item price-filter">
                                        <button id="price-filter-button" title="Filter by item price"
                                                onclick={async () => await updateFilter("price",priceFilter)}>
                                            Price
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6 { priceFilter === 'DEFAULT' ? 'auto-hide-filter-icon' : '' }" style="opacity:0;">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="{Utility.getFilterSymbol(priceFilter)}"/>
                                            </svg>
                                        </button>
                                    </div>
                                {/if}
                                <div class="header-item items-filter">
                                    <button id="items-filter-button" title="Filter by item amount"
                                            onclick={async () => await updateFilter("amount",itemsFilter)}>
                                        Items
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6 { itemsFilter === 'DEFAULT' ? 'auto-hide-filter-icon' : '' }" style="opacity:0;">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="{Utility.getFilterSymbol(itemsFilter)}"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="inventory-list">
                            {#if inventory }
                                {#if items.length > 0 }
                                    {#each items as item}
                                        <a href='/static' target='_parent' style="height:{filterSettings.rowHeight / 10}rem !important;"
                                           class="inventory-list-entry
                                border-t-container-border dark:border-t-dark-container-border
                                border-b-container-border dark:border-b-dark-container-border">
                                            <div class="entry-item inventory-meta">
                                                <div class="inventory-image">
                                                    {#if (item.thumbnail_path) }
                                                        <img src='/src/lib/assets/uploads/item-images/{item.thumbnail_path}' alt="Item Thumbnail">
                                                    {:else }
                                                        <svg fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="size-6">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                  d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/>
                                                        </svg>
                                                    {/if}
                                                </div>
                                                <div class="inventory-name-and-description">
                                                    <h1 class="inventory-name">{item.name}</h1>
                                                    <span class="line-clamp-2">
                                                        {#if filterSettings.description}
                                                            {#if item.description}
                                                                {item.description}
                                                            {:else}
                                                                No description has been set.
                                                            {/if}
                                                        {/if}
                                                    </span>
                                                </div>
                                            </div>
                                            {#if (filterSettings.lastUpdated) }
                                                <div class="entry-item inventory-item-last_change">
                                                    {parseTimestamp(String(item.last_modified))}
                                                </div>
                                            {/if}
                                            {#if (filterSettings.price) }
                                                <div class="entry-item inventory-item-price">
                                                    {item.price}
                                                </div>
                                            {/if}
                                            <div class="entry-item inventory-item-amount">
                                                {item.amount}
                                            </div>
                                        </a>
                                    {/each}
                                {:else}
                                    <div class="empty-inventory-list">
                                    <span class="text-theme-text-third">{ navigator.onLine ?
                                        'No items found. Create your first item now!' :
                                        'No internet found. Reconnect to browse inventory.' }</span>
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
                        <div class="inventory-footer border-t-container-border dark:border-t-dark-container-border">
                            <div class="inventory-footer-items">
                                <button class="pagination-back-button pagination-button" style="visibility: { currentPage === 1 ? 'hidden' : 'visible' }"
                                        onclick={async () => { await goToFirstPage() } } title="Switch to previous page">
                                    <svg width="19" height="19" viewBox="0 0 16 16">
                                        <path fill="currentColor" fill-rule="evenodd"
                                              d="M7.721 2.22a.75.75 0 0 1 1.061 1.06L4.061 8.002l4.721 4.721a.75.75 0 0 1-1.06 1.061L2.47 8.532a.75.75 0 0 1 0-1.06L7.722 2.22Zm5 0a.75.75 0 0 1 1.061 1.06L9.061 8.002l4.721 4.721a.75.75 0 0 1-1.06 1.061L7.47 8.532a.75.75 0 0 1 0-1.06z"
                                              clip-rule="evenodd"/>
                                    </svg>
                                </button>
                                <button class="pagination-back-button pagination-button{ currentPage === 1 ? ' disabled' : '' }"
                                        onclick={async () => { await updatePage(-1) } } title="Switch to previous page">
                                    <svg width="19" height="19" viewBox="0 0 16 16">
                                        <path fill="currentColor" fill-rule="evenodd"
                                              d="M10.78 2.22a.75.75 0 0 0-1.06 0L4.468 7.472a.75.75 0 0 0 0 1.06l5.252 5.252a.75.75 0 1 0 1.06-1.06L6.06 8.001l4.72-4.721a.75.75 0 0 0 0-1.06"
                                              clip-rule="evenodd"/>
                                    </svg>
                                </button>
                                <p class="pagination-current-page">
                                    {currentPage}
                                </p>
                                <button class="pagination-forward-button pagination-button{ currentPage === totalPages ? ' disabled' : '' }"
                                        onclick={async () => { await updatePage(1) } } title="Switch to next page">
                                    <svg width="19" height="19" viewBox="0 0 16 16">
                                        <path fill="currentColor" fill-rule="evenodd"
                                              d="M5.22 2.22a.75.75 0 0 1 1.06 0l5.252 5.252a.75.75 0 0 1 0 1.06L6.28 13.784a.75.75 0 1 1-1.06-1.06l4.72-4.723L5.22 3.28a.75.75 0 0 1 0-1.06"
                                              clip-rule="evenodd"/>
                                    </svg>
                                </button>
                                <button class="pagination-forward-button pagination-button" style="visibility: { currentPage === totalPages ? 'hidden' : 'visible' }"
                                        onclick={async () => { await goToLastPage() } } title="Switch to next page">
                                    <svg width="19" height="19" viewBox="0 0 16 16">
                                        <path fill="currentColor" fill-rule="evenodd"
                                              d="M3.53 2.22a.75.75 0 0 0-1.06 1.06l4.72 4.722l-4.72 4.721a.75.75 0 0 0 1.06 1.061l5.252-5.252a.75.75 0 0 0 0-1.06zm5 0a.75.75 0 0 0-1.06 1.06l4.721 4.722l-4.721 4.721a.75.75 0 0 0 1.06 1.061l5.252-5.252a.75.75 0 0 0 0-1.06z"
                                              clip-rule="evenodd"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </section>
        </section>
    </div>
</div>

<style>
    :root {
        --inventory-header-height: 6rem;
    }

    .header-section {
        pointer-events: auto;
        height: 100%;
        z-index: 10000;
    }

    .body-section {
        height: var(--theme-max-page-height);
        overflow: hidden;
        box-sizing: border-box;
        width: 100%;
        position: absolute;
        top: var(--header-height);
        z-index: 10;
    }

    .inventory-outer-section {
        max-height: 100%;
        overflow: auto;
        overflow-y: scroll;
        overflow-x: hidden;
        scrollbar-width: none;
    }

    .item-creation-container {
        position: absolute;
        top: calc(((var(--header-height) / 2) + 50vh) - 20rem);
        left: calc(50vw - 32rem);
        opacity: 0;

        z-index: 100;
    }

    .inventory-section {
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        align-content: center;

        width: 100vw;
        height: fit-content;

        .inventory-header-section {
            display: flex;
            flex-flow: column nowrap;
            align-items: center;
            align-content: center;

            width: 100%;

            z-index: 1000;

            background: var(--theme-header-secondary-color);
            border-color: var(--theme-border-container);
            border-bottom-width: var(--border-width);

            .inventory-header-content {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                align-content: center;
                justify-content: space-between;

                padding: 2.5rem 0;

                width: 80rem;

                .inventory-name {
                    display: flex;
                    flex-flow: row nowrap;
                    align-items: center;
                    justify-content: flex-start;
                    overflow: visible;
                    user-select: none;

                    h1 {
                        font-size: 2.15rem;
                        font-family: 'FunnelSans', sans-serif;
                        font-variation-settings: "wght" 900;
                        color: var(--theme-text);
                    }

                    .primary-inventory-bookmark-icon {
                        svg {
                            stroke-width: 2.5;
                            height: 1.75rem;
                            width: 1.75rem;
                            color: var(--theme-text);
                            align-self: center;
                            margin-left: .35rem;
                            padding-top: .1em;
                        }

                        .primary-inventory-icon {
                            color: var(--theme-text-accent);
                        }
                    }

                    .primary-inventory-bookmark-icon:hover {
                        cursor: pointer;
                    }
                }

                .header-buttons {
                    display: flex;
                    flex-flow: row nowrap;
                    gap: .5rem;

                    .refresh-button, .filters-button, .create-item-button {
                        display: flex;
                        flex-flow: row nowrap;
                        align-items: center;
                        gap: .5rem;

                        padding: .75em 1.25em;

                        font-family: 'FunnelSans', sans-serif;
                        font-variation-settings: "wght" 600;
                        color: var(--theme-text);
                        stroke-width: 1.8;

                        background: var(--theme-background-container);
                        border: var(--border-width) solid var(--theme-border-button);
                        border-radius: var(--border-radius);

                        cursor: pointer;
                        user-select: none;
                    }

                    .refresh-button:hover, .filters-button:hover, .create-item-button:hover {
                        color: var(--accent-text);

                        transition-duration: 75ms;

                        svg {
                            stroke-width: 2.25;

                            transition: 75ms ease-in-out;
                        }
                    }
                }
            }
        }

        .inventory-filter-container {
            display: flex;
            flex-flow: column wrap;
            justify-content: flex-start;

            width: 90rem;
            opacity: 0;
            margin-top: 0;
            height: 0;

            transition: 125ms ease-in-out;

            background: var(--theme-header-secondary-color);
            border-color: var(--theme-border-container);
            border-width: var(--border-width);
            border-radius: var(--theme-border-radius);

            .header {
                h1 {
                    font-size: 1.7rem;
                    font-family: 'FunnelSans', sans-serif;
                    font-weight: 650;
                    color: var(--theme-text);
                    margin-bottom: .75rem;
                }

                .filters-save-button {
                    svg {
                        width: 1.75rem;
                        height: 1.75rem;
                        color: var(--theme-text);
                    }
                }

                .filters-save-button.default {
                    svg {
                        color: var(--theme-icon-disabled);
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
                gap: .5rem;
                width: 100%;
                height: fit-content;

                .filter {
                    flex: 1;
                    align-items: center;
                    color: var(--theme-text);
                    font-family: 'Google Sans', sans-serif;

                    .filter-button {
                        background: var(--theme-background-button);
                        color: var(--theme-text);
                        border: var(--theme-form-input-border-dark);
                        border-radius: 1.25rem;
                        padding: .75rem 1.5rem;
                        user-select: none;
                        font-size: 1rem;
                        font-weight: 700;
                        cursor: pointer;

                        transition: filter 100ms ease-in-out;
                    }

                    .filter-button:hover {
                        background: var(--theme-background-button-hover);
                    }

                    .filter-button:active {
                        transform: scale(0.975);
                    }

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
                        background: #1F2023FF;
                    }
                }

                .filter.row-height {
                    input {
                        width: 8rem;
                        margin-top: .75rem;
                    }
                }
            }
        }

        .inventory-body-section {
            user-select: none !important;

            .inventory-list-container {
                width: 90rem;
                height: fit-content;

                margin: 2.5rem 0;

                border-width: var(--border-width);
                border-radius: var(--border-radius);

                .inventory-header {
                    border-color: transparent;
                    border-bottom-color: inherit;
                    border-width: var(--border-width);
                    width: 100%;
                    height: 3rem !important;

                    .header-items {
                        display: flex;
                        flex-flow: row nowrap;
                        margin-top: .75em;
                        margin-bottom: .75em;

                        .header-item:first-child {
                            flex: 1 70%;
                        }

                        .header-item {
                            flex: 1 10%;

                            display: flex;
                            flex-flow: row nowrap;
                            justify-content: center;

                            font-family: 'Funnel Sans', sans-serif;
                            font-weight: 600;

                            .auto-hide-filter-icon {
                                opacity: 0;

                                transition: 1750ms 500ms ease-in-out,
                                transform 0ms;
                            }

                            button {
                                display: flex;
                                flex-flow: row nowrap;
                                justify-content: flex-end;

                                cursor: pointer;

                                transition: 400ms 100ms ease-in-out;

                                svg {
                                    height: 1.25rem;
                                    align-self: center;
                                    stroke-width: 2;
                                    transition: 125ms ease-in-out,
                                    transform 0ms;
                                    position: fixed;
                                    transform: translateX(1.5rem);
                                }
                            }

                            button:hover {
                                svg {
                                    stroke-width: 2.5;
                                    transition: 125ms ease-in-out;
                                }

                                .auto-hide-filter-icon {
                                    opacity: 1 !important;

                                    transition: 100ms ease-in-out,
                                    transform 0ms;
                                }
                            }
                        }
                    }
                }

                .inventory-list {
                    display: flex;
                    flex-flow: column nowrap;
                    justify-content: flex-start;
                    height: fit-content;

                    .empty-inventory-list {
                        display: flex;
                        align-content: center;
                        align-items: center;
                        justify-content: center;
                        height: 12rem;

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

                    .inventory-list-entry:last-child {
                        border-bottom-color: transparent;
                    }

                    .inventory-list-entry {
                        width: 100%;

                        display: flex;
                        flex-flow: row nowrap;
                        justify-content: center;
                        align-items: center;
                        align-content: center;

                        background: color-mix(var(--container-background) / 50%);
                        border-width: var(--border-width);
                        border-top-color: transparent;
                        border-left-color: transparent;
                        border-right-color: transparent;

                        font-family: 'Funnel Sans', sans-serif;

                        .entry-item:first-child {
                            flex: 1 70%;
                        }

                        .entry-item {
                            flex: 1 10%;
                        }

                        .inventory-meta {
                            display: flex;
                            flex-flow: row nowrap;
                            align-items: center;

                            .inventory-image {
                                margin: 0 1rem;
                                width: 5rem;
                                height: 5rem;

                                svg {
                                    width: 4rem;
                                    height: 4rem;
                                    margin: .5rem .5rem;
                                    transition: 450ms 100ms ease-in-out;
                                }

                                img {
                                    width: 100%;
                                    height: 100%;
                                    border-radius: .75em;

                                    transition: 400ms 100ms ease-in-out;
                                }

                                img:hover {
                                    transform: scale(1.75);
                                    border-radius: .2em;

                                    transition: 125ms ease-in-out;
                                }
                            }

                            .inventory-name-and-description {
                                display: flex;
                                flex-flow: column nowrap;
                                justify-content: flex-start;
                                align-content: flex-start;

                                h1 {
                                    font-weight: 700;
                                    font-size: 1.5rem;
                                }

                                span {
                                    font-size: 0.85rem;
                                    color: var(--theme-text-third);
                                    line-clamp: 2 !important;
                                    text-overflow: ellipsis;

                                    transition: 450ms 100ms ease-in-out;
                                }
                            }
                        }

                        .inventory-item-price {
                            text-align: center;
                        }

                        .inventory-item-amount {
                            text-align: center;
                        }

                        .inventory-item-last_change {
                            text-align: center;
                        }
                    }

                    .inventory-list-entry:hover {
                        background: var(--theme-background-highlight);

                        svg {
                            stroke: var(--theme-text-accent);
                            transition: 50ms ease-in-out;
                        }

                        .inventory-meta {
                            span {
                                color: var(--theme-text-accent);
                                transition: 50ms ease-in-out;
                            }
                        }
                    }

                    .inventory-name {
                        flex: 1 0 70%;
                        justify-content: center;
                    }

                    .inventory-item-price {
                        flex: 1 0 10%;
                        justify-content: center;
                    }

                    .inventory-item-amount {
                        flex: 1 0 10%;
                        justify-content: center;
                    }
                }

                .inventory-footer {
                    border-color: transparent;
                    border-top-color: inherit;
                    border-width: var(--border-width);
                    width: 100%;
                    height: 3rem !important;

                    .inventory-footer-items {
                        display: flex;
                        flex-flow: row nowrap;
                        align-content: center;
                        justify-content: center;
                        gap: 1rem;

                        margin-top: .75em;
                        margin-bottom: .75em;

                        font-family: 'Funnel Sans', sans-serif;

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

        }
    }

</style>