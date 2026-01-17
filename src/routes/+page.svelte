<script lang="ts">
    import {onMount} from 'svelte';
    import Header from './Header.svelte';
    import DarkMode from '$lib/assets/icons/dark_mode.svg'
    import LightMode from '$lib/assets/icons/light_mode.svg'

    let element: any = undefined;

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
</script>

<Header/>

<section class="text-light-text-primary dark:text-dark-text-primary">
    <div id="placeholder-box" class="border-light-header-border dark:border-dark-header-border border-[0.1rem] bg-light-container dark:bg-dark-container fill-light-container dark:fill-dark-container"></div>

    <button id="dark-light-mode-switcher" onclick={toggleTheme}
            class="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 text-light-text-primary dark:text-dark-text-primary transition">
        {#if theme === 'dark'}
            <img src={LightMode} alt="Light mode icon"> Light
        {:else}
            <img src={DarkMode} alt="Dark mode icon"> Dark
        {/if}
        Mode
    </button>
</section>

<style>
    section {
        height: 100%;
        align-content: center;
        justify-content: center;

        #placeholder-box {
            margin-top: -3.75em;
            width: 48rem;
            height: 82%;
            border-radius: 0.8rem;
            justify-self: center;
        }

        #dark-light-mode-switcher {
            position: absolute;
            bottom: 1.25rem;
            right: 1.25rem;

            display: flex;
            gap: .5em;
            align-items: center;

            img {
                width: 1.25em;
            }
        }

        svg {
            width: 28rem;
            justify-self: center;
            transition-duration: 200ms;
        }

        p {
            margin-top: .5em;
            color: var(--primary-text-color);
            font-family: 'FunnelSans', 'ArchivoRegular', sans-serif;
            text-align: center;
            font-size: .9em;
            font-variation-settings: "wght" 400;

            a {
                color: var(--primary-text-color);
            }
        }

        p a {
            font-variation-settings: "wght" 400;
            transition-duration: 0.4s;
        }

        p a:hover {
            font-variation-settings: "wght" 600;
            transition-duration: 0.4s;
        }

        p a:active {
            font-size: 1.25em;
            transition-duration: 0.4s;
        }
    }
</style>