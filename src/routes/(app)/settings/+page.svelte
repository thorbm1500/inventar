<script lang="ts">
    import type {User} from "$lib/server/db/schema";
    import {getContext} from "svelte";
    import { mockSettings } from "\$lib/interfaces";
    import Settings from "$lib/components/Settings.svelte";

    let user: User | undefined = $state(getContext('user'));

    let settings = $state(mockSettings);
</script>

<section class="inventory-settings-page">
    <Settings bind:settings={settings} />
</section>

<style>
    .inventory-settings-page {
        display: flex;
        flex-flow: row nowrap;
        align-items: flex-start;
        justify-content: center;

        height: var(--theme-max-page-height);
        width: 100vw;

        padding: clamp(2rem, 10vh, 15vh) 0;

        box-sizing: border-box;
    }
</style>