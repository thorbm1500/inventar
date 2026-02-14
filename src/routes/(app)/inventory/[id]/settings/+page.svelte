<script lang="ts">
    import {page} from "$app/state";
    import {validate} from "uuid";
    import {error} from "@sveltejs/kit";
    import type {Inventory, User} from "$lib/server/db/schema";
    import {getContext, onMount} from "svelte";
    import {getInventory, updateInventoryGeneral} from "../data.remote";
    import type Toast from "../../../../../components/toast.svelte";

    if (!page.params.id || !validate(page.params.id)) {
        error(404, 'Inventory ID is required!');
    }

    const id = page.params.id;

    const user: User = getContext('user');

    let inventory: Inventory | undefined = $state(undefined);
    let currentSettingsPage = $state('general');

    let currentName = $state('Loading...');
    let currentDescription = $state('Loading...');

    let initialName = $state('');
    let initialDescription = $state('');

    onMount(async () => {
        const rawInventory = await getInventory(id);
        if (!rawInventory) error(404, 'Failed to find inventory!');
        inventory = rawInventory;
        currentName = inventory.name;
        initialName = currentName;
        currentDescription = inventory.description ?? '';
        initialDescription = currentDescription;
    })
</script>

<section class="inventory-settings-page">
    <div class="sidebar">
        <nav class="inventory-settings-nav">
            <p class="nav-category">GENERAL</p>
            <button class="nav-link {currentSettingsPage==='general'?'selected':''}" onclick="{() => currentSettingsPage = 'general'}">General</button>
            <button class="nav-link {currentSettingsPage==='access'?'selected':''}" onclick="{() => currentSettingsPage = 'access'}">Access</button>
        </nav>
    </div>
    <div class="container">
        {#if currentSettingsPage === 'general'}
            <div class="setting-item">
                <form {...updateInventoryGeneral} id="general-settings-form">
                    <label>
                        <h1>Name</h1>
                        <input {...updateInventoryGeneral.fields.name.as('text')} bind:value={currentName} name="name" id="name" placeholder="Inventory Name..." spellcheck="false"
                               data-protonpass-ignore="true" data-lpignore="true" data-1p-ignore data-bwignore>
                    </label>
                    <label>
                        <h1>Description</h1>
                        <textarea {...updateInventoryGeneral.fields.description.as('text')} bind:value={currentDescription} name="description" id="description"
                                  placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam commodo at lacus a rhoncus. Sed in magna nisi..."
                                  spellcheck="false"></textarea>
                    </label>
                    <div class="save-settings-div" style="display:flex;flex-flow:row nowrap;align-items:center;">
                        <button type="{(initialName!==currentName || initialDescription!==currentDescription)?'submit':'button'}" class="save-settings-button">Save</button>
                        {#if updateInventoryGeneral.result?.success}
                            <p class="form-submission-meta success">Changes saved.</p>
                        {:else if (updateInventoryGeneral.pending > 0) }
                            <p class="form-submission-meta saving">Saving...</p>
                        {:else if (initialName!==currentName || initialDescription!==currentDescription) }
                            <p class="form-submission-meta unsaved">Unsaved changes.</p>
                        {/if}
                    </div>
                </form>
            </div>
        {/if}
    </div>
</section>

<style>
    *:focus {
        box-shadow: none !important;
        transition: box-shadow 0ms linear;
    }

    form {
        input,textarea {
            background: var(--theme-form-background-input);
            border-radius: .55rem;
            border: .075em solid var(--theme-form-border-input);

            caret-shape: underscore;
            caret-color: var(--theme-text);

            transition: border-color var(--theme-transition-out);
        }

        input:focus,textarea:focus {
            border-color: var(--theme-form-border-input-focus);
            transition: border-color var(--theme-transition-in);
        }
    }

    .inventory-settings-page {
        height: calc(var(--theme-max-page-height) - 4rem);
        width: 71rem;
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        margin-left: calc(50vw - 40rem);
        margin-top: 4rem;
        box-sizing: border-box;

        user-select: none;

        .sidebar {
            width: 10rem;
            height: fit-content;
            min-height: 8rem;
            border: .122em solid var(--theme-border-container);
            border-radius: .65em;
            padding: 1rem 1.5rem;

            background: var(--theme-background-container);

            .inventory-settings-nav {
                display: flex;
                flex-flow: column nowrap;
                width: fit-content;

                color: var(--theme-text);
                font-family: 'FunnelSans', sans-serif;
                font-size: 1.1rem;

                .nav-category {
                    font-size: .75rem;
                    letter-spacing: .15rem;
                    color: var(--theme-text-third);
                    font-weight: 700;
                    margin-bottom: .25rem;
                }

                .nav-link {
                    margin: .25rem 0 .25rem .5rem;

                    cursor: pointer;
                    user-select: none;
                }

                .nav-link.selected {
                    background: var(--theme-text-accent);
                    padding: .15rem .5rem;
                    border-radius: .4em;
                }
            }
        }

        .container {
            width: 60rem;
            height: fit-content;
            min-height: 20rem;
            border: .122em solid var(--theme-border-container);
            border-radius: .65em;

            background: var(--theme-background-container);

            padding: 1rem;

            .save-settings-div {
                .form-submission-meta {
                    margin-left: .75rem;
                }

                .form-submission-meta.success {
                    color: greenyellow;
                }

                .form-submission-meta.saving {
                    color: var(--theme-text-accent);
                }

                .form-submission-meta.unsaved {
                    color: var(--theme-text-third);
                }

                .save-settings-button {
                    color: var(--theme-text);
                    padding: .5rem 1rem;
                    background: var(--theme-background-button);
                    border: .122em solid var(--theme-border-button);
                    border-radius: .65em;

                    cursor: pointer;
                    user-select: none;
                }

                .save-settings-button:hover {
                    background: var(--theme-background-button-hover);
                }
            }

            .setting-item {
                color: var(--theme-text);
                padding: 1rem 1.5rem;

                form {
                    display: flex;
                    flex-flow: column nowrap;
                    gap: 1.5rem;

                    min-width: fit-content;

                    label {
                        font-family: 'FunnelDisplay', sans-serif;

                        h1 {
                            font-size: 1.55rem;
                            font-weight: 700;
                            margin-bottom: .25rem;
                            padding-left: .5rem;
                            width: 5.5rem;
                            letter-spacing: .05rem;

                            user-select: none;
                        }

                        input {
                            font-size: 1.5rem;
                            font-weight: 550;

                            padding: .75rem 1.25rem;

                            width: 100%;
                        }

                        textarea {
                            color: var(--theme-text);
                            appearance: none;
                            outline: none;
                            width: 100%;
                            field-sizing: content;
                            min-height: 12rem !important;
                            max-height: 18rem !important;
                            scrollbar-width: thin;
                            scrollbar-gutter: stable;
                            scroll-behavior: smooth;
                            scrollbar-color: var(--theme-text-accent) transparent;
                            resize: none;
                        }
                    }
                }
            }
        }
    }
</style>