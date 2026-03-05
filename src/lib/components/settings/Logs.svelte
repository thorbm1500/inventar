<script lang="ts">
    import {getLatestLogs} from "../../../routes/(app)/settings/data.remote";
    import {getContext, onMount} from "svelte";

    const logDir = getContext('logDir');

    let logs: string[] = $derived((getLatestLogs('').current ?? ['Loading...']));

    let logsViewing = $state('default');

    onMount(async () => {
        await getLatestLogs('');
        const logContainerElement = document.getElementById('logs-container');
        logContainerElement?.scroll({
            top: Number.MAX_SAFE_INTEGER,
            behavior: 'instant'
        })
    });
</script>

<div class="logs-container hyphens-none wrap-break-word whitespace-pre-wrap subpixel-antialiased" id="logs-container">
    {#each logs as line}
        {#if line !== ''}
            <div class="log-line">{@html line}</div>
        {/if}
    {/each}
</div>

<style>
    .logs-container {
        width: 100%;
        height: 100%;
        min-height: 32rem;
        max-height: 65vh;

        border: var(--theme-border-width) solid var(--theme-border-container);
        border-radius: var(--theme-border-radius);

        box-sizing: border-box;

        overflow-y: scroll;
        overflow-x: hidden !important;
        overflow: auto;

        padding: 0 1rem;

        .log-line :global {
            width: 100%;

            font-family: 'JetBrains Mono', sans-serif;
            color: var(--theme-text);

            text-wrap-style: pretty;

            .syntax.bracket {
                color: var(--theme-text-secondary);
                font-weight: 800;
            }
            .syntax.type {
                font-weight: 800;
                font-optical-sizing: auto;
            }
            .syntax.type.debug {
                color: var(--theme-text-third);
            }
            .syntax.type.info {
                color: oklch(62.3% 0.214 259.815);
            }
            .syntax.type.done {
                color: oklch(79.2% 0.209 151.711);
            }
            .syntax.type.error,.syntax.type.trace {
                color: oklch(64.5% 0.246 16.439);
            }
            .syntax.timestamp-digits {
                color: var(--theme-text);
            }
            .syntax.timestamp-colon {
                color: oklch(90.5% 0.182 98.111);
            }
            .syntax.trace-text {
                color: oklch(64.5% 0.246 16.439);
            }
        }
    }
</style>