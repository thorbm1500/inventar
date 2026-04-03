<script lang="ts">
    import Logs from "$lib/components/settings/Logs.svelte";
    import {generateNewRegistrationToken} from "../../data.remote";
    import {getContext, onDestroy, onMount} from "svelte";
    import {page} from "$app/state";
    import type {ApplicationSettings} from "$lib/server/internal/settings";
    import {capitalizeFirstLetter, ignorePasswordManagers} from "$lib/util/utilities";
    import type {User} from "$lib/server/db/interfaces";
    import {ContextHandler} from "$lib/util/ContextHandler.svelte";
    import type {ApplicationLocale} from "$lib/server/internal/locales";

    let {data} = $props();

    let locale: ApplicationLocale = $derived(ContextHandler.getLocale());
    const user: User = $derived(ContextHandler.getUser());

    let currentPageTitle: string = $state('');
    const updatePageTitle: Function = getContext('set_page_title') as Function;

    // svelte-ignore state_referenced_locally
    let applicationSettings: ApplicationSettings = $state(data.settings);
    // svelte-ignore state_referenced_locally
    let savedSettings: ApplicationSettings = data.settings;

    const currentView = $state({
        category: 'general',
        subcategory: 'basics'
    });

    let isRegenerating: boolean = $derived(applicationSettings.security.general.registration_token === 'Regenerating....');
    let hasUnsavedChanges: boolean = $derived(JSON.stringify(applicationSettings) !== JSON.stringify(savedSettings));

    if (page.params.category) currentView.category = page.params.category;
    if (page.params.subcategory) currentView.subcategory = page.params.subcategory;

    function updateView(category?: string, subcategory?: string): void {
        if (category) currentView.category = category;
        if (subcategory) {
            currentView.subcategory = subcategory;
            if (currentPageTitle !== subcategory) {
                currentPageTitle = subcategory;
                updatePageTitle(capitalizeFirstLetter(subcategory));
            }
        }

        window?.history.replaceState(null, currentView.category, `/settings/${currentView.category}/${currentView.subcategory}`);
        applicationSettings = savedSettings;
    }

    updatePageTitle(capitalizeFirstLetter($state.eager(currentView.subcategory)));

    function isViewing(category: string, subcategory: string): boolean {
        return currentView.category === category && currentView.subcategory === subcategory;
    }

    onMount(() => {
        updateView();
        updatePageTitle(capitalizeFirstLetter(currentView.subcategory));
        currentPageTitle = currentView.subcategory;
        const resetPageInfo: Function | undefined = getContext('reset_page_info');
        if (resetPageInfo) onDestroy(() => resetPageInfo());
    });
</script>

