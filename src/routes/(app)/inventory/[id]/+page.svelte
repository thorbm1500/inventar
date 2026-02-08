<script module lang="ts">
    import {getContext, onMount} from "svelte";
    import {error} from '@sveltejs/kit';
    import {page} from "$app/state";
    import {validate} from 'uuid';
    import type {Inventory, Item, User} from "$lib/server/db/schema";
    import {parseTimestamp} from '$lib/utilities'
    import FilterSettings from "./utilities.svelte.ts";
    import {getInventory, getItems, getTotalItemCount} from './data.remote.ts';
    import Utility from "../../browse/utility";
    import {createItem} from './data.remote.ts';
    import ItemCreationSuccessfulToast from "../../../../components/Toasts/ItemCreationSuccessful.svelte";
    import GenericErrorToast from "../../../../components/Toasts/GenericError.svelte";
    import {getCurrencies} from "./data.remote.ts";

    const currencies = await getCurrencies();

    const imageModules = import.meta.glob('$lib/assets/uploads/item-images/*.{avif,gif,heif,jpeg,jpg,png,tiff,webp}',
        {
            eager: false,
            query: {
                enhanced: false
            }
        }
    )

    //todo: Add logic to archive deleted items for 30 days to allow for recovery of deleted items
    //todo: After implementing todo above, add option to permanently delete any archived item

    /*
    * <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><g fill="currentColor"><circle cx="5" cy="10" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="15" cy="10" r="2"/></g></svg>
    * <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><path fill="currentColor" fill-rule="evenodd" d="M4 5.543V4.25H3a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1h1a1 1 0 1 1 0 2H3a3 3 0 0 1-3-3v-3.5a3 3 0 0 1 3-3h1V.957a.5.5 0 0 1 .854-.353l2.292 2.292a.5.5 0 0 1 0 .708L4.854 5.896A.5.5 0 0 1 4 5.543m6 6.207v1.293a.5.5 0 0 1-.854.354l-2.292-2.293a.5.5 0 0 1 0-.708l2.292-2.292a.5.5 0 0 1 .854.353V9.75h1a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1h-1a1 1 0 1 1 0-2h1a3 3 0 0 1 3 3v3.5a3 3 0 0 1-3 3z" clip-rule="evenodd"/></svg>
    *  */
</script>

