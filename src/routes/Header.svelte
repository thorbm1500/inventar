<script lang="ts">
    import {page} from "$app/state";
    import {onMount} from 'svelte';

    let element: any = undefined;
    let isOnline = $state(true);

    onMount(async () => {
        element = document.getElementsByTagName('body')[0]
    })

    let isDark = $state(true)
    let theme = $derived(isDark ? 'light' : 'dark');

    function toggleTheme() {
        if (!element) return;
        isDark = !isDark
        isDark
            ? element.classList.add('dark')
            : element.classList.remove('dark')
    }

    setInterval(() => {
        isOnline = navigator.onLine
    }, 2500)
</script>

<section class="bg-light-header dark:bg-dark-header border-b-[0.1em] border-light-header-border dark:border-dark-header-border">
    <div class="header-container">
        <div class="header-logo">
            <a href="/">
                <svg class="fill-light-logo dark:fill-dark-logo" viewBox="0 0 3013.54 659.04">
                    <rect y="18.18" width="205.82" height="205.82"/>
                    <polygon points="71.81 295.81 71.81 573.45 416.45 573.45 416.45 434.81 555.27 434.81 555.27 89.99 277.63 89.99 277.63 295.81 71.81 295.81"/>
                    <path d="M738.02,165.97c-10.54,0-19.58-3.71-27.15-11.11-7.57-7.41-11.35-16.54-11.35-27.4,0-10.53,3.71-19.58,11.11-27.15,7.41-7.57,16.54-11.35,27.4-11.35,10.53,0,19.58,3.71,27.15,11.11,7.57,7.41,11.35,16.54,11.35,27.4,0,10.54-3.71,19.58-11.11,27.15-7.41,7.57-16.54,11.35-27.4,11.35ZM704.38,497.7l.06-296.2h67.14s-.06,296.21-.06,296.21h-67.14Z"/>
                    <path d="M863.83,497.74l.05-228.57h-34.06s.01-67.64.01-67.64h70.1s0,46.91,0,46.91h20.73c10.53-16.78,24.6-29.69,42.22-38.74,17.6-9.04,38.92-13.57,63.93-13.56,39.49,0,70.35,11.12,92.56,33.34,22.21,22.22,33.31,51.93,33.3,89.11l-.04,179.2h-67.14s.04-167.37.04-167.37c0-24.35-6.49-42.95-19.49-55.79-13-12.84-32.17-19.26-57.51-19.27-25.35,0-44.6,6.41-57.76,19.24-13.17,12.83-19.75,31.43-19.76,55.78l-.04,167.35h-67.14Z"/>
                    <path d="M1306.65,497.83l-126.32-296.23,70.59.02,91.77,222.17h1.97l90.39-222.13h68.62s-126.44,296.19-126.44,296.19h-70.59Z"/>
                    <path d="M1670.97,503.83c-31.27,0-58.5-6.34-81.7-19.02-23.2-12.67-41.05-30.69-53.55-54.07-12.51-23.37-18.75-50.68-18.74-81.95,0-31.26,6.18-58.33,18.53-81.2,12.35-22.87,29.88-40.55,52.59-53.06,22.71-12.5,49.53-18.75,80.47-18.74,29.62,0,55.12,5.86,76.52,17.54,21.39,11.69,37.92,28.32,49.6,49.87,11.67,21.56,17.51,47.15,17.51,76.77v24.68s-231.04-.05-231.04-.05c2.62,26.99,11.67,47.81,27.14,62.46,15.46,14.65,36.19,21.98,62.2,21.98,19.08,0,34.72-3.61,46.9-10.85,12.17-7.23,20.57-18.09,25.18-32.58h68.12c-7.25,30.95-23.14,55.05-47.65,72.33-24.53,17.27-55.22,25.91-92.07,25.9ZM1583.14,317.7l164.88.04c-2.63-21.72-10.85-38.42-24.67-50.11-13.82-11.68-32.08-17.53-54.79-17.54s-41.47,5.84-56.28,17.51c-14.81,11.68-24.53,28.38-29.14,50.1Z"/>
                    <path d="M1885.72,497.95l.05-228.57h-34.06s.01-67.64.01-67.64l70.1.02v46.9s20.72,0,20.72,0c10.53-16.78,24.6-29.69,42.22-38.74,17.6-9.04,38.92-13.57,63.93-13.56,39.49,0,70.35,11.12,92.56,33.34,22.21,22.22,33.31,51.93,33.3,89.11l-.04,179.2h-67.14s.04-167.37.04-167.37c0-24.35-6.49-42.95-19.49-55.79-13-12.84-32.17-19.26-57.51-19.27-25.35,0-44.6,6.41-57.76,19.24-13.17,12.83-19.75,31.43-19.76,55.78l-.04,167.35h-67.14Z"/>
                    <path d="M2328.53,498.05c-18.1,0-32.17-4.61-42.21-13.83-10.04-9.21-15.05-23.21-15.05-41.96l.04-188.09h-53.32s.01-52.34.01-52.34h53.81s.02-88.85.02-88.85h66.15s-.02,88.87-.02,88.87l73.56.02v52.33s-73.07-.02-73.07-.02l-.04,191.05,80.47.02v52.82s-90.35-.02-90.35-.02Z"/>
                    <path d="M2558.57,503.53c-33.9,0-60.64-8.41-80.21-25.19-19.58-16.79-29.37-38.83-29.36-66.16,0-28.63,9.88-50.84,29.63-66.64,19.75-15.79,48.05-23.69,84.92-23.68l93.8.02v-12.34c.01-39.49-22.37-59.25-67.12-59.25-37.85,0-60.56,13.65-68.13,40.96h-67.14c5.6-30.62,20.17-54.14,43.7-70.6,23.53-16.45,54.22-24.67,92.07-24.66,42.46,0,74.87,9.81,97.25,29.39,22.37,19.59,33.56,47.98,33.55,85.17l-.03,119.96h32.09s-.01,67.64-.01,67.64h-69.61s0-46.91,0-46.91h-20.73c-10.21,16.45-24.03,29.29-41.48,38.49-17.45,9.21-38.51,13.82-63.19,13.81ZM2568.46,451.2c16.78,0,31.92-3.28,45.42-9.86,13.49-6.58,24.11-15.38,31.85-26.4,7.73-11.02,11.61-23.28,11.61-36.78v-9.38s-90.34-.02-90.34-.02c-36.21,0-54.31,13.49-54.31,40.47,0,13.17,4.93,23.45,14.8,30.86,9.87,7.41,23.52,11.11,40.97,11.12Z"/>
                    <path d="M2821.21,498.15l.05-228.57h-34.06s.01-67.64.01-67.64l70.1.02v56.77s20.72,0,20.72,0c7.9-19.41,20.49-34.22,37.77-44.42,17.28-10.19,37.11-15.3,59.49-15.29h24.68s-.01,57.76-.01,57.76h-27.65c-27.98-.01-49.12,8.05-63.44,24.17-14.32,16.13-21.48,37.68-21.49,64.67l-.03,152.54h-66.15Z"/>
                </svg>
            </a>
        </div>
        <div class="header-links">
            <nav class="text-text-primary dark:text-dark-text-primary">
                <a aria-current={page.url.pathname === '/'} title="Home" href="/">Home</a>
                <a aria-current={page.url.pathname === '/browse'} title="Browse" href="/browse">Browse</a>
            </nav>
            <div class="header-icons">
                <div class="header-icon">
                    <button class="page-theme-switch-button" id="dark-light-mode-switcher" onclick={toggleTheme} title="Page Theme Switcher">
                        <svg class="size-6 stroke-light-icon-primary dark:stroke-dark-icon-primary" fill="none" viewBox="0 0 24 24">
                            {#if theme === 'dark'}
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>
                            {:else}
                                <path stroke-linecap="round" stroke-linejoin="round"
                                      d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/>
                            {/if}
                        </svg>
                    </button>
                </div>
                <div class="header-icon">
                    <button class="user-profile-button" id="dark-light-mode-switcher" title="User Profile Button">
                        <svg class="size-6 stroke-light-icon-primary dark:stroke-dark-icon-primary" fill="none" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="browser-offline-section" style="opacity: { isOnline ? '0' : '1'} !important;">
        <div class="offline-text">
            BROWSER OFFLINE
        </div>
        <div class="offline-spinner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.25" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
            </svg>
        </div>
    </div>
</section>

<style>
    section .browser-offline-section {
        position: absolute;
        top: var(--header-height);
        left: 0;
        user-select: none;
        pointer-events: none;
        z-index: 10000 !important;

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

        background: var(--browser-offline-background);

        transition: 300ms ease-in-out;

        .offline-spinner {
            svg {
                width: auto;
                height: 1.35rem;
            }

            animation: offline-spinner-animation 1500ms infinite linear;
        }
    }

    section {
        height: var(--header-height);

        padding-left: 15%;
        padding-right: 15%;

        align-content: center;
        justify-content: center;

        .header-container {
            display: flex;
            flex-flow: row nowrap;
            justify-content: space-between;


            .header-logo svg {
                align-self: center;
                height: 2rem;
                transition-duration: 200ms;
            }

            .header-links {
                display: flex;
                flex-flow: row nowrap;
                align-content: center;

                nav {
                    display: flex;
                    flex-flow: row nowrap;
                    gap: var(--header-icon-gap);

                    font-family: 'FunnelSans', serif;
                    text-align: center;
                    align-self: center;

                    a {
                        font-variation-settings: "wght" 400;

                        transition-duration: 350ms;
                    }

                    a:hover {
                        font-variation-settings: "wght" 700;
                        color: var(--accent-text);

                        transition-duration: 150ms;
                    }

                    a::after {
                        display: block;
                        content: attr(title);
                        height: 0;
                        font-variation-settings: "wght" 700;
                        opacity: 0;
                        overflow: hidden;
                    }

                    a[aria-current=true] {
                        color: var(--accent-text);
                        font-variation-settings: "wght" 700;
                    }
                }

                .header-icons {
                    display: flex;
                    flex-flow: row nowrap;

                    .header-icon:first-child {
                        margin-left: var(--header-icon-gap);
                    }

                    .header-icon {
                        display: flex;
                        margin-left: calc(var(--header-icon-gap) * .5);

                        svg {
                            stroke-width: 1.6;
                        }

                        svg:hover {
                            cursor: pointer;
                            stroke: var(--accent-text);
                            stroke-width: 1.65;

                            transition-duration: 150ms;
                        }
                    }
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
        20%,40%,100% {
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