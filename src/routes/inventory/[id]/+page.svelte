<script module lang="ts">
    import Header from "../../Header.svelte";
    import {error} from '@sveltejs/kit';
    import {validate} from 'uuid';
    import type {Inventory} from "$lib/server/db/schema";
    import type {PageProps} from "../../../../.svelte-kit/types/src/routes/inventory/[id]/$types";
    import type {Item, User} from "$lib/server/db/schema";
    import ItemCreator from "../components/ItemCreator.svelte";
    import ItemCreationSuccessfulToast from "../../../components/Toasts/ItemCreationSuccessful.svelte";
    import GenericErrorToast from "../../../components/Toasts/GenericError.svelte";
    import {parseTimestamp} from '$lib/utilities'

    /*
    * <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><g fill="currentColor"><circle cx="5" cy="10" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="15" cy="10" r="2"/></g></svg>
    *<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><path fill="currentColor" fill-rule="evenodd" d="M4 5.543V4.25H3a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1h1a1 1 0 1 1 0 2H3a3 3 0 0 1-3-3v-3.5a3 3 0 0 1 3-3h1V.957a.5.5 0 0 1 .854-.353l2.292 2.292a.5.5 0 0 1 0 .708L4.854 5.896A.5.5 0 0 1 4 5.543m6 6.207v1.293a.5.5 0 0 1-.854.354l-2.292-2.293a.5.5 0 0 1 0-.708l2.292-2.292a.5.5 0 0 1 .854.353V9.75h1a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1h-1a1 1 0 1 1 0-2h1a3 3 0 0 1 3 3v3.5a3 3 0 0 1-3 3z" clip-rule="evenodd"/></svg>
    *  */
</script>

<script lang="ts">
    import {page} from "$app/state";
    import {getInventory, getItems, getTotalItemCount} from './data.remote.ts';
    import {Spring} from "svelte/motion";
    import Utility from "../../browse/utility";
    import {getContext} from "svelte";

    if (!page.params.id || !validate(page.params.id)) {
        error(404, 'Inventory ID is required!');
    }

    let {form}: PageProps = $props();

    const user: User = getContext('user');

    const rawInventory = await getInventory(page.params.id);
    let inventory: Inventory = $state(rawInventory);

    let creatorScale = $state(new Spring(0, {
        stiffness: 0.1,
        damping: 0.3
    }))

    let itemCreatorOpacity = $derived(creatorScale.current);
    let isItemCreatorOpen: boolean = $derived(itemCreatorOpacity !== 0);
    let isFilterContainerOpen: boolean = $state(false);
    let isPricesShown: boolean = $state(true);

    /* Item Container*/
    let order_by = $state('name');
    let order = $state('');
    let currentPage = $state(1);

    let items: Item[] = $state.raw([]);
    await refresh();

    let itemCount: number = await getTotalItemCount(String(page.params.id)) ?? 0;

    let totalPages = Math.ceil(itemCount / 15);

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
        const offset = 15 * (currentPage - 1);

        const newItems = await getItems({inventory_uuid: String(page.params.id), amount: 15, order_by, order, offset}) || [];
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
            <GenericErrorToast error={form.error}/>
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
    <div class="header-section">
        <Header/>
    </div>
    <div class="body-section">
        <section class="inventory-outer-section">
            <section class="inventory-section">
                <section class="inventory-header-section">
                    <div class="inventory-header-content">
                        <div class="inventory-name">
                            <h1>{inventory.name}</h1>
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
                <div class="inventory-filter-container"
                     style="{isFilterContainerOpen?'transform:translateY(0);visibility:visible;margin-top:2rem;height:fit-content;opacity:1;':'transform:translateY(-5rem);visibility:hidden;margin-top:-6.5rem;opacity:0;'}">
                    <button class="filter" onclick={() => isPricesShown = !isPricesShown}>
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <!-- Placeholder icon till a proper one has been found -->
                            <path fill="currentColor"
                                  d="M10 12c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2M6 8c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m0 8c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m12-8c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2m-4 8c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m4-4c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m-4-4c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2m-4-4c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2"/>
                        </svg>
                        Prices
                    </button>
                </div>
                <section class="inventory-body-section">
                    <div class="inventory-list-container ui-container">
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
                                {#if (isPricesShown) }
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
                            {#if items.length > 0 }
                                {#each items as item}
                                    <a href='/' target='_parent' class="inventory-list-entry
                                border-t-container-border dark:border-t-dark-container-border
                                border-b-container-border dark:border-b-dark-container-border">
                                        <div class="entry-item inventory-meta">
                                            <div class="inventory-image">
                                                <svg fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="size-6">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/>
                                                </svg>
                                            </div>
                                            <div class="inventory-name-and-description">
                                                <h1 class="inventory-name">{item.name}</h1>
                                                <span class="line-clamp-2">
                                                    {#if item.description}
                                                        {item.description}
                                                    {:else}
                                                        No description has been set.
                                                    {/if}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="entry-item inventory-item-last_change">
                                            {parseTimestamp(String(item.last_modified))}
                                        </div>
                                        {#if (isPricesShown) }
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

                    .create-item-button, .filters-button {
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

                        user-select: none;
                    }

                    .create-item-button:hover, .filters-button:hover {
                        cursor: pointer;
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
            width: 90rem;
            opacity: 0;
            margin-top: 0;
            padding: 2.5rem;

            transition: 325ms ease-in-out,
            margin-top 250ms ease-in-out;

            background: var(--theme-header-secondary-color);
            border-color: var(--theme-border-container);
            border-width: var(--border-width);
            border-radius: var(--theme-border-radius);

            .filter {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                color: var(--theme-text);

                padding: .9rem 1.25rem;
                background: var(--theme-background-button);
                border: var(--border-width) solid var(--theme-border-button);
                border-radius: var(--theme-border-radius);
            }

            .filter:hover {
                cursor: pointer;
                background: var(--theme-background-button-hover);
            }

            .filter:active {
                transform: scale(0.975);
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

                        font-family: 'Funnel Sans', sans-serif;

                        .header-item:first-child {
                            flex: 1 70%;
                        }

                        .header-item {
                            flex: 1 10%;

                            display: flex;
                            flex-flow: row nowrap;
                            justify-content: center;

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

                    .inventory-list-entry:last-child {
                        border-bottom-color: transparent;
                    }

                    .inventory-list-entry {
                        width: 100%;
                        height: 6rem !important;

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

                        svg {
                            width: 2.25rem;
                            height: 2.25rem;
                            transition: 450ms 100ms ease-in-out;
                        }

                        .inventory-meta {
                            display: flex;
                            flex-flow: row nowrap;
                            align-items: center;

                            .inventory-image {
                                padding: 0 1.15rem;
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