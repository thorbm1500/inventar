<script lang="ts">
    let { children } = $props();
</script>

<section class="main-container">
    {@render children()}
</section>

<style>
    .main-container {
        height: 100vh;
        width: 100vw;
        scrollbar-width: none;
    }
</style>