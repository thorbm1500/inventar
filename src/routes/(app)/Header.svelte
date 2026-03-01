<script lang="ts">
    import {page} from "$app/state";
    import {getContext, onMount, setContext} from 'svelte';
    import type {User} from "$lib/server/db/interfaces";
    import {updateTheme} from "./data.remote";

    const pageInfo = {
        title: undefined
    }

    setContext('pageInfo', pageInfo);

    let user: User = $derived(getContext('user'));
    let theme = $derived(user.preferred_theme);

    let sidebar = $state(false);

    let isOnline = $state(true);

    onMount(() => {
        document.getElementById('pill')?.addEventListener('click', (event: MouseEvent) => {
            sidebar = !sidebar;
        })
        document.querySelectorAll('#pill-action').forEach(element => element.addEventListener('click', () => sidebar = false))
    });

    setInterval(() => {
        isOnline = navigator.onLine
    }, 2000)
</script>

<section class="offline-pill {isOnline ? 'online' : 'offline'}">
    Browser Offline
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
                d="M15.3119 10C16.6802 10.4263 17.9624 11.1191 19.08 12.05M22.5799 8.49997C19.6575 5.92394 15.8956 4.50262 11.9999 4.50262C11.3949 4.50262 10.7931 4.5369 10.1972 4.60447M8.52979 15.61C9.54499 14.8888 10.7595 14.5013 12.0048 14.5013C13.2501 14.5013 14.4646 14.8888 15.4798 15.61M12 19.5H12.01M1.19336 8.70076C2.52697 7.47869 4.06839 6.47975 5.75851 5.76306M4.73193 12.243C6.12934 11.012 7.84172 10.1302 9.73265 9.73393M15.6983 15.7751C14.6792 14.9763 13.3952 14.5 11.9999 14.5C10.5835 14.5 9.28172 14.9908 8.25537 15.8116M3 3L21 21"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
        />
    </svg>
</section>

<section class="pill" id="pill" style="{sidebar?'border-bottom-left-radius:0 !important;border-bottom-right-radius:0 !important;':''}">
    <div class="header-logo">
        <a href="/" title="inventar header logo">
            <svg class="inventar-logo" width="1500" height="1500" viewBox="0 0 1500 1500">
                <rect x="1000" y="1000" width="500" height="500" style="fill:currentColor;"/>
                <rect x="500" y="500" width="500" height="500" style="fill:currentColor;"/>
                <rect width="500" height="500" style="fill:currentColor;"/>
                <rect x="1000" width="500" height="500" style="fill:currentColor; opacity:.5;"/>
                <rect y="500" width="500" height="500" style="fill:currentColor; opacity:.75;"/>
                <rect x="500" y="1000" width="500" height="500" style="fill:currentColor; opacity:.75;"/>
            </svg>
        </a>
        <div class="page-meta">
            {pageInfo.title ?? 'inventar'}
        </div>
    </div>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         class="chevron-down {sidebar?'open':'closed'}">
        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
        <path d="M6 9l6 6l6 -6"/>
    </svg>
</section>

