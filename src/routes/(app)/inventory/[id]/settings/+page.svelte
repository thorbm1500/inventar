<script lang="ts">
    import type { PageProps } from './$types';
    import type {Inventory} from "$lib/server/db/schema";
    import Settings from "$lib/components/Settings.svelte";

    let { data }: PageProps = $props();

    let inventory: Inventory = $derived(data.inventory);
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