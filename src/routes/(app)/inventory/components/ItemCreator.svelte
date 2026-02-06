<script module lang="ts">
    import {getCurrencies} from "../[id]/data.remote.ts";
    import {enhance} from '$app/forms';

    const currencies = await getCurrencies();
</script>
<script lang="ts">
    import {onMount} from "svelte";
    import {page} from "$app/state";

    let {creatorScale = $bindable()} = $props();

    onMount(() => {
        document.getElementById('create-item-container-exit-button')?.addEventListener('click', () => creatorScale.target = 0)
        document.getElementById('item-creator-form')?.addEventListener('submit', () => {
            creatorScale.target = 0;
            document.getElementById('item-creator-form-reset-button')?.click();
        })
    });
</script>

<div class="create-item-container" id="create-item-container">
    <button type="reset" class="create-item-container-exit-button" id="create-item-container-exit-button" title="Close Item Creator">
    </button>
    <form method="POST" action="?/createItem" id="item-creator-form" class="item-creator-form" autocomplete="off" enctype="multipart/form-data" use:enhance>
        <button type="reset" id="item-creator-form-reset-button" title="Reset form" hidden></button>
        <input type="text" name="inventory_uuid" value="{page.params?.id}" hidden required/>
        <div class="option-container">
            <label for="item-name">Item Name</label>
            <input type="text" id="item-name" name="name" placeholder="Name" required/>
        </div>
        <div class="option-container">
            <label for="description">Description</label>
            <input type="text" id="description" name="description" placeholder="Description"/>
        </div>
        <div class="option-container">
            <label for="amount">Amount</label>
            <input type="number" id="amount" name="amount" value=0 required/>
        </div>
        <div class="option-container price-section">
            <div class="price-section-input">
                <label for="price">Price</label>
                <input type="number" id="price" name="price" placeholder="0" min="0" value="0"/>
            </div>
            <div class="price-section-input">
                <label for="currencies">Currency</label>
                <select id="currencies" name="currency">
                    {#each currencies as currency}
                        {#if (currency.code === "DKK") }
                            <option value="{currency.code}" selected>{currency.code}</option>
                        {/if}
                        <option value="{currency.code}">{currency.code}</option>
                    {/each}
                </select>
            </div>
        </div>
        <div class="option-container">
            <label for="image">Image</label>
            <input type="file" id="image" name="image"
                   class="dark:bg-input-background border-button-border dark:border-input-border rounded-(--form-input-border-radius)"/>
        </div>
        <div class="option-container">
            <label for="external">External</label>
            <input type="url" id="external" name="external" placeholder="URL"
                   class="dark:bg-input-background border-button-border dark:border-input-border rounded-(--form-input-border-radius)"/>
        </div>
        <div class="item-creation-buttons">
            <button type="submit" class="item-confirm-creation-button bg-button-background dark:bg-dark-button-background border-button-border dark:border-dark-button-border
                rounded-(--border-radius) text-text-primary dark:text-dark-text-primary">
                Create
            </button>
        </div>
    </form>
</div>

<style>
    .create-item-container {
        height: 40rem;
        width: 64rem;

        background: rgba(from var(--theme-background-container) r g b / .9);
        backdrop-filter: blur(6px);
        border-color: var(--theme-border-container);
        border-width: var(--border-width);
        border-radius: var(--border-radius);

        .create-item-container-exit-button {
            position: absolute;
            top: 1.25rem;
            right: 1.25rem;

            width: 1rem;
            height: 1rem;

            background: var(--theme-button-idle-background);
            border-radius: 100%;

            overflow: hidden;
        }

        .create-item-container-exit-button:hover {
            background: oklch(0.621 0.199 17.537);
        }

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

        .item-creation-buttons {
            display: flex;
            justify-content: center;
            column-gap: .8rem;

            button {
                padding: .75rem 1.25rem;
                border-width: var(--border-width);
            }

            .item-confirm-creation-button:hover,
            .item-cancel-creation-button:hover {
                cursor: pointer;
                color: var(--dark-text-primary);
                transition-duration: 75ms;
            }

            .item-confirm-creation-button:hover {
                background-color: oklch(70.7% 0.165 254.624);
            }

            .item-cancel-creation-button:hover {
                background-color: oklch(58.6% 0.253 17.585);
            }
        }
    }
</style>