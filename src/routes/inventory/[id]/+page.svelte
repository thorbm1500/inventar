<script module lang="ts">
    import Header from "../../Header.svelte";
    import {error} from '@sveltejs/kit';
    import {validate} from 'uuid';
    import type {Inventory} from "$lib/server/db/schema";
    import type {PageProps} from "../../../../.svelte-kit/types/src/routes/inventory/[id]/$types";
    import ItemCreator from "../components/ItemCreator.svelte";
    import ItemCreationSuccessfulToast from "../../../components/Toasts/ItemCreationSuccessful.svelte";
    import GenericErrorToast from "../../../components/Toasts/GenericError.svelte";
</script>

<script lang="ts">
    import {page} from "$app/state";
    import {getInventory, getItems} from './data.remote.ts';
    import {Spring} from "svelte/motion";

    if (!page.params.id || !validate(page.params.id)) {
        error(404, 'Inventory ID is required!');
    }

    let {form}: PageProps = $props();
    let pagination_page = $state(1);

    const rawInventory = await getInventory(page.params.id);
    let inventory: Inventory = $state(rawInventory);
    let items = await getItems({id: page.params.id, amount: 15, order: "NONE"}) || []

    let creatorScale = $state(new Spring(0, {
        stiffness: 0.1,
        damping: 0.3
    }))

    let itemCreatorOpacity = $derived(creatorScale.current);
    let isItemCreatorOpen: boolean = $derived(itemCreatorOpacity !== 0);
</script>

<Header/>

{#if form?.success }
    <div class="item-creation-success-toast generic-toast-parent-class play-animation">
        <ItemCreationSuccessfulToast/>
    </div>
{/if}


{#if form && form.failed }
    <div class="item-creation-failed-toast generic-toast-parent-class play-animation">
        <GenericErrorToast error="{form?.error}"/>
    </div>
{/if}

<div class="item-creation-container"
     style="opacity: {itemCreatorOpacity}; visibility: {isItemCreatorOpen ? 'visible' : 'hidden'}; transform: scale({itemCreatorOpacity});">
    <ItemCreator bind:creatorScale />
</div>

<section class="inventory-section">
    <section class="inventory-header-section">
        <h1>{inventory.name}</h1>
        <button id="create-item-button" class="create-item-button" onclick={() => creatorScale.target = 1}>
            <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            Add Item
        </button>
    </section>
    <div class="inventory-container">
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

<style>
    :root {
        --inventory-header-height: 6rem;
    }

    .item-creation-container {
        position: absolute;
        top: calc(((var(--header-height) / 2) + 50vh) - 20rem);
        left: calc(50vw - 32rem);
        opacity: 0;
    }

    .inventory-section {
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        align-content: center;

        width: 100vw;
        height: calc(100% - var(--header-height));
        overflow-y: auto;
        overflow-x: hidden;

        .inventory-header-section {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            align-content: center;
            justify-content: space-between;

            min-width: 80rem;
            max-width: 100rem;

            height: var(--inventory-header-height);

            h1 {
                font-size: 2.15rem;
                font-family: 'FunnelSans', sans-serif;
                font-variation-settings: "wght" 900;
                color: var(--theme-text);

                user-select: none;
            }

            .create-item-button {
                display: flex;
                flex-flow: row nowrap;
                gap: .5rem;

                padding: .75em 1.25em;

                font-family: 'FunnelSans', sans-serif;
                font-variation-settings: "wght" 600;
                color: var(--theme-text);

                background: var(--theme-background-container);
                border: var(--border-width) solid var(--theme-border-button);
                border-radius: var(--border-radius);

                user-select: none;
            }

            .create-item-button:hover {
                cursor: pointer;
                color: var(--accent-text);

                transition-duration: 75ms;

                svg {
                    stroke-width: 2.75;
                    transform: rotate(90deg);

                    transition: 75ms ease-in-out,
                    transform 125ms ease-in-out;
                }
            }
        }

        .inventory-container {
            height: 44rem;
            min-width: 84rem;
            max-width: 100rem;
            border-width: var(--border-width);

            display: flex;
            flex-flow: column nowrap;

            background: var(--theme-background-container);
            border-color: var(--theme-border-container);
            border-radius: var(--theme-border-radius);

            .item-list {
                flex-grow: 1;

                .item {
                    color: var(--theme-text);
                }
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
</style>