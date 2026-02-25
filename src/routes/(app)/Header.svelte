<script lang="ts">
    import {page} from "$app/state";
    import {getContext, setContext} from 'svelte';
    import type {User} from "$lib/server/db/interfaces";
    import tippy, {animateFill} from "tippy.js";
    import {updateTheme} from "./data.remote";

    const pageInfo = {
        title: undefined
    }

    setContext('pageInfo', pageInfo);

    let user: User = $derived(getContext('user'));
    let isOnline = $state(true);
    let theme = $derived(user.preferred_theme);
    let sidebar = $state(false);

    function tooltip(node: HTMLAnchorElement) {
        const accountTooltipElement: HTMLElement | null = document.getElementById('account-tooltip');
        if (!accountTooltipElement) return;

        accountTooltipElement.style.display = 'flex';

        let tippyObj = tippy(node, {
            content: accountTooltipElement,
            theme: 'tooltip_theme',
            plugins: [animateFill],
            animateFill: true,
            inertia: true,
            interactive: true,
            interactiveDebounce: 50,
            allowHTML: true,
            duration: [75, 225],
            popperOptions: {
                strategy: 'fixed'
            },
        });

        return {
            destroy: () => {
                tippyObj.destroy();
            }
        }
    }

    setInterval(() => {
        isOnline = navigator.onLine
    }, 2000)
</script>
<section class="pill">
    <div class="header-logo">
        <a href="/" title="inventar header logo">
            <svg class="inventar-logo" width="1500" height="1500" viewBox="0 0 1500 1500">
                <rect x="1000" y="1000" width="500" height="500" style="fill:#0d0d0d;"/>
                <rect x="500" y="500" width="500" height="500" style="fill:#0d0d0d;"/>
                <rect width="500" height="500" style="fill:#0d0d0d;"/>
                <rect x="1000" width="500" height="500" style="fill:#0d0d0d; opacity:.5;"/>
                <rect y="500" width="500" height="500" style="fill:#0d0d0d; opacity:.75;"/>
                <rect x="500" y="1000" width="500" height="500" style="fill:#0d0d0d; opacity:.75;"/>
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                 class="chevron-down">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M6 9l6 6l6 -6"/>
            </svg>
        </a>
    </div>
    <div class="page-meta">
        {pageInfo.title ?? 'inventar'}
    </div>
</section>