<script lang="ts">
    import {deleteItem} from "./data.remote";

    if (!page.params.id || !validate(page.params.id)) {
        error(404, 'Inventory ID is required!');
    }

    const id = page.params.id;

    const user: User = getContext('user');

    //todo: Add option to save filters, and make them persistent for the user.
    const filterSettings: FilterSettings = new FilterSettings();

    let inventory: Inventory | undefined = $state(undefined);
    let itemCount: number = $state(0);
    let totalPages = $derived(Math.ceil(itemCount / filterSettings.columnSize) ?? 1);
    let items: Item[] = $state([]);

    onMount(async () => {
        const rawInventory = await getInventory(id);
        if (!rawInventory) error(404, 'Failed to find inventory!');
        inventory = rawInventory;

        itemCount = await getTotalItemCount(String(id)) ?? 0;
        // const userFilterSettings = getUserFilterSettings();
        // filterSettings.load(userFilterSettings); Set filter settings loaded from user data.
    })

    let isItemCreatorOpen: boolean = $state(false);
    let isFilterContainerOpen: boolean = $state(false);

    /* Item Container*/
    let order_by = $state('name');
    let order = $state('');
    let currentPage = $state(1);

    await refresh();

    let nameFilter = $state('DEFAULT');
    let lastUpdateFilter = $state('DEFAULT');
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

    async function refresh(force = false) {
        const offset = filterSettings.columnSize * (currentPage - 1);

        if (force) await getItems({inventory: String(page.params.id), amount: filterSettings.columnSize, order_by, order, offset}).refresh();
        else {
            const newItems: Item[] = await getItems({inventory: String(page.params.id), amount: filterSettings.columnSize, order_by, order, offset}) || [];
            items = newItems;
        }
    }

    async function updateFilter(filter: string, current: string) {
        const next = String(getNextState(current));

        if (next === 'DEFAULT') {
            order = '';
            order_by = 'name';

            nameFilter = 'DEFAULT';
            itemsFilter = 'DEFAULT';
            priceFilter = 'DEFAULT';
            lastUpdateFilter = 'DEFAULT';
        } else {
            order = next;

            if (filter == 'name') {
                nameFilter = next;
                order_by = 'name';

                priceFilter = 'DEFAULT';
                itemsFilter = 'DEFAULT';
                lastUpdateFilter = 'DEFAULT';
            } else if (filter == 'price') {
                priceFilter = next;
                order_by = 'price';

                itemsFilter = 'DEFAULT';
                nameFilter = 'DEFAULT';
                lastUpdateFilter = 'DEFAULT';
            } else if (filter == 'amount') {
                itemsFilter = next;
                order_by = 'amount';

                nameFilter = 'DEFAULT';
                itemsFilter = 'DEFAULT';
                lastUpdateFilter = 'DEFAULT';
            } else if (filter == 'last_update') {
                lastUpdateFilter = next;
                order_by = 'last_update';

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

{#if createItem.result && createItem.result.success }
    <div class="item-creation-success-toast generic-toast-parent-class play-animation">
        <ItemCreationSuccessfulToast/>
    </div>
{/if}

{#if createItem.result && !createItem.result.success }
    <div class="item-creation-failed-toast generic-toast-parent-class play-animation">
        {#if createItem.result?.error }
            <GenericErrorToast error={String(createItem.result?.error)}/>
        {:else}
            <GenericErrorToast/>
        {/if}
    </div>
{/if}

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
                            <button id="filters-button" class="filters-button" title="Filters" onclick={() => {
                                isItemCreatorOpen = false;
                                isFilterContainerOpen = !isFilterContainerOpen;
                            }}>
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"/>
                                </svg>
                                Filters
                            </button>
                            <button id="create-item-button" class="create-item-button" onclick={() => {
                                isFilterContainerOpen = false;
                                isItemCreatorOpen = !isItemCreatorOpen;
                            }}>
                                <svg width="19" height="19" viewBox="0 0 14 14">
                                    <path fill="currentColor" fill-rule="evenodd"
                                          d="M1.5 1.784c0-.157.127-.284.284-.284h3.182c.157 0 .284.127.284.284v3.182a.284.284 0 0 1-.284.284H1.784a.284.284 0 0 1-.284-.284zM1.784.25C.937.25.25.937.25 1.784v3.182C.25 5.813.937 6.5 1.784 6.5h3.182c.847 0 1.534-.687 1.534-1.534V1.784C6.5.937 5.813.25 4.966.25zM8.75 9.034c0-.157.127-.284.284-.284h3.182c.157 0 .284.127.284.284v3.182a.284.284 0 0 1-.284.284H9.034a.284.284 0 0 1-.284-.284zM9.034 7.5c-.847 0-1.534.687-1.534 1.534v3.182c0 .847.687 1.534 1.534 1.534h3.182c.847 0 1.534-.687 1.534-1.534V9.034c0-.847-.687-1.534-1.534-1.534zM.25 9.034C.25 8.187.937 7.5 1.784 7.5h3.182c.847 0 1.534.687 1.534 1.534v3.182c0 .847-.687 1.534-1.534 1.534H1.784A1.534 1.534 0 0 1 .25 12.216zM10.625.25a.75.75 0 0 1 .75.75v1.625H13a.75.75 0 0 1 0 1.5h-1.625V5.75a.75.75 0 0 1-1.5 0V4.125H8.25a.75.75 0 0 1 0-1.5h1.625V1a.75.75 0 0 1 .75-.75"
                                          clip-rule="evenodd"/>
                                </svg>
                                Add Item
                            </button>
                            <button id="refresh-button" class="refresh-button" title="Refresh" onclick="{async () => {
                                await refresh();
                            }}">
                                <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
                                </svg>
                            </button>
                            <!-- todo - Add inventory settings -->
                            <button id="inventory-settings-button" class="inventory-settings-button" title="Settings">
                                <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </section>
                {#if (isFilterContainerOpen) }
                    <div class="extra-container {isFilterContainerOpen?'open':'closed'} inventory-filter-container">
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
                                        <path fill="currentColor"
                                              d="M17.75 20.25q-1.575 0-2.662-1.088T14 16.5t1.088-2.662t2.662-1.088t2.663 1.088T21.5 16.5t-1.088 2.663t-2.662 1.087M11 17.5H5q-.425 0-.712-.288T4 16.5t.288-.712T5 15.5h6q.425 0 .713.288T12 16.5t-.288.713T11 17.5m-4.75-6.25q-1.575 0-2.662-1.088T2.5 7.5t1.088-2.662T6.25 3.75t2.663 1.088T10 7.5t-1.088 2.663T6.25 11.25M19 8.5h-6q-.425 0-.712-.288T12 7.5t.288-.712T13 6.5h6q.425 0 .713.288T20 7.5t-.288.713T19 8.5"/>
                                    </svg>
                                    <h1>Columns</h1>
                                </div>
                                <div class="buttons">
                                    <button class="extra-container-button price filter-button {filterSettings.price ? '' : 'off'}" style="order:{filterSettings.price ? 1 : 101}"
                                            onclick={() => filterSettings.price = !filterSettings.price}>
                                        Prices
                                    </button>
                                    <button class="extra-container-button last-updated filter-button {filterSettings.lastUpdated ? '' : 'off'}" style="order:{filterSettings.lastUpdated ? 2 : 102}"
                                            onclick={() => filterSettings.lastUpdated = !filterSettings.lastUpdated}>
                                        Last Updated
                                    </button>
                                    <button class="extra-container-button description filter-button {filterSettings.description ? '' : 'off'}" style="order:{filterSettings.description ? 3 : 103}"
                                            onclick={() => filterSettings.description = !filterSettings.description}>
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
                                    <button onclick={() => filterSettings.columnSize = 15} class="extra-container-button filter-button row-amount {filterSettings.columnSize === 15 ? 'selected' : ''}">15</button>
                                    <button onclick={() => filterSettings.columnSize = 30} class="extra-container-button filter-button row-amount {filterSettings.columnSize === 30 ? 'selected' : ''}">30</button>
                                    <button onclick={() => filterSettings.columnSize = 45} class="extra-container-button filter-button row-amount {filterSettings.columnSize === 45 ? 'selected' : ''}">45</button>
                                    <button onclick={() => filterSettings.columnSize = 60} class="extra-container-button filter-button row-amount {filterSettings.columnSize === 60 ? 'selected' : ''}">60</button>
                                </div>
                            </div>
                        </section>
                    </div>
                {:else if (isItemCreatorOpen) }
                    <div class="extra-container {isItemCreatorOpen?'open':'closed'} create-item-container" id="create-item-container">
                        <div class="header">
                            <h1>Add Item</h1>
                        </div>
                        <form {...createItem} id="item-creator-form" class="item-creator-form" autocomplete="off" enctype="multipart/form-data">
                            <button type="reset" id="item-creator-form-reset-button" title="Reset form" hidden></button>
                            <input {...createItem.fields.inventoryUuid.as('text')} value="{page.params?.id}" hidden required/>
                            <div class="option-container">
                                <label for="name">Item Name</label>
                                <input {...createItem.fields.name.as('text')} id="item-name" placeholder="Name" required/>
                            </div>
                            <div class="option-container">
                                <label for="description">Description</label>
                                <input {...createItem.fields.description.as('text')} id="description" name="description" placeholder="Description"/>
                            </div>
                            <div class="option-container">
                                <label for="amount">Amount</label>
                                <input {...createItem.fields.amount.as('number')} id="amount" value=0 required/>
                            </div>
                            <div class="option-container price-section">
                                <div class="price-section-input">
                                    <label for="price">Price</label>
                                    <input {...createItem.fields.price.as('number')} id="price" placeholder="0" min="0" value="0"/>
                                </div>
                                <div class="price-section-input">
                                    <label for="currency">Currency</label>
                                    <select {...createItem.fields.currency.as('text')} id="currencies">
                                        {#each currencies as currency}
                                            {#if (currency.code === "DKK") }
                                                <option value="{currency.code}" selected>{currency.code}</option>
                                            {:else}
                                                <option value="{currency.code}">{currency.code}</option>
                                            {/if}
                                        {/each}
                                    </select>
                                </div>
                            </div>
                            <div class="option-container">
                                <label for="image">Image</label>
                                <input {...createItem.fields.image.as('file')} id="image"
                                       class="dark:bg-input-background border-button-border dark:border-input-border rounded-(--form-input-border-radius)"/>
                            </div>
                            <div class="option-container">
                                <label for="external">External</label>
                                <input {...createItem.fields.external.as('text')} id="external" placeholder="URL"
                                       class="dark:bg-input-background border-button-border dark:border-input-border rounded-(--form-input-border-radius)"/>
                            </div>
                            <div class="item-creation-buttons">
                                <button type="{createItem.result ? 'button' : 'submit'}" class="extra-container-button item-confirm-creation-button bg-button-background dark:bg-dark-button-background border-button-border dark:border-dark-button-border
                rounded-(--border-radius) text-text-primary dark:text-dark-text-primary">
                                    Create
                                </button>
                            </div>
                        </form>
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
                                                onclick={async () => await updateFilter("last_update",lastUpdateFilter)}>
                                            Last Updated
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6 { lastUpdateFilter === 'DEFAULT' ? 'auto-hide-filter-icon' : '' }"
                                                 style="opacity:0;">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="{Utility.getFilterSymbol(lastUpdateFilter)}"/>
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
                                <div class="item-manage-spacer"></div>
                            </div>
                        </div>
                        <div class="inventory-list">
                            {#if inventory }
                                {#if items.length > 0 }
                                    {#each items as item}
                                        <a data-sveltekit-preload-data="tap" href='/' target='_parent' style="height:5.5rem !important;"
                                           class="inventory-list-entry
                                border-t-container-border dark:border-t-dark-container-border
                                border-b-container-border dark:border-b-dark-container-border">
                                            <div class="entry-item inventory-meta">
                                                <div class="inventory-image">
                                                    {#if (item.image) }
                                                        <img src='/src/lib/assets/uploads/item-images/{item.image}' alt="Item Thumbnail">
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
                                                    {parseTimestamp(String(item.last_update))}
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
                                            <div class="quick-delete">
                                                <!-- todo - Add popup warning to confirm deletion -->
                                                <button title="Delete Item" onclick="{() => {
                                                    deleteItem(item.uuid);
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

            .inventory-header-content {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                align-content: center;
                justify-content: space-between;

                padding: 2rem 0;
                margin: 0;

                width: 80rem;

                .inventory-name {
                    display: flex;
                    flex-flow: row nowrap;
                    align-items: center;
                    justify-content: flex-start;
                    overflow: visible;
                    user-select: none;

                    h1 {
                        font-size: 2.25rem;
                        font-family: 'FunnelDisplay', sans-serif;
                        font-variation-settings: "wght" 800;
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

                    .refresh-button, .inventory-settings-button {
                        padding: .5em 1em !important;
                    }

                    .refresh-button, .filters-button, .create-item-button, .inventory-settings-button {
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

                    .refresh-button:hover, .filters-button:hover, .create-item-button:hover, .inventory-settings-button:hover {
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

        .extra-container {
            display: flex;
            flex-flow: column wrap;
            justify-content: flex-start;

            width: 90rem;
            opacity: 0;
            margin-top: 0;
            margin-bottom: 2.5rem;
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
            }

            .extra-container-button {
                background: var(--theme-background-button);
                color: var(--theme-text);
                border: var(--theme-form-input-border-dark);
                border-radius: .75rem;
                padding: .75rem 1.5rem;
                user-select: none;
                font-size: 1rem;
                font-weight: 700;
                cursor: pointer;
                gap: .25rem;

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
        }

        .extra-container.closed {
            visibility: hidden;
            margin-top: 0;
            opacity: 0;
        }

        .extra-container.create-item-container {
            form {
                display: flex;
                flex-flow: column wrap;
                justify-content: center;
                align-items: center;
                align-content: center;
                height: 100%;

                font-family: 'Funnel Sans', sans-serif;

                label {
                    color: var(--theme-text);
                }

                input, option, select {
                    background: var(--theme-form-input-background-dark);
                    border: var(--theme-form-input-border-dark);
                    border-radius: var(--form-input-border-radius);
                    color: var(--theme-text);
                }

                .option-container {
                    display: flex;
                    flex-flow: column nowrap;

                    width: 80%;
                }

                #description {
                    height: 3rem;
                }

                .price-section {
                    display: flex;
                    flex-flow: row nowrap;
                    align-items: center;

                    .price-section-input:first-child {
                        flex-grow: 2;
                    }

                    .price-section-input {
                        display: flex;
                        flex-flow: column nowrap;
                        align-items: center;
                        flex-grow: 0;

                        #currencies, #currencies * {
                            background: var(--theme-form-input-background-dark);
                            border: var(--theme-form-input-border-dark);
                            border-radius: 0.5rem;

                            scroll-behavior: smooth;
                            scrollbar-width: none;
                        }

                        select option {
                            color: var(--theme-text);
                        }
                    }
                }

                input {
                    margin-top: .25rem;
                    margin-bottom: 1.5rem;
                }
            }
        }

        .extra-container.inventory-filter-container {
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
                        background: #1F2023FF;
                    }
                }
            }
        }

        .inventory-body-section {
            user-select: none !important;

            .inventory-list-container {
                width: 90rem;
                height: fit-content;

                margin: 0 0 2.5rem 0;

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

                        .item-manage-spacer {
                            flex: 1 5%;
                        }

                        .header-item:first-child {
                            flex: 1 68%;
                        }

                        .header-item.items-filter {
                            flex: 1 7%;
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

                        z-index: 20;

                        .quick-delete {
                            flex: 1 5%;
                            align-items: center;
                            opacity: 0;

                            transition: 50ms ease-in-out;
                            user-select: none;

                            z-index: 25;

                            button {
                                cursor: pointer;
                                width: 2.25rem;
                                height: 2.25rem;
                            }

                            svg {
                                justify-self: center;
                                stroke: var(--theme-text);
                                width: 100%;
                                height: 100%;

                                padding: .5em .25em;

                                background: var(--theme-background-button);
                                border: .122em solid var(--theme-border-button);
                                border-radius: .7em;
                                transition: 50ms ease-in-out;
                            }
                        }

                        .quick-delete button:hover {
                            svg {
                                background: var(--theme-background-button-hover);
                                stroke: oklch(58.6% 0.253 17.585) !important;
                                stroke-width: 2.25;
                                transition: 50ms ease-out;
                            }
                        }

                        .entry-item.inventory-item-amount {
                            flex: 1 7%;
                        }

                        .entry-item:first-child {
                            flex: 1 68%;
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
                                    width: 2.5rem;
                                    height: 2.5rem;
                                    margin: 1rem;
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

                        .quick-delete {
                            opacity: 1;
                            transition: 25ms ease-in-out;

                            svg {
                                stroke: var(--theme-text);
                            }
                        }

                        svg {
                            stroke: var(--theme-text-accent);
                            transition: 50ms ease-out;
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