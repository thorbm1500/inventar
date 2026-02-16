<script lang="ts">
    import {accountSettings} from "../../routes/(app)/settings/data.remote";
    import type {User} from "$lib/server/db/schema";
    import {getContext} from "svelte";

    let {settings = $bindable()} = $props();

    let user: User = $state(getContext('user'));

    let currentSettingsPage = $state(`${settings.settingCategories[0].name}_${settings.settingCategories[0].SettingSubCategories[0].name}`);
    let hasUnsavedChanges = $state(false);
</script>

<section class="inventory-settings-page">
    <div class="sidebar">
        <nav class="inventory-settings-nav">
            {#each settings.settingCategories as categories }
                <p class="nav-category">{String(categories.name).toUpperCase()}</p>
                {#each categories.SettingSubCategories as category}
                    <button class="nav-link {currentSettingsPage===`${categories.name}_${category.name}`?'selected':''}"
                            onclick="{() => currentSettingsPage = `${categories.name}_${category.name}`}">{category.name}</button>
                {/each}
            {/each}
        </nav>
    </div>
    <div>
        <div class="container">
            {#each settings.settingCategories as categories }
                {#each categories.SettingSubCategories as category}
                    {#if currentSettingsPage === `${categories.name}_${category.name}`}
                        {#each category.settings as setting}
                            <div class="setting-item">
                                {#if (setting.type === 'text')}
                                    <div class="option text">
                                        <h1>{setting.title}</h1>
                                        {#if (setting.readonly) }
                                            <input bind:value={setting.value} name="name" id="name" placeholder="{setting.title}..." spellcheck="false"
                                                   data-protonpass-ignore="true" data-lpignore="true" data-1p-ignore data-bwignore readonly>
                                        {:else}
                                            <input bind:value={setting.value} name="name" id="name" placeholder="Inventory Name..." spellcheck="false"
                                                   data-protonpass-ignore="true" data-lpignore="true" data-1p-ignore data-bwignore>
                                        {/if}
                                    </div>
                                {:else if (setting.type === 'textarea')}
                                    <div class="option textarea">
                                        <h1>{setting.title}</h1>
                                        <textarea {...accountSettings.fields.email.as('text')} bind:value={setting.value} name="name" id="name" placeholder="{setting.title}..." spellcheck="false" data-protonpass-ignore="true" data-lpignore="true" data-1p-ignore data-bwignore></textarea>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                        <div class="save-settings-div" style="display:flex;flex-flow:row nowrap;align-items:center;">
                            <button type="{hasUnsavedChanges?'submit':'button'}" class="theme-button">Save</button>
                            {#if accountSettings.result?.success}
                                <p class="form-submission-meta success">Changes saved.</p>
                            {:else if (accountSettings.pending > 0) }
                                <p class="form-submission-meta saving">Saving...</p>
                            {:else if (hasUnsavedChanges) }
                                <p class="form-submission-meta unsaved">Unsaved changes.</p>
                            {/if}
                        </div>
                    {/if}
                {/each}
            {/each}
        </div>
        <p class="uuid"
           style="position:absolute;margin-top:.5rem;margin-left:.5rem;color:var(--theme-text-third);font-family:'JetBrains Mono', sans-serif;font-weight:700;opacity:.25;font-size:.75rem;user-select:text;cursor:default;">{user?.uuid ?? 'Loading...'}
            <br/>Version: 0.0.1-ALPHA</p>
    </div>
</section>

<style>
    *:focus {
        box-shadow: none !important;
        transition: box-shadow 0ms linear;
    }

    .option {
        transition: var(--theme-transition-out);

        h1 {
            font-family: 'FunnelDisplay', sans-serif;
            font-size: 1.15rem;
            font-weight: 700;
            margin-bottom: .25rem;
            padding-left: .5rem;
            width: 5.5rem;

            user-select: none;
        }

        input,textarea {
            width: 100%;

            background: var(--theme-background-input);
            border-radius: var(--theme-border-radius);
            border: var(--theme-border-width) solid var(--theme-border-input);

            font-size: 1.05rem;
            font-weight: 600;
            caret-shape: underscore;
            caret-color: var(--theme-text);

            user-select: none;
            transition: border-color var(--theme-transition-out);
        }

        textarea {
            resize: none;
            height: fit-content;
            max-height: 12rem;
        }

        input::selection {
            color: #FFFFF2;
            background: var(--theme-text-accent);
        }

        input:focus,textarea:focus {
            border-color: var(--theme-border-input-focus);
            user-select: text;
            transition: border-color var(--theme-transition-in);
        }
    }

    .option.readonly {
        transition: var(--theme-transition-out);

        input {
            color: var(--theme-text-third);
            transition: var(--theme-transition-out);
        }

        input:hover, input:focus {
            color: var(--theme-text-secondary);
            transition: border-color var(--theme-transition-in);
        }
    }

    .inventory-settings-page {
        display: flex;
        flex-flow: row nowrap;
        box-sizing: border-box;

        user-select: none;

        .sidebar {
            width: 12rem;
            height: fit-content;
            min-height: 8rem;
            border: var(--theme-border-width) solid var(--theme-border-container);
            border-radius: var(--theme-border-radius);
            padding: 1rem 1.5rem;
            margin-right: .35rem;

            background: var(--theme-background-container);

            .inventory-settings-nav {
                display: flex;
                flex-flow: column nowrap;
                width: fit-content;
                align-items: flex-start;

                color: var(--theme-text);
                font-family: 'FunnelSans', sans-serif;
                font-size: 1.1rem;

                .nav-category:first-child {
                    margin-top: 0;
                }

                .nav-category {
                    font-size: .75rem;
                    letter-spacing: .15rem;
                    color: var(--theme-text-third);
                    font-weight: 700;
                    margin: .5rem 0 .25rem 0;
                }

                .nav-link {
                    margin: .25rem 0 .25rem .5rem;
                    padding: .15rem .5rem;

                    cursor: pointer;
                    user-select: none;

                    transition: 200ms ease-in-out;
                }

                .nav-link.selected {
                    text-shadow: 0 0 .45rem rgba(0, 0, 0, 0.5);
                    background: var(--theme-text-accent);
                    border-radius: .4em;

                    transition: 50ms ease-in-out;
                }
            }
        }

        .container {
            width: 58rem;
            height: fit-content;
            max-height: 70vh !important;
            overflow-x: hidden;
            overflow-y: scroll;
            overflow: auto;
            scrollbar-gutter: stable;
            scrollbar-width: thin;
            scrollbar-color: var(--theme-text-accent) transparent;
            min-height: 20rem;
            border: .122em solid var(--theme-border-container);
            border-radius: .65em;

            background: var(--theme-background-container);

            margin-left: .35rem;
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