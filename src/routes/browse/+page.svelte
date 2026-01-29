<script lang="ts">
    import Header from "../Header.svelte";
    import {getInventories} from './data.remote.ts';

    const rawInventories = await getInventories();
    let inventories = $state(rawInventories);

    let nameFilter = $state("DEFAULT");
    let itemsFilter = $state("DEFAULT");

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
        } else if (filter === "ITEMS") {
            if (itemsFilter === "DEFAULT") {
                itemsFilter = "DESC";
            } else if (itemsFilter === "DESC") {
                itemsFilter = "ASC";
            } else itemsFilter = "DEFAULT"
            nameFilter = "DEFAULT";
        }
    }
</script>

<Header/>

<section>
    <div class="inventory-list-container bg-container-background dark:bg-dark-container-background
                border-container-border dark:border-dark-container-border text-text-primary dark:text-dark-text-primary">
        <div class="inventory-header border-b-container-border dark:border-b-dark-container-border">
            <div class="left-side-spacer"></div>
            <div class="header-items">
                <div class="header-item name-filter">
                    <p>Name</p>
                    <button id="name-filter-button" title="Filter by name" onclick={() => updateFilterState("NAME")}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="{getFilterSymbol(nameFilter)}"/>
                        </svg>
                    </button>
                </div>
                <div class="header-item items-filter">
                    <p>Items</p>
                    <button id="items-filter-button" title="Filter by item amount" onclick={() => updateFilterState("ITEMS")}>
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
                {#each inventories as {inventory_uuid, name, description, image, item_amount, primary_inventory}}
                    <div class="inventory-item
                                border-t-container-border dark:border-t-dark-container-border
                                border-b-container-border dark:border-b-dark-container-border">
                        <div class="left-side-spacer"></div>
                            <div class="inventory-meta">
                                <a class="inventory-name" href='/inventory/{inventory_uuid}' target='_parent'>{name}</a>
                                <span>
                                    {#if description}
                                        {description}
                                    {:else}
                                        No description has been set for this inventory.
                                    {/if}
                                </span>
                            </div>
                        <div class="inventory-item-amount">
                            {item_amount}
                        </div>
                    </div>
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
        .inventory-list-container {
            width: 80vw;
            margin: 2rem auto 0 auto;
            height: calc(90vh - var(--header-height));
            border-width: var(--border-width);
            border-radius: var(--border-radius);

            .inventory-list .left-side-spacer {
                width: 2.5rem !important;
                height: auto;
                opacity: 0;
            }

            .inventory-header {
                border-color: transparent;
                border-bottom-color: inherit;
                border-width: var(--border-width);
                width: 100%;

                .header-items {
                    display: flex;
                    flex-flow: row nowrap;
                    justify-content: space-around;
                    margin-top: .75em;
                    margin-bottom: .75em;

                    .name-filter {
                        flex: 1 0 70%;
                    }

                    .items-filter {
                        flex: 1 0 30%;
                        justify-content: center;
                    }

                    .header-item {
                        display: flex;
                        flex-flow: row nowrap;

                        button {
                            cursor: pointer;

                            svg {
                                height: 75%;
                                align-self: center;
                                stroke-width: 1.5;
                                transition: 125ms ease-in-out;
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
                align-items: center;
                justify-content: center;
                align-content: center;
                height: 100%;

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

                .inventory-item {
                    height: auto;
                    width: 100%;
                    padding: 1.25rem 0;
                    background: color-mix(var(--container-background) / 50%);
                    border-width: var(--border-width);
                    border-left-color: transparent;
                    border-right-color: transparent;
                    align-items: center;
                    display: flex;
                    flex-flow: row nowrap;
                    justify-content: center;
                    flex-grow: 1;
                }

                .inventory-name {
                    flex: 1 0 70%;
                    justify-content: center;
                }

                .inventory-item-amount {
                    flex: 1 0 30%;
                    justify-content: center;
                }
            }
        }

    }
</style>