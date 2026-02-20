<script lang="ts">
    import Settings from "$lib/components/Settings.svelte";
</script>

<section class="inventory-settings-page">
    <Settings />
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