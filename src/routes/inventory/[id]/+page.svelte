<script lang="ts">
    import Header from "../../Header.svelte";
    import {page} from "$app/state";

    import {error} from '@sveltejs/kit';
    import {validate} from 'uuid';
    import {getInventory, getItems} from './data.remote.ts';

    import ItemCreator from "../components/ItemCreator.svelte";
    import {it} from "node:test";

    if (!page.params.id || !validate(page.params.id)) {
        error(404, 'Inventory ID is required!');
    }

    const inventory = page.params.id;

    let {
        inventory_uuid,
        inventory_name,
        inventory_description,
        inventory_image,
        inventory_primary
    } = await getInventory(inventory);

    let pagination_page = $state(1);
    let items_per_page = $state(15);

    let items = await getItems({id: inventory, amount: items_per_page, order: "NONE"}) || []
</script>

<Header/>

<section class="inventory-section">
    <section class="inventory-header-section">
        <h1 class="text-text-primary dark:text-dark-text-primary">{inventory_name}</h1>
        <a href="{page.url}/item/create" class="create-item-button text-text-primary dark:text-dark-text-primary bg-button-background dark:bg-dark-button-background
                        border-button-border dark:border-dark-button-border rounded-(--border-radius)">
            <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            Add Item
        </a>
    </section>
    <section class="inventory-container-section">
        <div class="inventory-sidebar
         bg-container-background dark:bg-dark-container-background border-container-border dark:border-dark-container-border
         rounded-(--border-radius)">
        </div>
        <div class="inventory-container
                bg-container-background dark:bg-dark-container-background border-container-border dark:border-dark-container-border
                rounded-(--border-radius)">
            <div class="item-container-buttons border-transparent border-b-container-border dark:border-b-dark-container-border">

            </div>
            <div class="item-list">
                {#each items as {item_uuid, name, description, amount, price, currency_code}}
                    <div class="item">Name {name} Amount: {amount}</div>
                {/each}
            </div>
            <div class="page-switch-buttons text-text-primary dark:text-dark-text-primary
                        border-transparent border-t-container-border dark:border-t-dark-container-border">
                <button title="Previous Page Button"
                        class="bg-container-background dark:bg-dark-container-background">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/>
                    </svg>
                </button>
                <p class="bg-container-background dark:bg-dark-container-background">{pagination_page}</p>
                <button title="Next Page Button"
                        class="bg-container-background dark:bg-dark-container-background">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                    </svg>
                </button>
            </div>
        </div>
    </section>
</section>

<style>
    :root {
        --inventory-header-height: 6rem;
        --sidebar-width: 20rem;
    }

    .inventory-section {
        height: calc(100% - var(--header-height));

        .inventory-header-section {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            align-content: center;
            justify-content: space-between;
            margin: 0 4.25rem;

            height: var(--inventory-header-height);

            h1 {
                font-size: 2.15rem;
                font-family: 'FunnelSans', sans-serif;
                font-variation-settings: "wght" 900;
            }

            .create-item-button {
                display: flex;
                flex-flow: row nowrap;
                gap: .5rem;
                font-family: 'FunnelSans', sans-serif;
                font-variation-settings: "wght" 600;

                padding: .75em 1.25em;
                border-width: var(--border-width);
            }

            .create-item-button:hover {
                cursor: pointer;
                color: var(--accent-text);
                font-variation-settings: "wght" 750;

                transition-duration: 75ms;

                svg {
                    stroke-width: 2.75;
                }
            }
        }

        .inventory-container-section {
            display: flex;
            flex-flow: row nowrap;
            align-content: center;
            justify-content: space-evenly;

            height: 100%;
            padding-top: 0;
            padding-bottom: 1.5rem;

            .inventory-sidebar {
                height: var(--container-full-height);
                border-width: var(--border-width);
                width: var(--sidebar-width);
                flex-grow: 0;

                margin-right: 1.5rem;
                margin-left: 3rem;
            }

            .inventory-container {
                height: var(--container-full-height);
                width: calc(90% - var(--sidebar-width));
                border-width: var(--border-width);
                flex-grow: 10;

                display: flex;
                flex-flow: column nowrap;

                margin-left: 1.5rem;
                margin-right: 3rem;

                .item-list {
                    flex-grow: 1;
                }

                .item-container-buttons {
                    height: 2.5rem;
                    flex-grow: 0;

                    border-width: var(--border-width);
                }

                .page-switch-buttons {
                    display: flex;
                    flex-flow: row nowrap;
                    flex-grow: 0;

                    align-items: center;
                    align-content: center;
                    justify-content: center;

                    height: 3rem;

                    border-width: var(--border-width);

                    button {
                        svg {
                            stroke-width: 3.5;
                            height: 1.15rem;
                            justify-self: center;
                        }
                    }

                    p {
                        font-family: 'ArchivoBold', sans-serif;
                        font-size: 1.15rem;
                        margin: 0 .9rem;
                    }
                }
            }
        }
    }
</style>