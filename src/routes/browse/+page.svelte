<script module lang="ts">
    function parseTimestamp(timestamp: string): string {
        const diff = ((Date.now() - Date.parse(timestamp)) / 60) / 60;
        let response: string = "None";

        if (diff < 86400) {
            if (diff < 60) {
                response = `${diff} seconds ago`;
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
    import Header from "../Header.svelte";
    import {getInventories} from './data.remote.ts';

    const rawInventories = await getInventories();
    let inventories = $state(rawInventories);

    let nameFilter = $state("DEFAULT");
    let itemsFilter = $state("DEFAULT");
    let latestChangeFilter = $state("DEFAULT");

    function getFilterSymbol(filter: string): string {
        if (filter === "DESC") {
            return "m19.5 8.25-7.5 7.5-7.5-7.5";
        } else if (filter === "ASC") {
            return "m4.5 15.75 7.5-7.5 7.5 7.5";
        } else return "M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5";
    }

    function updateFilterState(filter: string) {
        if (filter === "NAME") {
            if (nameFilter === "DEFAULT") {
                nameFilter = "DESC";
            } else if (nameFilter === "DESC") {
                nameFilter = "ASC";
            } else nameFilter = "DEFAULT";
            itemsFilter = "DEFAULT";
            latestChangeFilter = "DEFAULT";
        } else if (filter === "ITEMS") {
            if (itemsFilter === "DEFAULT") {
                itemsFilter = "DESC";
            } else if (itemsFilter === "DESC") {
                itemsFilter = "ASC";
            } else itemsFilter = "DEFAULT"
            nameFilter = "DEFAULT";
            latestChangeFilter = "DEFAULT";
        } else if (filter === "LATEST_CHANGE") {
            if (latestChangeFilter === "DEFAULT") {
                latestChangeFilter = "DESC";
            } else if (latestChangeFilter === "DESC") {
                latestChangeFilter = "ASC";
            } else latestChangeFilter = "DEFAULT"
            nameFilter = "DEFAULT";
            itemsFilter = "DEFAULT";
        }
    }
</script>

<Header/>

<section>
    <div class="inventory-list-container bg-container-background dark:bg-dark-container-background
                border-container-border dark:border-dark-container-border text-text-primary dark:text-dark-text-primary">
        <div class="inventory-header border-b-container-border dark:border-b-dark-container-border">
            <div class="header-items">
                <div class="header-item name-filter">
                    <p>Name</p>
                    <button class="{ nameFilter === 'DEFAULT' ? 'auto-hide-filter-icon' : '' }" id="name-filter-button" title="Filter by name" onclick={() => updateFilterState("NAME")}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="{getFilterSymbol(nameFilter)}"/>
                        </svg>
                    </button>
                </div>
                <div class="header-item latest-change-filter">
                    <p>Latest update</p>
                    <button class="{ latestChangeFilter === 'DEFAULT' ? 'auto-hide-filter-icon' : '' }" id="latest-change-filter-button" title="Filter by latest change"
                            onclick={() => updateFilterState("LATEST_CHANGE")}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="{getFilterSymbol(latestChangeFilter)}"/>
                        </svg>
                    </button>
                </div>
                <div class="header-item items-filter">
                    <p>Items</p>
                    <button class="{ itemsFilter === 'DEFAULT' ? 'auto-hide-filter-icon' : '' }" id="items-filter-button" title="Filter by item amount" onclick={() => updateFilterState("ITEMS")}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="{getFilterSymbol(itemsFilter)}"/>
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
                    <span class="text-theme-text-third">No inventories found. Create your first inventory now!</span>
                </div>
            {/if}
        </div>
    </div>
</section>

<style>
    section {
        user-select: none !important;

        .inventory-list-container {
            width: 80vw;
            margin: 10vh auto;
            height: calc(80vh - var(--header-height));
            border-width: var(--border-width);
            border-radius: var(--border-radius);

            .inventory-header {
                border-color: transparent;
                border-bottom-color: inherit;
                border-width: var(--border-width);
                width: 100%;

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

                        .auto-hide-filter-icon:hover {
                            opacity: 1;

                            transition: 100ms ease-in-out;
                        }

                        button {
                            cursor: pointer;

                            svg {
                                height: 1.25rem;
                                align-self: center;
                                stroke-width: 2;
                                transition: 125ms ease-in-out;
                                position: fixed;
                            }
                        }

                        button:hover {
                            svg {
                                stroke-width: 2.5;
                                transition: 125ms ease-in-out;
                            }
                        }
                    }
                }
            }

            .inventory-list {
                display: flex;
                flex-flow: column nowrap;
                justify-content: flex-start;
                height: 100%;

                overflow-y: scroll;
                overflow-x: hidden;

                scrollbar-width: none;

                .empty-inventory-list {
                    display: flex;
                    align-content: center;
                    align-items: center;
                    justify-content: center;

                    span {
                        height: 100%;
                        margin: auto;
                        font-size: 1.05rem;
                    }
                }

                .inventory-list-entry {
                    width: 100%;
                    height: 10%;
                    min-height: 7.25rem !important;

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
        }

    }
</style>