<section class="sidebar {sidebar?'open':'closed'}">
    <div class="top-section">
        <a id="pill-action" href="/">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                        d="M9 21V13.6C9 13.0399 9 12.7599 9.109 12.546C9.20487 12.3578 9.35785 12.2049 9.54601 12.109C9.75993 12 10.04 12 10.6 12H13.4C13.9601 12 14.2401 12 14.454 12.109C14.6422 12.2049 14.7951 12.3578 14.891 12.546C15 12.7599 15 13.0399 15 13.6V21M2 9.5L11.04 2.72C11.3843 2.46181 11.5564 2.33271 11.7454 2.28294C11.9123 2.23902 12.0877 2.23902 12.2546 2.28295C12.4436 2.33271 12.6157 2.46181 12.96 2.72L22 9.5M4 8V17.8C4 18.9201 4 19.4802 4.21799 19.908C4.40974 20.2843 4.7157 20.5903 5.09202 20.782C5.51985 21 6.0799 21 7.2 21H16.8C17.9201 21 18.4802 21 18.908 20.782C19.2843 20.5903 19.5903 20.2843 19.782 19.908C20 19.4802 20 18.9201 20 17.8V8L13.92 3.44C13.2315 2.92361 12.8872 2.66542 12.5091 2.56589C12.1754 2.47804 11.8246 2.47804 11.4909 2.56589C11.1128 2.66542 10.7685 2.92361 10.08 3.44L4 8Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                />
            </svg>
            Home
        </a>
        <a id="pill-action" href="/browse">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                        d="M9.75 20.7501L11.223 21.5684C11.5066 21.726 11.6484 21.8047 11.7986 21.8356C11.9315 21.863 12.0685 21.863 12.2015 21.8356C12.3516 21.8047 12.4934 21.726 12.777 21.5684L14.25 20.7501M5.25 18.2501L3.82297 17.4573C3.52346 17.2909 3.37368 17.2077 3.26463 17.0893C3.16816 16.9847 3.09515 16.8606 3.05048 16.7254C3 16.5726 3 16.4013 3 16.0586V14.5001M3 9.50009V7.94153C3 7.59889 3 7.42757 3.05048 7.27477C3.09515 7.13959 3.16816 7.01551 3.26463 6.91082C3.37368 6.79248 3.52345 6.70928 3.82297 6.54288L5.25 5.75009M9.75 3.25008L11.223 2.43177C11.5066 2.27421 11.6484 2.19543 11.7986 2.16454C11.9315 2.13721 12.0685 2.13721 12.2015 2.16454C12.3516 2.19543 12.4934 2.27421 12.777 2.43177L14.25 3.25008M18.75 5.75008L20.177 6.54288C20.4766 6.70928 20.6263 6.79248 20.7354 6.91082C20.8318 7.01551 20.9049 7.13959 20.9495 7.27477C21 7.42757 21 7.59889 21 7.94153V9.50008M21 14.5001V16.0586C21 16.4013 21 16.5726 20.9495 16.7254C20.9049 16.8606 20.8318 16.9847 20.7354 17.0893C20.6263 17.2077 20.4766 17.2909 20.177 17.4573L18.75 18.2501M9.75 10.7501L12 12.0001M12 12.0001L14.25 10.7501M12 12.0001V14.5001M3 7.00008L5.25 8.25008M18.75 8.25008L21 7.00008M12 19.5001V22.0001"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                />
            </svg>
            Browse
        </a>
        <a id="pill-action" href="/inventory">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                        d="M20.5 7.27783L12 12.0001M12 12.0001L3.49997 7.27783M12 12.0001L12 21.5001M21 16.0586V7.94153C21 7.59889 21 7.42757 20.9495 7.27477C20.9049 7.13959 20.8318 7.01551 20.7354 6.91082C20.6263 6.79248 20.4766 6.70928 20.177 6.54288L12.777 2.43177C12.4934 2.27421 12.3516 2.19543 12.2015 2.16454C12.0685 2.13721 11.9315 2.13721 11.7986 2.16454C11.6484 2.19543 11.5066 2.27421 11.223 2.43177L3.82297 6.54288C3.52345 6.70928 3.37369 6.79248 3.26463 6.91082C3.16816 7.01551 3.09515 7.13959 3.05048 7.27477C3 7.42757 3 7.59889 3 7.94153V16.0586C3 16.4013 3 16.5726 3.05048 16.7254C3.09515 16.8606 3.16816 16.9847 3.26463 17.0893C3.37369 17.2077 3.52345 17.2909 3.82297 17.4573L11.223 21.5684C11.5066 21.726 11.6484 21.8047 11.7986 21.8356C11.9315 21.863 12.0685 21.863 12.2015 21.8356C12.3516 21.8047 12.4934 21.726 12.777 21.5684L20.177 17.4573C20.4766 17.2909 20.6263 17.2077 20.7354 17.0893C20.8318 16.9847 20.9049 16.8606 20.9495 16.7254C21 16.5726 21 16.4013 21 16.0586Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                />
                <path d="M16.5 9.5L7.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Inventory
        </a>
        <a id="pill-action" href="/settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                        d="M12.0005 15C13.6573 15 15.0005 13.6569 15.0005 12C15.0005 10.3431 13.6573 9 12.0005 9C10.3436 9 9.00049 10.3431 9.00049 12C9.00049 13.6569 10.3436 15 12.0005 15Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                />
                <path
                        d="M9.28957 19.3711L9.87402 20.6856C10.0478 21.0768 10.3313 21.4093 10.6902 21.6426C11.0492 21.8759 11.4681 22.0001 11.8962 22C12.3244 22.0001 12.7433 21.8759 13.1022 21.6426C13.4612 21.4093 13.7447 21.0768 13.9185 20.6856L14.5029 19.3711C14.711 18.9047 15.0609 18.5159 15.5029 18.26C15.9477 18.0034 16.4622 17.8941 16.9729 17.9478L18.4029 18.1C18.8286 18.145 19.2582 18.0656 19.6396 17.8713C20.021 17.6771 20.3379 17.3763 20.5518 17.0056C20.766 16.635 20.868 16.2103 20.8455 15.7829C20.823 15.3555 20.677 14.9438 20.4251 14.5978L19.5785 13.4344C19.277 13.0171 19.1159 12.5148 19.1185 12C19.1184 11.4866 19.281 10.9864 19.5829 10.5711L20.4296 9.40778C20.6814 9.06175 20.8275 8.65007 20.85 8.22267C20.8725 7.79528 20.7704 7.37054 20.5562 7C20.3423 6.62923 20.0255 6.32849 19.644 6.13423C19.2626 5.93997 18.833 5.86053 18.4074 5.90556L16.9774 6.05778C16.4667 6.11141 15.9521 6.00212 15.5074 5.74556C15.0645 5.48825 14.7144 5.09736 14.5074 4.62889L13.9185 3.31444C13.7447 2.92317 13.4612 2.59072 13.1022 2.3574C12.7433 2.12408 12.3244 1.99993 11.8962 2C11.4681 1.99993 11.0492 2.12408 10.6902 2.3574C10.3313 2.59072 10.0478 2.92317 9.87402 3.31444L9.28957 4.62889C9.0825 5.09736 8.73245 5.48825 8.28957 5.74556C7.84479 6.00212 7.33024 6.11141 6.81957 6.05778L5.38513 5.90556C4.95946 5.86053 4.52987 5.93997 4.14844 6.13423C3.76702 6.32849 3.45014 6.62923 3.23624 7C3.02206 7.37054 2.92002 7.79528 2.94251 8.22267C2.96499 8.65007 3.11103 9.06175 3.36291 9.40778L4.20957 10.5711C4.51151 10.9864 4.67411 11.4866 4.67402 12C4.67411 12.5134 4.51151 13.0137 4.20957 13.4289L3.36291 14.5922C3.11103 14.9382 2.96499 15.3499 2.94251 15.7773C2.92002 16.2047 3.02206 16.6295 3.23624 17C3.45036 17.3706 3.76727 17.6712 4.14864 17.8654C4.53001 18.0596 4.95949 18.1392 5.38513 18.0944L6.81513 17.9422C7.3258 17.8886 7.84034 17.9979 8.28513 18.2544C8.72966 18.511 9.08134 18.902 9.28957 19.3711Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                />
            </svg>
            Settings
        </a>
        <div class="seperator"></div>
    </div>
    <div class="user-actions">
        <button class="action theme-switcher" title="Change Theme" onclick="{() => user.preferred_theme = user.preferred_theme === 'dark' ? 'light' : 'dark'}">
            {#if (theme === 'dark')}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                            d="M18 2L18.6178 3.23558C18.8833 3.76656 19.016 4.03205 19.1934 4.26211C19.3507 4.46626 19.5337 4.64927 19.7379 4.80664C19.9679 4.98397 20.2334 5.11672 20.7644 5.38221L22 6L20.7644 6.61779C20.2334 6.88328 19.9679 7.01603 19.7379 7.19336C19.5337 7.35073 19.3507 7.53374 19.1934 7.73789C19.016 7.96795 18.8833 8.23344 18.6178 8.76442L18 10L17.3822 8.76442C17.1167 8.23344 16.984 7.96795 16.8066 7.73789C16.6493 7.53374 16.4663 7.35073 16.2621 7.19336C16.0321 7.01603 15.7666 6.88328 15.2356 6.61779L14 6L15.2356 5.38221C15.7666 5.11672 16.0321 4.98397 16.2621 4.80664C16.4663 4.64927 16.6493 4.46626 16.8066 4.26211C16.984 4.03205 17.1167 3.76656 17.3822 3.23558L18 2Z"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                    />
                    <path
                            d="M21 13.3893C19.689 15.689 17.2145 17.2395 14.3779 17.2395C10.1711 17.2395 6.76075 13.8292 6.76075 9.62233C6.76075 6.78554 8.31149 4.31094 10.6115 3C5.77979 3.45812 2 7.52692 2 12.4785C2 17.7371 6.26292 22 11.5215 22C16.4729 22 20.5415 18.2206 21 13.3893Z"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                    />
                </svg>
            {:else}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                            d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                    />
                </svg>
            {/if}
        </button>
        <a id="pill-action" class="action profile" title="Profile" href="/account/{user.uuid}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                        d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                />
            </svg>
        </a>
        <a id="pill-action" class="action logout" title="Logout" href="/logout">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                        d="M18 8L22 12M22 12L18 16M22 12H9M15 4.20404C13.7252 3.43827 12.2452 3 10.6667 3C5.8802 3 2 7.02944 2 12C2 16.9706 5.8802 21 10.6667 21C12.2452 21 13.7252 20.5617 15 19.796"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                />
            </svg>
        </a>
    </div>
</section>

<style>
    * {
        user-select: none !important;
    }

    .offline-pill {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: center;
        gap: .35rem;

        white-space: nowrap;

        position: absolute;
        width: 11rem;
        height: 2.25rem;

        left: calc(50vw - 5.5rem);

        background: var(--theme-text-danger);
        border-radius: .75rem;

        font-family: 'FunnelSans', sans-serif;
        font-weight: 500;
        color: #FFFFF2;

        svg {
            animation: offline-shake 1.5s infinite ease;
        }
    }

    .offline-pill.online {
        top: -3.25rem;

        transition: 100ms;
        transition-timing-function: cubic-bezier(0.57, 0.1, 0.25, 1.5) !important;
    }

    .offline-pill.offline {
        top: 1rem;

        transition: 100ms;
        transition-timing-function: cubic-bezier(0.57, 0.1, 0.25, 1.5) !important;
    }

    .pill {
        position: absolute;
        top: 2rem;
        left: 2rem;

        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: space-between;

        width: 16rem;
        height: 3rem;
        padding: 1rem;

        background: var(--theme-background-header);

        border-radius: .75rem;
        border: var(--theme-border-width) solid var(--theme-border-header);

        z-index: 99999;

        cursor: pointer;
        user-select: none;

        transition: 100ms,
        background 25ms;
        transition-timing-function: cubic-bezier(0.57, 0.1, 0.25, 1.5) !important;

        .header-logo {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            gap: .5rem;
            color: var(--theme-text);

            a {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: flex-start;

                .inventar-logo {
                    height: 1.5rem;
                    width: 1.5rem;
                }
            }
        }

        .page-meta {
            align-self: center;
            font-family: 'FunnelDisplay', sans-serif;
            font-size: 1.2rem;
            font-weight: 600;
        }

        .chevron-down {
            justify-self: flex-end;
            height: 1rem;
            width: 1rem;
            stroke-width: 3;
            margin-left: 1rem;

            color: var(--theme-text-secondary);

            transition: 150ms;
            transition-timing-function: cubic-bezier(0.57, 0.1, 0.25, 1.5) !important;
        }

        .chevron-down.open {
            transform: rotate(180deg);
        }

        .chevron-down.closed {
            transform: rotate(0deg);
            opacity: .5;

            transition: opacity 250ms ease;
        }
    }

    .pill:hover {
        .chevron-down.closed {
            opacity: 1;

            transition: opacity 100ms ease;
        }
    }

    .sidebar {
        display: flex;
        flex-flow: column nowrap;
        justify-content: space-between;

        position: absolute;
        top: 2rem;
        left: 2rem;
        width: 16rem;

        box-sizing: border-box !important;
        overflow: hidden !important;
        overflow-y: scroll;
        scrollbar-width: none;

        padding: 3.75rem 1.25rem 1.25rem 1.25rem;

        background: var(--theme-background-header);

        border-radius: .75rem;
        border: var(--theme-border-width) solid var(--theme-border-header);

        z-index: 99998;

        transition: 100ms;
        transition-timing-function: cubic-bezier(0.57, 0.1, 0.25, 1.5) !important;

        .top-section {
            display: flex;
            flex-flow: column nowrap;
            align-items: flex-start;
            justify-content: flex-start;
            gap: .35rem;
        }

        .seperator {
            height: .1rem;
            width: 100%;
            background: var(--theme-text-third);
            opacity: .075;
            margin: .5rem 0;
            border-radius: 100%;
        }

        a {
            display: flex;
            flex-flow: row nowrap;
            gap: .25rem;

            font-family: "Poppins", sans-serif;
            font-weight: 500;
            font-size: 1.05rem;
            color: var(--theme-text-secondary);
            transition: 200ms;
            transition-timing-function: cubic-bezier(0.57, 0.1, 0.25, 1.5) !important;
        }

        a:hover {
            color: var(--theme-text-accent);
            transition: 50ms;
            transition-timing-function: cubic-bezier(0.57, 0.1, 0.25, 1.5) !important;
        }
    }

    .sidebar.open {
        filter: blur(0px);
        height: 16rem;
        opacity: 1;

        transition: 500ms,
        background 0ms,
        opacity 0ms;
        transition-timing-function: cubic-bezier(0.57, 0.1, 0.25, 1.5) !important;
    }

    .sidebar.closed {
        filter: blur(3px) saturate(2);
        height: 3rem;
        padding: 0;
        background: transparent;
        backdrop-filter: blur(3px) brightness(1.5);
        opacity: 0;


        transition: 400ms,
        padding 400ms 300ms,
        filter 250ms 100ms,
        opacity 250ms 300ms;
        transition-timing-function: cubic-bezier(0.57, 0.1, 0.25, 0.5) !important;
    }

    .user-actions {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: center;
        gap: .5rem;

        width: 100%;

        .action {
            color: var(--theme-text-secondary);
            cursor: pointer;
        }

        .action:hover {
            color: var(--theme-text-accent);
        }

        .action.logout:hover {
            color: var(--theme-text-danger);
        }
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
        }
    }

    @keyframes offline-shake {
        0% {
            transform: rotate(-12deg);
        }
        10% {
            transform: rotate(12deg);
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