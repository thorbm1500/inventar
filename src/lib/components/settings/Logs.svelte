<script lang="ts">
    import {getLatestLogs} from "../../../routes/(app)/settings/data.remote";
    import {getContext, onMount} from "svelte";

    const logDir = getContext('logDir');

    let logs = $derived((getLatestLogs('').current ?? 'Loading...').split('\n'));

    let logsViewing = $state('default');

    onMount(async () => await getLatestLogs(''));
</script>

<section class="logs-section">
    <div class="logs-container">
        {#each logs as line}
            {#if line !== ''}
                <p class="log-line">{line}</p>
            {/if}
        {/each}
    </div>
</section>

<style>
    .logs-section {
        width: 100%;
        height: 39.5rem;

        .logs-container {
            width: 100%;
            height: 100%;

            border: var(--theme-border-width) solid var(--theme-border-container);
            border-radius: var(--theme-border-radius);

            overflow-x: scroll;
            overflow-y: hidden;
            overflow: auto;

            padding: 0 1rem;

            .log-line {
                width: 100%;

                font-family: 'FunnelSans', sans-serif;
                color: var(--theme-text);

                text-wrap-style: pretty;
            }
        }
    }
</style>