<script module lang="ts">
    import Header from "../Header.svelte";
    import {getInventories, getTotalInventoryCount} from './data.remote.ts';
    import Utility from './utility.ts';
    import type {Inventory} from "$lib/server/db/schema";

    /* todo Make inventory fetch async, to allow page loading, even if there's no connection to the database, while the browser is online. */

    function parseTimestamp(timestamp: string): string {
        const diff = (Date.now() - Date.parse(timestamp)) / 1000;

        let response: string = "None";

        if (diff < 86400) {
            if (diff < 60) {
                response = `${Math.round(diff)} seconds ago`;
            } else if (diff < 3600) {
                response = `${Math.round(diff / 60)} minutes ago`;
            } else if (diff < 7200) {
                response = `1 hour ago`;
            } else response = `${Math.round((diff / 60) / 60)} hours ago`
        } else {
            if (diff < 172800) {
                response = `1 day ago`;
            } else {
                response = `${Math.round(((diff / 60) / 60) / 24)} days ago`;
            }
        }

        return response;
    }
</script>

<script lang="ts">
    let order_by = $state('name');
    let order = $state('');
    let currentPage = $state(1);

    let inventories: Inventory[] = $state.raw([]);
    await refresh();

    let inventoryCount: number = await getTotalInventoryCount() ?? 0;

    let totalPages = Math.ceil(inventoryCount / 6);

    let nameFilter = $state('DEFAULT');
    let itemsFilter = $state('DEFAULT');
    let latestChangeFilter = $state('DEFAULT');

    async function refresh(pageChange: number = 0) {
        currentPage += pageChange;
        const offset = 6 * (currentPage - 1);

        const newInventories = await getInventories({amount: 6, order_by ,order, offset });
        inventories = newInventories;
    }

    async function updateFilter(filter: string, current: string) {
        const next = getNextState(current);

        if (next != 'DEFAULT') {
            order = next;
        }

        if (filter == 'name') {
            nameFilter = next;
            order_by = 'name';

            itemsFilter = 'DEFAULT';
            latestChangeFilter = 'DEFAULT';
        }
        else if (filter == 'item_amount') {
            itemsFilter = next;
            order_by = 'item_amount';

            nameFilter = 'DEFAULT';
            latestChangeFilter = 'DEFAULT';
        }
        else if (filter == 'last_update') {
            latestChangeFilter = next;
            order_by = 'last_update';

            nameFilter = 'DEFAULT';
            itemsFilter = 'DEFAULT';
        }

        await refresh();
    }

    function getNextState(currentState: string) {
        switch (currentState) {
            case 'DESC': return 'ASC';
            case 'ASC': return 'DEFAULT';
            case 'DEFAULT': return 'DESC';
        }
    }
</script>

<Header/>

<section>
    <div class="inventory-list-container ui-container">
        <div class="inventory-header border-b-container-border dark:border-b-dark-container-border">
            <div class="header-items">
                <div class="header-item name-filter">
                    <button id="name-filter-button" title="Filter by name"
                            onclick={async () => await updateFilter("name",nameFilter)}>
                        Name
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6 { nameFilter === 'DEFAULT' ? 'auto-hide-filter-icon' : '' }">
                            <path stroke-linecap="round" stroke-linejoin="round" d="{Utility.getFilterSymbol(nameFilter)}"/>
                        </svg>
                    </button>
                </div>
                <div class="header-item latest-change-filter">
                    <button id="latest-change-filter-button" title="Filter by latest change"
                            onclick={async () => await updateFilter("last_update",latestChangeFilter)}>
                        Latest update
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6 { latestChangeFilter === 'DEFAULT' ? 'auto-hide-filter-icon' : '' }">
                            <path stroke-linecap="round" stroke-linejoin="round" d="{Utility.getFilterSymbol(latestChangeFilter)}"/>
                        </svg>
                    </button>
                </div>
                <div class="header-item items-filter">
                    <button id="items-filter-button" title="Filter by item amount" onclick={async () => await updateFilter("item_amount",itemsFilter)}>
                        Items
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6 { itemsFilter === 'DEFAULT' ? 'auto-hide-filter-icon' : '' }">
                            <path stroke-linecap="round" stroke-linejoin="round" d="{Utility.getFilterSymbol(itemsFilter)}"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div class="inventory-list">
            <!-- todo: Change to length check. -->
            {#if inventories }
                {#each inventories as {inventory_uuid, name, description, image, item_amount, last_update, primary_inventory}}
                    <a href='/inventory/{inventory_uuid}' target='_parent' class="inventory-list-entry
                                border-t-container-border dark:border-t-dark-container-border
                                border-b-container-border dark:border-b-dark-container-border">
                        <div class="entry-item inventory-meta">
                            <div class="inventory-image">
                                <svg fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/>
                                </svg>
                            </div>
                            <div class="inventory-name-and-description">
                                <h1 class="inventory-name">{name}</h1>
                                <span class="line-clamp-2">
                                    {#if description}
                                        {description}
                                    {:else}
                                        No description has been set.
                                    {/if}
                                </span>
                            </div>
                        </div>
                        <div class="entry-item inventory-item-last_change">
                            {parseTimestamp(last_update)}
                        </div>
                        <div class="entry-item inventory-item-amount">
                            {item_amount}
                        </div>
                    </a>
                {/each}
            {:else}
                <div class="empty-inventory-list">
                    <span class="text-theme-text-third">{ navigator.onLine ?
                        'No inventories found. Create your first inventory now!' :
                        'No internet found. Reconnect to browse inventories.' }</span>
                </div>
            {/if}
        </div>
        <div class="inventory-footer border-t-container-border dark:border-t-dark-container-border">
            <div class="inventory-footer-items">
                <button class="pagination-back-button pagination-button{ currentPage === 1 ? ' disabled' : '' }"
                        onclick={async () => { await refresh(-1); } }>
                    <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/>
                    </svg>
                </button>
                <p class="pagination-current-page">
                    {currentPage}
                </p>
                <button class="pagination-forward-button pagination-button{ currentPage === totalPages ? ' disabled' : '' }"
                        onclick={async () => { await refresh(1); } }>
                    <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</section>

<style>
    section {
        overflow: auto;
        user-select: none !important;

        .inventory-list-container {
            width: 80vw;
            min-width: 54rem !important;
            max-width: 105rem !important;
            height: 42rem;

            margin: calc(50vh - (21rem + (var(--header-height) / 2))) auto;
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

                            transition: 450ms 200ms ease-in-out;
                        }

                        button {
                            display: flex;
                            flex-flow: row nowrap;
                            justify-content: flex-end;

                            cursor: pointer;

                            svg {
                                height: 1.25rem;
                                align-self: center;
                                stroke-width: 2;
                                transition: 125ms ease-in-out;
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
                                opacity: 1;

                                transition: 100ms ease-in-out;
                            }
                        }
                    }
                }
            }

            .inventory-list {
                display: flex;
                flex-flow: column nowrap;
                justify-content: flex-start;
                height: 36rem;

                overflow-y: scroll;
                overflow-x: hidden;

                scrollbar-width: none;

                .empty-inventory-list {
                    display: flex;
                    align-content: center;
                    align-items: center;
                    justify-content: center;
                    height: 36rem;

                    span {
                        margin: auto;
                        font-size: 1.05rem;
                    }
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

                    .pagination-back-button {
                    }

                    .pagination-current-page {
                    }

                    .pagination-forward-button {
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

    }
</style>