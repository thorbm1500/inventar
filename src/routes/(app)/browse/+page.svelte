<script module lang="ts">
    import {getInventories, getTotalInventoryCount} from './data.remote.ts';
    import Utility from './utility.ts';
    import type {Inventory} from "$lib/server/db/interfaces";
    import {parseTimestamp} from "$lib/utilities";

    /* todo Make inventory fetch async, to allow page loading from cache if there's no connection to the database. */
</script>

<script lang="ts">
    let order_by = $state('name');
    let order = $state('');
    let currentPage = $state(1);

    let inventories: Inventory[] = $state.raw([]);
    await refresh();

    let inventoryCount: number = Math.max(await getTotalInventoryCount(), 1);

    let totalPages = Math.max(1, Math.ceil(inventoryCount / 6));

    let nameFilter = $state('DEFAULT');
    let itemsFilter = $state('DEFAULT');
    let latestChangeFilter = $state('DEFAULT');

    async function refresh(pageChange: number = 0) {
        currentPage += pageChange;
        const offset = 6 * (currentPage - 1);

        const newInventories = await getInventories({amount: 6, order_by, order, offset});
        inventories = newInventories;
    }

    async function updateFilter(filter: string, current: string) {
        const next = String(getNextState(current));

        if (next != 'DEFAULT') {
            order = next;
        }

        if (filter == 'name') {
            nameFilter = next;
            order_by = 'name';

            itemsFilter = 'DEFAULT';
            latestChangeFilter = 'DEFAULT';
        } else if (filter == 'item_amount') {
            itemsFilter = next;
            order_by = 'item_amount';

            nameFilter = 'DEFAULT';
            latestChangeFilter = 'DEFAULT';
        } else if (filter == 'last_update') {
            latestChangeFilter = next;
            order_by = 'last_update';

            nameFilter = 'DEFAULT';
            itemsFilter = 'DEFAULT';
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

<section>
    <div class="create-inventory-container">
        <button class="theme-button" onclick="{() => window.location.href='/inventory/new'}" title="Create New Inventory">
            Create
        </button>
    </div>
    <div class="inventory-list-container">
        <div class="inventory-header">
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
                    <button id="latest-change-filter-button" title="Filter by latest update"
                            onclick={async () => await updateFilter("last_update",latestChangeFilter)}>
                        Latest update
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6 { latestChangeFilter === 'DEFAULT' ? 'auto-hide-filter-icon' : '' }">
                            <path stroke-linecap="round" stroke-linejoin="round" d="{Utility.getFilterSymbol(latestChangeFilter)}"/>
                        </svg>
                    </button>
                </div>
                <div class="header-item items-filter">
                    <button id="items-filter-button" title="Filter by item amount"
                            onclick={async () => await updateFilter("item_amount",itemsFilter)}>
                        Items
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6 { itemsFilter === 'DEFAULT' ? 'auto-hide-filter-icon' : '' }">
                            <path stroke-linecap="round" stroke-linejoin="round" d="{Utility.getFilterSymbol(itemsFilter)}"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div class="inventory-list">
            {#if inventories.length > 0 }
                {#each inventories as {uuid, name, description, item_amount, last_update}}
                    <a data-sveltekit-preload-data="hover" href='/inventory/{uuid}' target='_parent' class="inventory-list-entry">
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
                            {parseTimestamp(String(last_update))}
                        </div>
                        <div class="entry-item inventory-item-amount">
                            {item_amount}
                        </div>
                    </a>
                {/each}
            {:else}
                <div class="empty-inventory-list">
                    {#if navigator.onLine }
                        <span class="text-theme-text-third">No inventories found.</span>
                        <a href="/inventory/new">Create your first inventory now!</a>
                    {:else}
                        <span class="text-theme-text-third">No internet found. Reconnect to browse inventories.</span>
                    {/if}
                </div>
            {/if}
        </div>
        <div class="inventory-footer">
            <div class="inventory-footer-items">
                <button class="pagination-back-button pagination-button{ currentPage === 1 ? ' disabled' : '' }"
                        onclick={async () => { await refresh(-1); } } title="Switch to previous page">
                    <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/>
                    </svg>
                </button>
                <p class="pagination-current-page">
                    {currentPage}
                </p>
                <button class="pagination-forward-button pagination-button{ currentPage === totalPages ? ' disabled' : '' }"
                        onclick={async () => { await refresh(1); } } title="Switch to next page">
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
        overflow: scroll;
        scrollbar-width: none;
        user-select: none !important;
        height: fit-content;

        .create-inventory-container {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: flex-end;

            width: 80rem;
            margin: 2.5rem calc(50vw - 40rem) 1.5rem calc(50vw - 40rem);
        }

        .inventory-list-container {
            width: 90rem;
            height: 42rem;

            background: var(--theme-background-container);

            border: var(--theme-border-width) solid var(--theme-border-container);
            border-radius: var(--theme-border-radius);

            color: var(--theme-text);

            margin: 0 calc(50vw - 45rem);
            padding: 0;

            .inventory-header {
                border-color: transparent;
                border-bottom-color: inherit;
                border-width: var(--theme-border-width);
                width: 100%;
                height: 3rem !important;

                .header-items {
                    display: flex;
                    flex-flow: row nowrap;
                    margin-top: .75em;
                    margin-bottom: .75em;

                    font-family: 'FunnelSans', sans-serif;

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

                            transition: 1750ms 500ms ease-in-out;
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
                    gap: .35em;

                    span, a {
                        font-size: 1.05rem;
                    }

                    span {
                        color: var(--theme-text-third);
                    }

                    a {
                        color: var(--theme-text-secondary);
                    }

                    a:hover {
                        color: var(--theme-text);
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

                    background: color-mix(var(--theme-background-container) / 50%);
                    border-width: var(--theme-border-width);
                    border-top: none;
                    border-bottom-color: var(--theme-border-container);
                    border-left-color: transparent;
                    border-right-color: transparent;

                    font-family: 'FunnelSans', sans-serif;

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
                    background: var(--theme-background-button-hover);

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
                border-width: var(--theme-border-width);
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

                    font-family: 'FunnelSans', sans-serif;

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