<script lang="ts">
import { page } from '$app/state';
</script>

<section class="error-page-section">
    <h1>{page.status}</h1>
    <h3>{page.error?.message}</h3>
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
</section>

<style>
    .error-page-section {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: center;
        align-content: center;

        width: 100vw;
        height: var(--theme-max-page-height);

        h1 {
            font-family: 'Funnel Display', monospace;
            font-size: 12rem;
            font-weight: 500;
            color: var(--theme-text);

            z-index: 10;
        }
        h3 {
            font-family: 'Funnel Display', monospace;
            font-size: 2.25rem;
            font-style: italic;
            color: var(--theme-text);

            z-index: 10;
        }

        svg {
            position: absolute;
            height: 42rem;
            width: 42rem;
            stroke-width: 1.5;
            z-index: 1;
            color: var(--error-page-icon-color);
        }
    }
</style>