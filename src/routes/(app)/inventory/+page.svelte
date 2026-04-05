<script lang="ts">
    import {getContext} from "svelte";
    import tippy, {animateFill} from "tippy.js";
    import type {ApplicationLocale} from "$lib/locale/locales";
    import {ContextHandler} from "$lib/util/ContextHandler.svelte";

    let locale: ApplicationLocale = $derived(ContextHandler.getLocale());

    const primaryInventory: string | undefined = $state.snapshot((getContext('user_settings') as Function)().primary_inventory);
    if (primaryInventory !== '') {
        window.location.href = `/inventory/${primaryInventory}`;
    }

    let loaded: boolean = $derived(primaryInventory !== undefined);

    function tooltip(node: SVGElement, content: string) {
        let tippyObj = tippy(node, {
            content,
            theme: 'tooltip_theme',
            plugins: [animateFill],
            animateFill: true,
            inertia: true,
            duration: [75, 225],
            allowHTML: true
        });
        return {
            destroy: () => {
                tippyObj.destroy();
            }
        }
    }
</script>

{#if loaded}
    <section class="primary-inventory-undefined-page">
        <div class="information-container">
            <p>{locale.inventory.no_bookmark}</p>
            <svg use:tooltip={`${locale.inventory.no_bookmark_tip_a}.<br/><br/> ${locale.inventory.no_bookmark_tip_b}.`}
                 class="tip-toolbox" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor"
                      d="M14.6 8.075q0-1.075-.712-1.725T12 5.7q-.725 0-1.312.313t-1.013.912q-.4.575-1.088.663T7.4 7.225q-.35-.325-.387-.8t.237-.9q.8-1.2 2.038-1.862T12 3q2.425 0 3.938 1.375t1.512 3.6q0 1.125-.475 2.025t-1.75 2.125q-.925.875-1.25 1.363T13.55 14.6q-.1.6-.513 1t-.987.4t-.987-.387t-.413-.963q0-.975.425-1.787T12.5 11.15q1.275-1.125 1.688-1.737t.412-1.338M12 22q-.825 0-1.412-.587T10 20t.588-1.412T12 18t1.413.588T14 20t-.587 1.413T12 22"/>
            </svg>
        </div>
    </section>
{/if}

<style>
    .primary-inventory-undefined-page {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: center;

        width: 100vw;
        height: var(--theme-max-page-height);

        .information-container {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: center;
            gap: .5rem;

            width: fit-content;
            height: fit-content;

            padding: 2rem 2.5rem;

            background: var(--theme-background-container);
            border: var(--theme-border-width) solid var(--theme-border-container);
            border-radius: var(--theme-border-radius);

            p {
                font-family: 'FunnelSans', sans-serif;
                font-size: 1.15rem;
                font-weight: 600;
                color: var(--theme-text);
            }

            svg {
                align-self: baseline;

                color: var(--theme-text-third);

                cursor: pointer;
            }

            svg:hover {
                color: var(--theme-text);
            }
        }
    }
</style>