<section class="inventory-settings-page">
    <div class="sidebar">
        <nav class="inventory-settings-nav">
            <p class="nav-category">{locale.settings.general.title}</p>
            <button class="nav-link {isViewing('general','basics') ?'selected':''}" onclick="{() => updateView('general','basics')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065"/>
                    <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/>
                </svg>
                {locale.settings.general.basics.title}
            </button>
            <button class="nav-link {isViewing('general','mail') ?'selected':''}" onclick="{() => updateView('general','mail')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10"/>
                    <path d="M3 7l9 6l9 -6"/>
                </svg>
                {locale.settings.general.mail.title}
            </button>
            <p class="nav-category">{locale.settings.security.title}</p>
            <button class="nav-link {isViewing('security','general') ?'selected':''}" onclick="{() => updateView('security','general')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"/>
                </svg>
                {locale.settings.security.general.title}
            </button>
            <button class="nav-link {isViewing('security','accounts') ?'selected':''}" onclick="{() => updateView('security','accounts')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M10 13a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/>
                    <path d="M8 21v-1a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v1"/>
                    <path d="M15 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/>
                    <path d="M17 10h2a2 2 0 0 1 2 2v1"/>
                    <path d="M5 5a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/>
                    <path d="M3 13v-1a2 2 0 0 1 2 -2h2"/>
                </svg>
                {locale.settings.security.accounts.title}
            </button>
            <button class="nav-link {isViewing('security','privacy') ?'selected':''}" onclick="{() => updateView('security','privacy')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M3 11h18"/>
                    <path d="M5 11v-4a3 3 0 0 1 3 -3h8a3 3 0 0 1 3 3v4"/>
                    <path d="M4 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
                    <path d="M14 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
                    <path d="M10 17h4"/>
                </svg>
                {locale.settings.security.privacy.title}
            </button>
            <button class="nav-link {isViewing('security','api') ?'selected':''}" onclick="{() => updateView('security','api')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M12 15h-6.5a2.5 2.5 0 1 1 0 -5h.5"/>
                    <path d="M15 12v6.5a2.5 2.5 0 1 1 -5 0v-.5"/>
                    <path d="M12 9h6.5a2.5 2.5 0 1 1 0 5h-.5"/>
                    <path d="M9 12v-6.5a2.5 2.5 0 0 1 5 0v.5"/>
                </svg>
                {locale.settings.security.api.title}
            </button>
            <p class="nav-category">{locale.settings.system.title}</p>
            <button class="nav-link {isViewing('system','audit') ?'selected':''}" onclick="{() => updateView('system','audit')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M11 15a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/>
                    <path d="M18.5 18.5l2.5 2.5"/>
                    <path d="M4 6h16"/>
                    <path d="M4 12h4"/>
                    <path d="M4 18h4"/>
                </svg>
                {locale.settings.system.audit_logs.title}
            </button>
            <button class="nav-link {isViewing('system','logs') ?'selected':''}" onclick="{() => updateView('system','logs')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M7 5.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667l0 -8.666"/>
                    <path d="M4.012 7.26a2.005 2.005 0 0 0 -1.012 1.737v10c0 1.1 .9 2 2 2h10c.75 0 1.158 -.385 1.5 -1"/>
                    <path d="M11 7h5"/>
                    <path d="M11 10h6"/>
                    <path d="M11 13h3"/>
                </svg>
                {locale.settings.system.logs.title}
            </button>
            <button class="nav-link {isViewing('system','tasks') ?'selected':''}" onclick="{() => updateView('system','tasks')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M12 8l0 4l2 2"/>
                    <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/>
                </svg>
                {locale.settings.system.tasks.title}
            </button>
            <p class="nav-category">{locale.settings.other.title}</p>
            <button class="nav-link {isViewing('other','feedback') ?'selected':''}" onclick="{() => updateView('other','feedback')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M8 9h8"/>
                    <path d="M8 13h6"/>
                    <path d="M14 18h-1l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v4.5"/>
                    <path d="M19 22v.01"/>
                    <path d="M19 19a2.003 2.003 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483"/>
                </svg>
                {locale.settings.other.feedback.title}
            </button>
            <button class="nav-link {isViewing('other','faq') ?'selected':''}" onclick="{() => updateView('other','faq')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M19 4v16h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12"/>
                    <path d="M19 16h-12a2 2 0 0 0 -2 2"/>
                    <path d="M9 8h6"/>
                </svg>
                {locale.settings.other.faq.title}
            </button>
            <button class="nav-link {isViewing('other','about') ?'selected':''}" onclick="{() => updateView('other','about')}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M6 6a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2l0 -4"/>
                    <path d="M12 2v2"/>
                    <path d="M9 12v9"/>
                    <path d="M15 12v9"/>
                    <path d="M5 16l4 -2"/>
                    <path d="M15 14l4 2"/>
                    <path d="M9 18h6"/>
                    <path d="M10 8v.01"/>
                    <path d="M14 8v.01"/>
                </svg>
                {locale.settings.other.about.title}
            </button>
        </nav>
    </div>
    <div class="settings-container">
        {#if currentView.category === 'general' && currentView.subcategory === 'basics' }
            <div class="settings-category-header">
                <h1 class="header-title">{locale.settings.general.basics.title}</h1>
            </div>
            <div class="setting-item">
                <div class="option text readonly">
                    <div class="top-section">
                        <h1>{locale.settings.general.basics.application_id}</h1>
                        <div class="readonly-container select-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                            </svg>
                            {applicationSettings.general.basics.application_id}
                        </div>
                    </div>
                    <div class="bottom-section">
                        <h3>{locale.settings.general.basics.application_id_description}.
                            <button onclick="{() => updateView('security','privacy')}">{locale.generics.see} {locale.settings.security.title}#{locale.settings.security.privacy.title}</button>
                        </h3>
                    </div>
                </div>
            </div>
            <div class="setting-item">
                <div class="option text readonly">
                    <div class="top-section">
                        <h1>{locale.settings.general.basics.data_directory}</h1>
                        <div class="readonly-container select-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                            </svg>
                            /etc/inventar/data
                        </div>
                    </div>
                    <div class="bottom-section">
                        <!--todo <h3>SUBTITLE</h3>-->
                    </div>
                </div>
            </div>
            <div class="setting-item">
                <div class="option text readonly">
                    <div class="top-section">
                        <h1>{locale.settings.general.basics.logs_directory}</h1>
                        <div class="readonly-container select-all">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                            </svg>
                            /etc/inventar/logs
                        </div>
                    </div>
                    <div class="bottom-section">
                        <!--todo <h3>SUBTITLE</h3>-->
                    </div>
                </div>
            </div>
            <div class="setting-item">
                <div class="option text">
                    <div class="top-section">
                        <h1>Log Level</h1>
                        <select id="log_level" name="log_level" size="1" bind:value={applicationSettings.general.basics.log_level}>
                            <option value="debug">
                                <!--suppress HtmlUnknownTag -->
                                <div class="custom-option">
                                    <span>Debug</span>
                                </div>
                            </option>
                            <option value="info">Info</option>
                            <option value="warn">Warning</option>
                            <option value="error">Error</option>
                        </select>
                    </div>
                    <div class="bottom-section">
                        <!--todo <h3>SUBTITLE</h3>-->
                    </div>
                </div>
            </div>
        {/if}
        {#if currentView.category === 'general' && currentView.subcategory === 'mail' }
            <div class="settings-category-header">
                <h1 class="header-title">{locale.settings.general.mail.title}</h1>
                <h3 class="header-subtitle">{locale.settings.general.mail.subtitle}
                    <a href="https://resend.com/home" target="_blank" rel="external">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor"
                                  d="M14.679 0c4.648 0 7.413 2.765 7.413 6.434s-2.765 6.434-7.413 6.434H12.33L24 24h-8.245l-8.88-8.44c-.636-.588-.93-1.273-.93-1.86c0-.831.587-1.565 1.713-1.883l4.574-1.224c1.737-.465 2.936-1.81 2.936-3.572c0-2.153-1.761-3.4-3.939-3.4H0V0z"/>
                        </svg>
                        Resend</a>
                </h3>
            </div>
            <div class="setting-item">
                <div class="option text">
                    <div class="top-section">
                        <h1>{locale.settings.general.mail.host}</h1>
                        <input name="mail_host" id="mail_host" placeholder="smtp.inventar.dev" bind:value={applicationSettings.general.mail.host} use:ignorePasswordManagers spellcheck="false">
                    </div>
                    <div class="bottom-section">
                        <!--todo <h3>SUBTITLE</h3>-->
                    </div>
                </div>
            </div>
            <div class="setting-item">
                <div class="option text">
                    <div class="top-section">
                        <h1>{locale.settings.general.mail.port}</h1>
                        <input name="mail_port" id="mail_port" placeholder="587"
                               value="{applicationSettings.general.mail.port}" use:ignorePasswordManagers spellcheck="false">
                    </div>
                    <div class="bottom-section">
                        <h3>{locale.settings.general.mail.subtitle}.</h3>
                    </div>
                </div>
            </div>
            <div class="setting-item">
                <div class="option text">
                    <div class="top-section">
                        <h1>{locale.settings.general.mail.user}</h1>
                        <input name="mail_user" id="mail_user" placeholder="inventar"
                               value="{applicationSettings.general.mail.user}" use:ignorePasswordManagers spellcheck="false">
                    </div>
                    <div class="bottom-section">
                        <!--todo <h3>SUBTITLE</h3>-->
                    </div>
                </div>
            </div>
            <div class="setting-item">
                <div class="option text">
                    <div class="top-section">
                        <h1>{locale.settings.general.mail.password}</h1>
                        <input type="password" name="mail_password" id="mail_password" placeholder="Enter Password..."
                               value="{applicationSettings.general.mail.password}" use:ignorePasswordManagers spellcheck="false">
                    </div>
                    <div class="bottom-section">
                        <!--todo <h3>SUBTITLE</h3>-->
                    </div>
                </div>
            </div>
            <div class="setting-item">
                <div class="option text">
                    <div class="top-section">
                        <h1>{locale.settings.general.mail.sender_mail}</h1>
                        <input name="mail_sender_mail" id="mail_sender_mail" placeholder="inventar@prodzeus.dev"
                               value="{applicationSettings.general.mail.sender_mail}" use:ignorePasswordManagers spellcheck="false">
                    </div>
                    <div class="bottom-section">
                        <!--todo <h3>SUBTITLE</h3>-->
                    </div>
                </div>
            </div>
            <div class="setting-item">
                <div class="option text">
                    <div class="top-section">
                        <h1>{locale.settings.general.mail.sender_name}</h1>
                        <input name="mail_sender_name" id="mail_sender_name" placeholder="zeus"
                               value="{applicationSettings.general.mail.sender_name}" use:ignorePasswordManagers spellcheck="false">
                    </div>
                    <div class="bottom-section">
                        <h3>{locale.generics.optional}</h3>
                    </div>
                </div>
            </div>
        {/if}
        {#if currentView.category === 'security' && currentView.subcategory === 'general' }
            <div class="settings-category-header">
                <h1 class="header-title">{locale.settings.security.general.title}</h1>
            </div>
            <div class="setting-item">
                <div class="option toggle">
                    <div class="top-section">
                        <h1>{locale.settings.security.general.allow_registration}</h1>
                        <label class="toggle-container {applicationSettings.security.general.allow_registration ? 'on' : ''}">
                            <!--suppress HtmlUnknownTag -->
                            <div id="toggle-slider"></div>
                            <input type="checkbox" class="toggle-button" bind:checked={applicationSettings.security.general.allow_registration} hidden>
                        </label>
                    </div>
                    <div class="bottom-section">
                        <h3>{locale.settings.security.general.allow_registration_description}.</h3>
                    </div>
                </div>
            </div>
            <div class="setting-item">
                <div class="option toggle">
                    <div class="top-section">
                        <h1>{locale.settings.security.general.require_registration_token}</h1>
                        <label class="toggle-container {applicationSettings.security.general.require_token ? 'on' : ''}">
                            <!--suppress HtmlUnknownTag -->
                            <div id="toggle-slider"></div>
                            <input type="checkbox" class="toggle-button" bind:checked={applicationSettings.security.general.require_token} hidden>
                        </label>
                    </div>
                    <div class="bottom-section">
                        <h3>{locale.settings.security.general.require_registration_token_description}</h3>
                    </div>
                </div>
            </div>
            <div class="setting-item">
                <div class="option text readonly">
                    <div class="top-section">
                        <h1>{locale.settings.security.general.registration_token}</h1>
                        <div class="readonly-container token select-all">
                            <div style="display:flex;flex-flow:row nowrap;align-items:center;justify-content:flex-start;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                     stroke-linejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0"/>
                                    <path d="M15 9h.01"/>
                                </svg>
                                {applicationSettings.security.general.registration_token}
                            </div>
                            <button title="Regenerate" onclick="{async () => {
                                    if (isRegenerating) return;
                                    applicationSettings.security.general.registration_token = locale.settings.security.general.registration_token_regeneration;
                                    applicationSettings.security.general.registration_token = await generateNewRegistrationToken(user.uuid);
                                }}" class="regenerate-registration-token">
                                {#if isRegenerating}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                        <rect width="10" height="10" x="1" y="1" fill="currentColor" rx="1">
                                            <animate id="SVG7JagGz2Y" fill="freeze" attributeName="x" begin="0;SVGgDT19bUV.end" dur="0.15s" values="1;13"/>
                                            <animate id="SVGpS1BddYk" fill="freeze" attributeName="y" begin="SVGc7yq8dne.end" dur="0.15s" values="1;13"/>
                                            <animate id="SVGboa7EdFl" fill="freeze" attributeName="x" begin="SVG0ZX9C6Fa.end" dur="0.15s" values="13;1"/>
                                            <animate id="SVG6rrusL2C" fill="freeze" attributeName="y" begin="SVGTOnnO5Dr.end" dur="0.15s" values="13;1"/>
                                        </rect>
                                        <rect width="10" height="10" x="1" y="13" fill="currentColor" rx="1">
                                            <animate id="SVGc7yq8dne" fill="freeze" attributeName="y" begin="SVG7JagGz2Y.end" dur="0.15s" values="13;1"/>
                                            <animate id="SVG0ZX9C6Fa" fill="freeze" attributeName="x" begin="SVGpS1BddYk.end" dur="0.15s" values="1;13"/>
                                            <animate id="SVGTOnnO5Dr" fill="freeze" attributeName="y" begin="SVGboa7EdFl.end" dur="0.15s" values="1;13"/>
                                            <animate id="SVGgDT19bUV" fill="freeze" attributeName="x" begin="SVG6rrusL2C.end" dur="0.15s" values="13;1"/>
                                        </rect>
                                    </svg>
                                {:else}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                         stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"/>
                                        <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>
                                        <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>
                                    </svg>
                                {/if}
                            </button>
                        </div>
                    </div>
                    <div class="bottom-section">
                        <h3>{locale.settings.security.general.registration_token_description}</h3>
                    </div>
                </div>
            </div>
        {/if}
        {#if currentView.category === 'security' && currentView.subcategory === 'accounts' }
            <div class="settings-category-header">
                <h1 class="header-title">{locale.settings.security.accounts.title}</h1>
                <h3 class="header-subtitle">{locale.generics.coming_soon}.</h3>
            </div>
        {/if}
        {#if currentView.category === 'security' && currentView.subcategory === 'privacy' }
            <div class="settings-category-header">
                <h1 class="header-title">{locale.settings.security.privacy.title}</h1>
                <div class="header-subtitle">
                    <span>{locale.settings.security.privacy.subtitle_a}.</span>
                    <span>{locale.settings.security.privacy.subtitle_b}</span>
                    <button onclick="{() => updateView('other','faq')}">{locale.generics.see} {locale.settings.other.title}#{locale.settings.other.faq.title}</button>
                    <span><br>{locale.settings.security.privacy.subtitle_c}.</span>
                    <!--todo Get stats from database-->
                </div>
            </div>
            <div class="setting-item">
                <div class="option toggle">
                    <div class="top-section">
                        <h1>{locale.settings.security.privacy.enable_telemetry}</h1>
                        <label class="toggle-container {applicationSettings.security.privacy.telemetry_enable ? 'on' : ''}">
                            <!--suppress HtmlUnknownTag -->
                            <div id="toggle-slider"></div>
                            <input type="checkbox" class="toggle-button" bind:checked={applicationSettings.security.privacy.telemetry_enable} hidden>
                        </label>
                    </div>
                    <div class="bottom-section">
                        <h3>{locale.settings.security.privacy.enable_telemetry_description}.</h3>
                    </div>
                </div>
            </div>
            <div class="setting-item">
                <div class="option toggle">
                    <div class="top-section">
                        <h1>{locale.settings.security.privacy.instance_identifier}</h1>
                        <label class="toggle-container on disable">
                            <!--suppress HtmlUnknownTag -->
                            <div id="toggle-slider"></div>
                            <input type="checkbox" class="toggle-button" checked={true} disabled hidden>
                        </label>
                    </div>
                    <div class="bottom-section">
                        <h3>{locale.settings.security.privacy.instance_identifier_description_a}.</h3>
                        <h3><i>{locale.settings.security.privacy.instance_identifier_description_b}.</i></h3>
                    </div>
                </div>
            </div>
            <h4>{locale.settings.security.privacy.telemetry_options}</h4>
            <div class="setting-item">
                <div class="option toggle">
                    <div class="top-section">
                        <h1>{locale.settings.security.privacy.telemetry_options_country}</h1>
                        <label class="toggle-container {applicationSettings.security.privacy.telemetry_country ? 'on' : ''} {applicationSettings.security.privacy.telemetry_enable ? '' : 'disable'}">
                            <!--suppress HtmlUnknownTag -->
                            <div id="toggle-slider"></div>
                            <input type="checkbox" class="toggle-button" bind:checked={applicationSettings.security.privacy.telemetry_country}
                                   disabled={!applicationSettings.security.privacy.telemetry_enable} hidden>
                        </label>
                    </div>
                </div>
            </div>
            <div class="setting-item">
                <div class="option toggle">
                    <div class="top-section">
                        <h1>{locale.settings.security.privacy.telemetry_options_region}</h1>
                        <label class="toggle-container {applicationSettings.security.privacy.telemetry_region ? 'on' : ''} {applicationSettings.security.privacy.telemetry_enable ? '' : 'disable'}">
                            <!--suppress HtmlUnknownTag -->
                            <div id="toggle-slider"></div>
                            <input type="checkbox" class="toggle-button" bind:checked={applicationSettings.security.privacy.telemetry_region}
                                   disabled={!applicationSettings.security.privacy.telemetry_enable} hidden>
                        </label>
                    </div>
                </div>
            </div>
            <div class="setting-item">
                <div class="option toggle {{disable: !applicationSettings.security.privacy.telemetry_enable}}">
                    <div class="top-section">
                        <h1>{locale.settings.security.privacy.telemetry_options_inventories}</h1>
                        <label class="toggle-container {applicationSettings.security.privacy.telemetry_inventories ? 'on' : ''} {applicationSettings.security.privacy.telemetry_enable ? '' : 'disable'}">
                            <!--suppress HtmlUnknownTag -->
                            <div id="toggle-slider"></div>
                            <input type="checkbox" class="toggle-button" bind:checked={applicationSettings.security.privacy.telemetry_inventories}
                                   disabled={!applicationSettings.security.privacy.telemetry_enable} hidden>
                        </label>
                    </div>
                </div>
            </div>
            <div class="setting-item">
                <div class="option toggle">
                    <div class="top-section">
                        <h1>{locale.settings.security.privacy.telemetry_options_unique_items}</h1>
                        <label class="toggle-container {applicationSettings.security.privacy.telemetry_unique_items ? 'on' : ''} {applicationSettings.security.privacy.telemetry_enable ? '' : 'disable'}">
                            <!--suppress HtmlUnknownTag -->
                            <div id="toggle-slider"></div>
                            <input type="checkbox" class="toggle-button" bind:checked={applicationSettings.security.privacy.telemetry_unique_items}
                                   disabled={!applicationSettings.security.privacy.telemetry_enable} hidden>
                        </label>
                    </div>
                </div>
            </div>
            <div class="setting-item">
                <div class="option toggle">
                    <div class="top-section">
                        <h1>{locale.settings.security.privacy.telemetry_options_total_items}</h1>
                        <label class="toggle-container {applicationSettings.security.privacy.telemetry_total_items ? 'on' : ''} {applicationSettings.security.privacy.telemetry_enable ? '' : 'disable'}">
                            <!--suppress HtmlUnknownTag -->
                            <div id="toggle-slider"></div>
                            <input type="checkbox" class="toggle-button" bind:checked={applicationSettings.security.privacy.telemetry_total_items}
                                   disabled={!applicationSettings.security.privacy.telemetry_enable} hidden>
                        </label>
                    </div>
                </div>
            </div>
        {/if}
        {#if currentView.category === 'security' && currentView.subcategory === 'api' }
            <div class="settings-category-header">
                <h1 class="header-title">{locale.settings.security.api.title}</h1>
                <h3 class="header-subtitle">{locale.generics.coming_soon}.</h3>
            </div>
        {/if}
        {#if currentView.category === 'system' && currentView.subcategory === 'audit' }
            <div class="settings-category-header">
                <h1 class="header-title">{locale.settings.system.audit_logs.title}</h1>
                <h3 class="header-subtitle">{locale.generics.coming_soon}.</h3>
            </div>
        {/if}
        {#if currentView.category === 'system' && currentView.subcategory === 'logs' }
            <div class="settings-category-header">
                <h1 class="header-title">Logs</h1>
            </div>
            <Logs/>
        {/if}
        {#if currentView.category === 'system' && currentView.subcategory === 'tasks' }
            <div class="settings-category-header">
                <h1 class="header-title">{locale.settings.system.logs.title}</h1>
                <h3 class="header-subtitle">{locale.generics.coming_soon}.</h3>
            </div>
        {/if}
        {#if currentView.category === 'other' && currentView.subcategory === 'feedback' }
            <div class="settings-category-header">
                <h1 class="header-title">{locale.settings.other.feedback.title}</h1>
                <h3 class="header-subtitle">{locale.generics.coming_soon}.</h3>
            </div>
        {/if}
        {#if currentView.category === 'other' && currentView.subcategory === 'faq' }
            <div class="settings-category-header">
                <h1 class="header-title">{locale.settings.other.faq.title}</h1>
                <h3 class="header-subtitle">{locale.generics.coming_soon}.</h3>
            </div>
        {/if}
        {#if currentView.category === 'other' && currentView.subcategory === 'about' }
            <div class="settings-category-header">
                <h1 class="header-title">{locale.settings.other.about.title}</h1>
                <h3 class="header-subtitle">{locale.generics.coming_soon}.</h3>
            </div>
        {/if}
        {#if !['audit', 'logs', 'tasks', 'accounts', 'api', 'feedback', 'faq', 'about'].includes(currentView.subcategory)}
            <div class="save-settings-div" style="display:flex;flex-flow:row nowrap;align-items:center;">
                <button type="{hasUnsavedChanges?'submit':'button'}" class="theme-button">{locale.generics.save}</button>
                {#if false}
                    <p class="form-submission-meta success">{locale.generics.changes_saved}.</p>
                {:else if false }
                    <p class="form-submission-meta saving">{locale.generics.saving_changes}</p>
                {:else if (hasUnsavedChanges) }
                    <p class="form-submission-meta unsaved">{locale.generics.unsaved_changes}.</p>
                {/if}
            </div>
        {/if}
        {#if currentView.category === 'security' && currentView.subcategory === 'privacy' }
            <!--todo - Implement logic-->
            <div class="setting-extra">
                <h4>{locale.settings.security.privacy.request_removal}</h4>
                <div class="description">
                    <span>{locale.settings.security.privacy.request_removal_description_a}.</span><br><br>
                    <span>{locale.settings.security.privacy.request_removal_description_b}.*</span>
                </div>
                <p class="footnote">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4V20M18 6L6 18M20 12H4M18 18L6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <i>{locale.settings.security.privacy.request_removal_limit}</i></p>
                <button class="theme-button">{locale.settings.security.privacy.request_removal_submit}</button>
            </div>
        {/if}
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
        align-items: flex-start;
        justify-content: center;

        height: 100vh;
        width: 100vw;

        box-sizing: border-box;
        overflow-y: scroll;
        overflow-x: hidden;
        overflow: auto;

        padding-top: 6rem;

        scrollbar-gutter: stable;
        scrollbar-width: thin;
        scrollbar-color: var(--theme-color-accent) transparent;

        .sidebar {
            width: 13rem;
            height: 39.5rem;
            padding: 1rem 1.5rem;
            margin-right: .35rem;

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
                    display: flex;
                    flex-flow: row nowrap;
                    align-items: center;
                    align-content: flex-start;
                    justify-content: flex-start;
                    gap: .25rem;

                    margin: .15rem 0 .15rem .5rem;
                    padding: .15rem .5rem;

                    border: .125rem solid transparent;
                    border-radius: var(--theme-border-radius);

                    cursor: pointer;
                    user-select: none;

                    transition: 200ms ease-in-out,
                    border-color 50ms linear;
                }

                .nav-link:hover {
                    border-color: rgba(from var(--theme-color-accent) r g b / .5);

                    transition: 25ms linear;
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
            display: flex;
            flex-flow: column nowrap;
            justify-content: flex-start;
            align-content: center;

            width: 58rem;

            height: fit-content;
            overflow: visible;

            margin-left: .35rem;
            padding: 2rem 3rem;

            h4 {
                font-family: 'FunnelDisplay', sans-serif;
                font-size: 1.5rem;
                font-weight: 700;

                color: var(--theme-text);

                margin-bottom: 1rem;
            }

            .setting-item .option h3, .settings-category-header .header-subtitle {
                button {
                    font-weight: bold;

                    cursor: pointer;
                }

                button:hover {
                    color: var(--theme-text-accent);
                }
            }

            .settings-category-header {
                margin-bottom: 1rem;

                .header-title {
                    font-family: 'FunnelDisplay', sans-serif;
                    font-size: 2rem;
                    font-weight: 800;
                    color: var(--theme-text);
                }

                .header-subtitle {
                    display: flex;
                    flex-flow: row wrap;
                    align-items: center;
                    align-content: flex-start;
                    justify-content: flex-start;
                    gap: .3rem;

                    font-family: 'FunnelSans', sans-serif;
                    font-size: 1.05rem;
                    font-weight: 550;

                    text-wrap-style: pretty;
                    white-space: preserve-breaks;

                    color: var(--theme-text-secondary);

                    user-select: none;

                    a {
                        display: flex;
                        flex-flow: row nowrap;
                        align-items: center;
                        gap: .3rem;

                        font-weight: 700;

                        svg {
                            height: 1rem;
                            width: 1rem;
                        }
                    }

                    a, a svg {
                        transition: var(--theme-transition-out);
                    }

                    a:hover, a:hover svg {
                        color: var(--theme-text);
                        transition: var(--theme-transition-in);
                    }
                }
            }

            .save-settings-div {
                margin: 1.25rem 0;

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
                width: 100%;
                margin-bottom: 1.25rem;

                .option {
                    transition: var(--theme-transition-out);

                    .top-section {
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

                        .readonly-container {
                            width: 100%;
                        }

                        input, textarea, select {
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

                        select {
                            user-select: none !important;

                            option:checked {
                                color: var(--theme-color-black);
                                background: var(--theme-color-accent);
                            }
                        }

                        > div {
                            &:is(:focus, :hover) {
                                background: oklch(from var(--theme-color-accent) l c h / 25%);
                                color: inherit;
                            }
                        }

                        input:focus, textarea:focus, select:focus {
                            border-color: var(--theme-border-input-focus);
                            user-select: text;
                            transition: border-color var(--theme-transition-in);
                        }
                    }

                    h3 {
                        max-width: 80%;
                        margin-top: .5rem;
                        margin-bottom: 0;

                        font-family: 'FunnelSans', sans-serif;
                        font-size: .9rem;
                        text-wrap-style: pretty;
                        color: var(--theme-text-secondary);
                    }
                }

                .option.readonly {
                    transition: var(--theme-transition-out);

                    .readonly-container.token {
                        justify-content: space-between;
                    }

                    .readonly-container {
                        display: flex;
                        flex-flow: row nowrap;
                        align-items: center;
                        justify-content: flex-start;

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

                        .regenerate-registration-token {
                            justify-self: flex-end !important;

                            cursor: pointer;

                            transition: var(--theme-transition-out);

                            svg {
                                position: relative;
                                margin-right: 0;
                                transform: translateX(.25rem);

                                height: 1.5rem;
                                width: 100%;
                            }
                        }

                        .regenerate-registration-token:hover {
                            color: var(--theme-color-accent);
                            transition: var(--theme-transition-in);
                        }
                    }

                    .readonly-container:hover, .readonly-container:focus {
                        border-color: var(--theme-border-input-focus);
                        color: var(--theme-text-secondary);
                        transition: border-color var(--theme-transition-in);
                    }

                    .readonly-container::selection {
                        backdrop-filter: blur(2px);
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

                        .toggle-container.disable {
                            filter: grayscale(1) brightness(.9);
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

            .setting-extra {
                h4 {
                    font-family: 'FunnelDisplay', sans-serif;
                    font-size: 1.5rem;
                    font-weight: 700;

                    color: var(--theme-text);

                    margin-bottom: .5rem;
                }

                span {
                    font-family: 'FunnelSans', sans-serif;
                    font-size: 1.05rem;
                    font-weight: 500;
                    text-wrap-style: pretty;
                    white-space: preserve-breaks;

                    color: var(--theme-text-secondary);
                }

                .footnote {
                    display: flex;
                    flex-flow: row nowrap;
                    font-family: 'FunnelSans', sans-serif;
                    font-size: .95rem;
                    font-weight: 500;
                    text-wrap-style: pretty;
                    white-space: preserve-breaks;

                    margin: .5rem 0;

                    color: var(--theme-text-third);

                    svg {
                        width: .875rem;
                        height: .875rem;
                    }
                }

                .theme-button {
                    border-color: oklch(0.648 0.238 25.371);
                    background: oklch(0.195 0.068 26.273);
                    color: oklch(97.1% 0.013 17.38);

                    margin: 1.25rem 0;
                }

                .theme-button:hover {
                    border-color: oklch(0.648 0.238 25.371);
                    background: oklch(25.8% 0.092 26.042);
                    color: var(--theme-color-white);
                }
            }
        }
    }
</style>