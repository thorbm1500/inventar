<script lang="ts">
import {accountSettings} from "../../routes/(app)/settings/data.remote";
import type {User} from "$lib/server/db/schema";
import {getContext, onMount} from "svelte";
import {error} from "@sveltejs/kit";

let { settings = $bindable() } = $props();

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
            <button class="nav-link {currentSettingsPage==='accessibility'?'selected':''}" onclick="{() => currentSettingsPage = 'accessibility'}">Accessibility</button>
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