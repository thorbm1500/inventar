<script lang="ts">
    import Header from './Header.svelte';
</script>

<Header/>

<section class="text-text-primary dark:text-dark-text-primary">
    <div id="placeholder-box" class="border-light-header-border dark:border-dark-header-border border-[0.1rem] bg-light-container dark:bg-dark-container fill-light-container dark:fill-dark-container"></div>
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
    }
</style>