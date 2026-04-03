<script lang="ts">
    import {accountSettings, getSettings} from "../../routes/(app)/account/[id]/settings/data.remote";
    import type {UserSettings} from "$lib/components/settings/UserSettings";
    import Sessions from "$lib/components/Sessions.svelte";
    import {ignorePasswordManagers} from "$lib/util/utilities";
    import type {User} from "$lib/server/db/interfaces";
    import {ContextHandler} from "$lib/util/ContextHandler.svelte.ts";

    const user: User | null = $derived(ContextHandler.getUser());
    $effect(() => {
        if (!user) throw new Error('No user context has been set!');
    });

    let settings: UserSettings = $derived(await getSettings(user.uuid) as UserSettings);
    // svelte-ignore state_referenced_locally
    let currentCategory = $state(settings.settings.keys().toArray()[0]);

    // svelte-ignore state_referenced_locally
    let currentSubcategory = $state(settings.settings.get(currentCategory)?.keys().toArray()[0]);

    let hasUnsavedChanges = $state(false);
</script>

<section class="inventory-settings-page">
    <div class="sidebar">
        <nav class="inventory-settings-nav">
            {#each settings.settings.entries() as categories}
                <p class="nav-category">{String(categories[0]).toUpperCase()}</p>
                {#each categories[1] as category}
                    <button class="nav-link {currentCategory === categories[0] && currentSubcategory === category[0] ?'selected':''}"
                            onclick="{() => {
                                currentCategory = categories[0];
                                currentSubcategory = category[0];
                            }}">{category[0]}</button>
                {/each}
            {/each}
        </nav>
    </div>
    <div class="settings-container">
        <div class="container">
            {#each settings.settings.entries() as categories}
                {#if currentCategory === categories[0]}
                    {#each categories[1] as category}
                        {#if currentSubcategory === category[0]}
                            {#each category[1] as setting}
                                {#if setting.type === 'custom_sessions'}
                                    <Sessions/>
                                {:else}
                                    <div class="setting-item">
                                        <div class="option {setting.type} {setting.readonly ? 'readonly' : ''}">
                                            <div class="top-section">
                                                <h1>{setting.title}</h1>
                                                {#if (setting.type === 'text')}
                                                    {#if (setting.readonly) }
                                                        <div class="readonly-container select-all">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                                      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                                                            </svg>
                                                            {setting.value}
                                                        </div>
                                                    {:else}
                                                        <input bind:value={setting.value} name="name" id="name" placeholder="Inventory Name..."
                                                               use:ignorePasswordManagers spellcheck="false">
                                                    {/if}
                                                {:else if (setting.type === 'textarea')}
                                        <textarea {...accountSettings.fields.email.as('text')} bind:value={setting.value} name="name" id="name" placeholder="{setting.title}..."
                                                  use:ignorePasswordManagers spellcheck="false"></textarea>
                                                {:else if (setting.type === 'toggle')}
                                                    <label class="toggle-container {Boolean(setting.value) ? 'on' : ''}">
                                                        <div id="toggle-slider"></div>
                                                        {#if typeof setting.value !== 'string' }
                                                            <input type="checkbox" class="toggle-button" bind:checked={setting.value} hidden>
                                                        {/if}
                                                    </label>
                                                {/if}
                                            </div>
                                            {#if (setting.subtitle)}
                                                <div class="bottom-section">
                                                    <h3>{@html setting.subtitle}</h3>
                                                </div>
                                            {/if}
                                        </div>
                                    </div>
                                {/if}
                            {/each}
                            {#if !category[1][0].type.includes('custom')}
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
                        {/if}
                    {/each}
                {/if}
            {/each}
        </div>
        <p class="version-tag">Version: 0.0.1-ALPHA</p>
    </div>
</section>

<style>
    *:focus {
        box-shadow: none !important;
        transition: box-shadow 0ms linear;
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
                font-family: 'FunnelDisplay', sans-serif;
                font-size: 1.125rem;
                font-weight: 600;

                .nav-category:first-child {
                    margin-top: 0;
                }

                .nav-category {
                    font-size: .75rem;
                    letter-spacing: .15rem;
                    background-image: linear-gradient(.25turn, var(--theme-text-third), var(--theme-text-fourth));
                    background-clip: text;
                    color: transparent;
                    font-weight: 800;
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
                    color: var(--theme-color-black);
                    background: var(--theme-color-accent);
                    border-radius: .4em;

                    transition: 50ms ease-in-out;
                }
            }
        }

        .settings-container {
            .container {
                display: flex;
                justify-content: center;
                align-content: center;

                width: 58rem;
                height: fit-content;
                max-height: 70vh !important;
                overflow-x: hidden;
                overflow-y: scroll;
                overflow: auto;
                scrollbar-gutter: stable;
                scrollbar-width: thin;
                scrollbar-color: var(--theme-color-accent) transparent;
                min-height: 18rem;
                border: var(--theme-border-width) solid var(--theme-border-container);
                border-radius: var(--theme-border-radius);

                background: var(--theme-background-container);

                margin-left: .35rem;
                padding: 3rem;

                .save-settings-div {
                    margin-top: 1.5rem;

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

                .setting-item:first-child {
                    padding-top: 0;
                }

                .setting-item {
                    color: var(--theme-text);
                    padding: .75rem 0;

                    .option {
                        transition: var(--theme-transition-out);

                        h1 {
                            display: flex;
                            flex-flow: row nowrap;
                            align-items: center;

                            font-family: 'FunnelDisplay', sans-serif;
                            font-size: 1.2rem;
                            font-weight: 700;
                            text-wrap: nowrap;

                            margin-bottom: .25rem;

                            width: 5.5rem;

                            pointer-events: none;
                            user-select: none;
                        }

                        h3 {
                            max-width: 80%;
                            margin-top: .5rem;

                            font-family: 'FunnelSans', sans-serif;
                            font-size: .9rem;
                            text-wrap-style: pretty;
                            color: var(--theme-text-secondary);
                        }

                        input, textarea {
                            width: 100%;

                            background: var(--theme-background-input);
                            border-radius: var(--theme-border-radius);
                            border: var(--theme-border-width) solid var(--theme-border-input);

                            font-size: 1.05rem;
                            font-weight: 600;
                            caret-color: var(--theme-text);

                            user-select: none;
                            transition: border-color var(--theme-transition-out);
                        }

                        textarea {
                            min-height: 6rem;
                            height: fit-content;
                            max-height: 22rem;

                            resize: none;
                        }

                        input:focus, textarea:focus {
                            border-color: var(--theme-border-input-focus);
                            user-select: text;
                            transition: border-color var(--theme-transition-in);
                        }
                    }

                    .option.readonly {
                        transition: var(--theme-transition-out);

                        .readonly-container {
                            display: flex;
                            flex-flow: row nowrap;
                            align-items: center;

                            width: 100%;

                            background: var(--theme-background-input);
                            border-radius: var(--theme-border-radius);
                            border: var(--theme-border-width) solid var(--theme-border-input);

                            font-size: 1.05rem;
                            font-weight: 600;
                            color: var(--theme-text-third);

                            padding: .5rem 1rem .5rem .5rem;

                            transition: var(--theme-transition-out);

                            svg {
                                margin-right: .25rem;

                                height: 1.25rem;
                                width: 1.25rem;
                            }
                        }

                        .readonly-container:hover, .readonly-container:focus {
                            border-color: var(--theme-border-input-focus);
                            color: var(--theme-text-secondary);
                            transition: border-color var(--theme-transition-in);
                        }
                    }

                    .option.toggle {
                        h1 {
                            padding-left: 0;
                        }

                        h3 {
                            margin-top: 0;
                        }

                        .top-section {
                            display: flex;
                            flex-flow: row nowrap;
                            justify-content: space-between;
                            align-items: center;

                            .toggle-container {
                                display: flex;
                                align-items: center;
                                justify-content: center;

                                width: 4rem;
                                height: 2rem;

                                background: var(--theme-background-input);
                                border-radius: 1rem;
                                border-style: solid;
                                border-width: var(--theme-border-width);

                                border-color: var(--theme-border-input);

                                cursor: pointer;

                                transition: background 150ms ease;

                                #toggle-slider {
                                    height: 1.4rem;
                                    width: 1.4rem;

                                    transform: translateX(-.925rem);

                                    background: var(--theme-color-white);
                                    border-radius: 100%;

                                    transition: 100ms;
                                    transition-timing-function: cubic-bezier(0.57, 0.1, 0.25, 1.5) !important;
                                }
                            }

                            .toggle-container.on {
                                background: var(--theme-color-accent) !important;
                                border-color: oklch(0.676 0.173 130.222) !important;
                                filter: drop-shadow(0 0 .4rem rgba(from var(--theme-color-accent) r g b / 15%));

                                #toggle-slider {
                                    transform: translateX(.925rem);
                                    filter: drop-shadow(0 0 .6rem rgba(0, 0, 0, 0.4));
                                }
                            }
                        }
                    }

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
                                scrollbar-color: var(--theme-color-accent) transparent;
                                resize: none;
                            }
                        }
                    }
                }
            }

            .version-tag {
                margin-top: .5rem;
                margin-left: 1rem;

                color: var(--theme-text-third);
                font-family: 'JetBrains Mono', sans-serif;
                font-weight: 700;
                font-size: .75rem;

                opacity: .25;

                user-select: text;
                cursor: default;
            }
        }
    }
</style>