<section class="sidebar-section {sidebar?'open':'closed'} visible md:invisible flex md:hidden">
    <div class="sidebar-links">
        <nav>
            <a aria-current={page.url.pathname === '/'} title="Home" href="/">Home</a>
            <a aria-current={page.url.pathname === '/browse'} title="Browse" href="/browse">Browse</a>
            <a aria-current={Boolean(user && user.primary_inventory && page.url.pathname === '/inventory/'+user.primary_inventory)} title="Browse" href="/inventory/{user?.primary_inventory ?? ''}">Inventory</a>
            <a aria-current={page.url.pathname === '/projects'} title="Projects" href="/projects">Projects</a>
            <a aria-current={page.url.pathname === `/account/${user.uuid}`} title="My Account" href="/account/{user.uuid}">My Account</a>
        </nav>
        <!-- todo - Add notifications -->
    </div>
    <div class="bottom-buttons">
        <button class="theme-switch-button" id="dark-light-mode-switcher" onclick={() => {
        user.preferred_theme = theme === 'dark' ? 'light' : 'dark';
        updateTheme({id: user.uuid, theme: user.preferred_theme});
    }} title="Switch Theme">
            {#if theme === 'dark'}
                <svg class="blue-hover size-6" style="overflow:visible;height:2.5rem;width:2.5rem;" fill="none" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>
                </svg>
            {:else}
                <svg class="blue-hover size-6" style="overflow:visible;height:2.425rem;width:2.425rem;" fill="none" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/>
                </svg>
            {/if}
        </button>
        <button class="red-hover logout-button" type="button" title="Logout" onclick="{() => window.location.href = '/logout'}">
            <svg style="overflow:visible;height:2.55rem;width:2.55rem;" fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="red-hover size-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"/>
            </svg>
        </button>
    </div>
</section>

<style>
    * {
        user-select: none !important;
    }

    .pill {
        position: absolute;
        top: 2rem;
        left: 2rem;

        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: space-between;

        width: fit-content;
        height: 2.5rem;
        padding: 1rem;

        background: var(--theme-background-header);

        border-radius: .75rem;
        border: var(--theme-border-width) solid var(--theme-border-header);

        z-index: 99999;

        .header-logo {
            margin-right: .75rem;

            a {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: center;
                gap: .25rem;

                .inventar-logo {
                    height: 1.5rem;
                    width: 1.5rem;
                    fill: var(--theme-text);
                }

                .chevron-down {
                    height: .9rem;
                    width: .9rem;
                    stroke-width: 3;
                }
            }
        }

        .page-meta {
            font-family: 'FunnelDisplay', sans-serif;
            font-size: 1.15rem;
            font-weight: 600;
        }
    }

    .sidebar-section {
        position: absolute;

        flex-flow: column nowrap;
        align-items: center;
        justify-content: space-between;

        height: var(--theme-max-page-height);
        width: 100vw;

        background: var(--theme-background-header);

        transition: var(--theme-transition-in);

        .bottom-buttons {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: center;
            gap: 1rem;

            button {
                margin-bottom: 1rem;
                stroke: var(--theme-text);
                color: var(--theme-text);

                cursor: pointer;

                transition-duration: 750ms;
            }

            button:active {
                stroke: var(--theme-text-accent);
                transition-duration: 0ms !important;
            }
        }

        .sidebar-links {
            display: flex;
            flex-flow: column nowrap;
            align-content: center;
            align-items: center;
            padding: 1rem 0;

            nav {
                display: flex;
                flex-flow: column nowrap;
                gap: .75rem;

                align-self: center;
                align-content: center;
                text-align: center;

                justify-content: center;

                color: var(--theme-text);

                a {
                    font-family: 'FunnelDisplay', serif;
                    font-variation-settings: "wght" 600;
                    font-size: 1.5rem;

                    transition-duration: 350ms;
                }

                a:hover {
                    color: var(--theme-text-accent);

                    transition: var(--theme-transition-in);
                }

                a[aria-current=true] {
                    color: var(--theme-text-accent);
                }
            }

            .header-icons {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;

                .header-icon:first-child {
                    margin-left: var(--icon-gap);
                }

                .header-icon {
                    display: flex;
                    margin-left: calc(var(--icon-gap) * .5);

                    img {
                        height: 1.45rem !important;
                        width: 1.45rem !important;
                        border-radius: 100%;
                        aspect-ratio: 1/1 !important;
                    }

                    svg {
                        cursor: pointer;
                        stroke-width: 1.75;
                        stroke: var(--theme-icon);

                        transition-duration: 125ms;
                    }

                    .blue-hover:hover {
                        stroke: var(--theme-text-accent);
                        stroke-width: 2;

                        transition: var(--theme-transition-in);
                    }
                }
            }
        }
    }

    .sidebar-section.open {

    }

    .sidebar-section.closed {
        transform: translateX(100vw);

        transition: var(--theme-transition-in);
    }

    .header-section {
        width: 100vw;

        height: var(--theme-height-header);

        padding-left: 15%;
        padding-right: 15%;

        align-content: center;
        justify-content: center;
        background: var(--theme-background-header);
        border-bottom: var(--theme-border-width) solid var(--theme-border-header);

        z-index: 99999 !important;

        .browser-offline-section {
            position: absolute;
            top: var(--theme-height-header);
            left: 0;
            user-select: none;
            pointer-events: none;
            z-index: 100000 !important;

            height: 1.8rem;
            width: 100%;

            display: flex;
            flex-flow: row nowrap;
            justify-content: center;
            align-items: center;
            align-content: center;
            gap: .5em;

            font-family: 'ArchivoBold', sans-serif;
            color: #FFFFF2;

            background: var(--theme-background-offline);

            transition: 300ms ease-in-out;

            .offline-spinner {
                svg {
                    width: auto;
                    height: 1.35rem;
                }

                animation: offline-spinner-animation 1500ms infinite linear;
            }
        }

        .header-container {
            display: flex;
            flex-flow: row nowrap;

            --icon-gap: 1.5rem;

            .header-logo .inventar-logo {
                align-self: center;
                height: 2rem;
                transition-duration: 200ms;
                fill: var(--theme-logo);
            }

            .header-links {
                display: flex;
                flex-flow: row nowrap;
                align-content: center;

                nav {
                    display: flex;
                    flex-flow: row nowrap;
                    gap: var(--icon-gap);

                    align-self: center;
                    align-content: center;
                    text-align: center;

                    justify-content: space-between;

                    color: var(--theme-text);

                    a {
                        font-family: 'FunnelDisplay', serif;
                        font-variation-settings: "wght" 600;

                        transition-duration: 350ms;
                    }

                    a:hover {
                        color: var(--theme-text-accent);

                        transition-duration: 150ms;
                    }

                    a[aria-current=true] {
                        color: var(--theme-text-accent);
                    }
                }

                .header-icons {
                    display: flex;
                    flex-flow: row nowrap;
                    align-items: center;

                    .header-icon:first-child {
                        margin-left: var(--icon-gap);
                    }

                    .header-icon {
                        display: flex;
                        margin-left: calc(var(--icon-gap) * .5);

                        img {
                            height: 1.45rem !important;
                            width: 1.45rem !important;
                            border-radius: 100%;
                            aspect-ratio: 1/1 !important;
                        }

                        svg {
                            cursor: pointer;
                            stroke-width: 1.75;
                            stroke: var(--theme-icon);

                            transition-duration: 125ms;
                        }

                        .blue-hover:hover {
                            stroke: var(--theme-text-accent);
                            stroke-width: 2;

                            transition-duration: 75ms;
                        }
                    }
                }
            }

            .burger-stack-button {
                position: absolute;
                right: 1rem;
                top: 1.1rem;

                pointer-events: all;
                cursor: pointer;
                user-select: none;

                overflow: visible;

                .burger.line:first-child {
                    margin-top: 0;
                }

                .burger.line:last-child {
                    margin-bottom: 0;
                }

                .burger.line {
                    background: var(--theme-text);
                    border-radius: var(--theme-border-radius);
                    height: .2rem;
                    width: 1.5rem;

                    margin: .35rem 0;

                    overflow: visible;

                    transition: var(--theme-transition-in);
                }
            }

            .burger-stack-button.open {
                right: .75rem;
                top: 1.4rem;

                .burger.line:first-child {
                    transform: rotate(45deg) translateY(.35rem);
                    transition: var(--theme-transition-in);
                }

                .burger.line:last-child {
                    transform: rotate(-45deg) translateY(-.35rem);

                    transition: var(--theme-transition-in);
                }
            }
        }
    }

    @keyframes offline-spinner-animation {
        0% {
            transform: rotate(-17deg);
        }
        10% {
            transform: rotate(17deg);
        }
        20%, 40%, 100% {
            transform: rotate(0deg);
        }
        25% {
            transform: rotate(-4deg);
        }
        30% {
            transform: rotate(4deg);
        }
    }

</style>