<script lang="ts">
    import type {User} from "$lib/server/db/schema";
    import {getContext, onMount} from "svelte";
    import {accountSettings} from "./data.remote";
    import {error} from "@sveltejs/kit";

    let user: User | undefined = $state();

    let currentSettingsPage = $state('general');

    let userUuid = $state('Loading')
    let settingEmail = $state('Loading');
    let savedEmail = $state('Loading');
    let settingUsername = $state('Loading');
    let savedUsername = $state('Loading');

    onMount(() => {
        user = getContext('user');
        if (!user) error(500, 'Failed to load user.');

        userUuid = user.uuid;
        settingEmail = user.email;
        savedEmail = settingEmail;
        settingUsername = user.username;
        savedUsername = settingUsername;
    })

    let hasUnsavedChanges: boolean = $derived(settingEmail!==savedEmail||settingUsername!==savedUsername);
</script>

<section class="inventory-settings-page">
    <div class="sidebar">
        <nav class="inventory-settings-nav">
            <p class="nav-category">ACCOUNT</p>
            <button class="nav-link {currentSettingsPage==='general'?'selected':''}" onclick="{() => currentSettingsPage = 'general'}">General</button>
            <button class="nav-link {currentSettingsPage==='account-privacy'?'selected':''}" onclick="{() => currentSettingsPage = 'account-privacy'}">Privacy</button>
            <p class="nav-category">APPLICATION</p>
            <button class="nav-link {currentSettingsPage==='inventories'?'selected':''}" onclick="{() => currentSettingsPage = 'inventories'}">Inventories</button>
            <button class="nav-link {currentSettingsPage==='privacy'?'selected':''}" onclick="{() => currentSettingsPage = 'privacy'}">Privacy</button>
            <button class="nav-link {currentSettingsPage==='accessibility'?'selected':''}" onclick="{() => currentSettingsPage = 'accessibility'}">Accessbility</button>
            <p class="nav-category">ADMINISTRATION</p>
            <button class="nav-link {currentSettingsPage==='accounts'?'selected':''}" onclick="{() => currentSettingsPage = 'accounts'}">Accounts</button>
        </nav>
    </div>
    <div class="container">
        {#if currentSettingsPage === 'general'}
            <div class="setting-item">
                <form {...accountSettings} id="general-settings-form">
                    <div class="option text">
                        <h1>USERNAME</h1>
                        <input {...accountSettings.fields.username.as('text')} bind:value={settingUsername} name="name" id="name" placeholder="Inventory Name..." spellcheck="false"
                               data-protonpass-ignore="true" data-lpignore="true" data-1p-ignore data-bwignore>
                    </div>
                    <div class="option textarea">
                        <h1>EMAIL</h1>
                        <input {...accountSettings.fields.email.as('text')} bind:value={settingEmail} name="name" id="name" placeholder="Inventory Name..." spellcheck="false"
                               data-protonpass-ignore="true" data-lpignore="true" data-1p-ignore data-bwignore>
                    </div>
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
                </form>
            </div>
        {/if}
        <p class="uuid" style="position:absolute;transform:translateY(2.25rem);color:var(--theme-text-third);font-family:'JetBrains Mono', sans-serif;font-weight:700;opacity:.25;font-size:.75rem;user-select:text;cursor:default;">{user?.uuid ?? 'Loading...'}<br/>
        Version: 0.0.1-ALPHA</p>
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

        input {
            width: 100%;

            background: var(--theme-background-input);
            border-radius: var(--theme-border-radius);
            border: var(--theme-border-width) solid var(--theme-border-input);

            font-size: 1.05rem;
            font-weight: 600;
            caret-shape: underscore;
            caret-color: var(--theme-text);

            user-select: none;
            transition: var(--theme-transition-out);
        }

        input::selection {
            color: #FFFFF2;
            background: var(--theme-text-accent);
        }

        input:focus {
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
        input:hover,input:focus {
            color: var(--theme-text-secondary);
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
            width: 12rem;
            height: fit-content;
            min-height: 8rem;
            border: var(--theme-border-width) solid var(--theme-border-container);
            border-radius: var(--theme-border-radius);
            padding: 1rem 1.5rem;

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
                    background: var(--theme-text-accent);
                    border-radius: .4em;

                    transition: 50ms ease-in-out;
                }
            }
        }

        .container {
            width: 58rem;
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