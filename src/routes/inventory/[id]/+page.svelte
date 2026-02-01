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

    /* Item Container*/
    let order_by = $state('name');
    let order = $state('');
    let currentPage = $state(1);

    let items: Item[] = $state.raw([]);
    await refresh();

    let itemCount: number = await getTotalItemCount(String(page.params.id)) ?? 0;

    let totalPages = Math.ceil(itemCount / 5);

    let nameFilter = $state('DEFAULT');
    let itemsFilter = $state('DEFAULT');
    let latestChangeFilter = $state('DEFAULT');

    async function refresh(pageChange: number = 0) {
        currentPage += pageChange;
        const offset = 5 * (currentPage - 1);

        const newItems = await getItems({inventory_uuid: String(page.params.id), amount: 5, order_by, order, offset}) || [];
        items = newItems;
    }

    async function updateFilter(filter: string, current: string) {
        const next = String(getNextState(current));

        if (next === 'DEFAULT') {
            order = '';
            order_by = 'name';

            nameFilter = 'DEFAULT';
            itemsFilter = 'DEFAULT';
            latestChangeFilter = 'DEFAULT';
        } else {
            order = next;

            if (filter == 'name') {
                nameFilter = next;
                order_by = 'name';

                itemsFilter = 'DEFAULT';
                latestChangeFilter = 'DEFAULT';
            } else if (filter == 'amount') {
                itemsFilter = next;
                order_by = 'amount';

                nameFilter = 'DEFAULT';
                latestChangeFilter = 'DEFAULT';
            } else if (filter == 'last_modified') {
                latestChangeFilter = next;
                order_by = 'last_modified';

                nameFilter = 'DEFAULT';
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
                            <button id="filters-button" class="filters-button" title="Filters">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"/>
                                </svg>
                                Filters
                            </button>
                            <button id="create-item-button" class="create-item-button" onclick={() => creatorScale.target = 1}>
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"/>
                                </svg>
                                Add Item
                            </button>
                        </div>
                    </div>
                    <div class="inventory-filter-container"></div>
                </section>
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
                                <button class="pagination-back-button pagination-button{ currentPage === 1 ? ' disabled' : '' }"
                                        onclick={async () => { await refresh(-1); } } title="Switch to previous page">
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="currentColor"
                                              d="M9.857 15.962a.5.5 0 0 0 .243.68l9.402 4.193c1.496.667 3.047-.814 2.306-2.202l-3.152-5.904c-.245-.459-.245-1 0-1.458l3.152-5.904c.741-1.388-.81-2.87-2.306-2.202l-3.524 1.572a2 2 0 0 0-.975.932z"/>
                                        <path fill="currentColor" d="M8.466 15.39a.5.5 0 0 1-.65.233l-4.823-2.15c-1.324-.59-1.324-2.355 0-2.945L11.89 6.56a.5.5 0 0 1 .651.68z" opacity="0.5"/>
                                    </svg>
                                </button>
                                <p class="pagination-current-page">
                                    {currentPage}
                                </p>
                                <button class="pagination-forward-button pagination-button{ currentPage === totalPages ? ' disabled' : '' }"
                                        onclick={async () => { await refresh(1); } } title="Switch to next page">
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="currentColor"
                                              d="M14.143 15.962a.5.5 0 0 1-.244.68l-9.402 4.193c-1.495.667-3.047-.814-2.306-2.202l3.152-5.904c.245-.459.245-1 0-1.458L2.191 5.367c-.74-1.388.81-2.87 2.306-2.202l3.525 1.572a2 2 0 0 1 .974.932z"/>
                                        <path fill="currentColor" d="M15.533 15.39a.5.5 0 0 0 .651.233l4.823-2.15c1.323-.59 1.323-2.355 0-2.945L12.109 6.56a.5.5 0 0 0-.651.68z" opacity="0.5"/>
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

            background: var(--theme-header-secondary-color);
            border-color: var(--theme-border-container);
            border-bottom-width: var(--border-width);

            .inventory-filter-container {
                width: 80vw;
                height: 0;
                background: white;
            }

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

        .inventory-body-section {
            user-select: none !important;

            .inventory-list-container {
                width: 80vw;
                min-width: 54rem !important;
                max-width: 105rem !important;
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
                            flex: 1 50%;
                        }

                        .header-item {
                            flex: 1 25%;

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
                            flex: 1 50%;
                            display: flex;
                        }

                        .entry-item {
                            flex: 1 25%;
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
                        flex: 1 0 50%;
                        justify-content: center;
                    }

                    .inventory-item-amount {
                        flex: 1 0 25%;
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