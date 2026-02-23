<script lang="ts">
    import {createInventory} from "./data.remote.ts";
    import {getContext, onMount} from "svelte";
    import type {User} from "$lib/server/db/interfaces";
    import tippy, {animateFill} from "tippy.js";
    import 'tippy.js/dist/tippy.css';
    import 'tippy.js/dist/backdrop.css';
    import 'tippy.js/animations/shift-away.css';
    import Toast from "$lib/components/toast.svelte";

    let user: User = $state(getContext('user'));
    let toast: Toast

    let value = $state('');
    let canSubmit = $derived(value.length > 3);

    onMount(() => {
        toast = getContext('toasts') as Toast;
    });

    function attemptSubmit(): void {
        if (value.length === 0) {
            toast?.addWarningToast('INVENTORY NAME IS REQUIRED')
        } else if (value.length <= 3) {
            toast?.addWarningToast('INVENTORY NAME MUST BE AT LEAST 3 CHARACTERS')
        }
    }

    function tooltip(node: SVGElement, content: string) {
        let tippyObj = tippy(node, {
            content,
            theme: 'tooltip_theme',
            plugins: [animateFill],
            animateFill: true,
            inertia: true,
            duration: [75, 225]
        });
        return {
            destroy: () => {
                tippyObj.destroy();
            }
        }
    }
</script>

<section class="inventory-creator-page">
    <form {...createInventory} id="create-inventory-form" encType="multipart/form-data">
        <input {...createInventory.fields.owner.as('text')} value="{user?.uuid}" hidden>
        <div class="field-container name">
            <input {...createInventory.fields.name.as('text')} bind:value data-protonpass-ignore="true" data-lpignore="true" data-1p-ignore data-bwignore class="field inventory-name" name="name"
                   placeholder="Inventory Name..." spellcheck="false" required>
            <div style="display:flex;flex-flow:row nowrap;align-items:center;gap:.5rem;">
                <svg use:tooltip={`Once created, all settings will be available to customize.`} class="information-icon name" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="currentColor"
                          d="M14.6 8.075q0-1.075-.712-1.725T12 5.7q-.725 0-1.312.313t-1.013.912q-.4.575-1.088.663T7.4 7.225q-.35-.325-.387-.8t.237-.9q.8-1.2 2.038-1.862T12 3q2.425 0 3.938 1.375t1.512 3.6q0 1.125-.475 2.025t-1.75 2.125q-.925.875-1.25 1.363T13.55 14.6q-.1.6-.513 1t-.987.4t-.987-.387t-.413-.963q0-.975.425-1.787T12.5 11.15q1.275-1.125 1.688-1.737t.412-1.338M12 22q-.825 0-1.412-.587T10 20t.588-1.412T12 18t1.413.588T14 20t-.587 1.413T12 22"/>
                </svg>
                <button onmousedown="{() => attemptSubmit()}" form="{canSubmit ? 'create-inventory-form' : ''}" class="theme-button">CREATE</button>
            </div>
        </div>
        <div class="field-container description">
            <h1 style="pointer-events:none;user-select:none;">Description</h1>
            <textarea {...createInventory.fields.description.as('text')} placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam commodo at lacus a rhoncus. Sed in magna nisi..."
                      spellcheck="false"></textarea>
        </div>
        <div class="field-container icon">
            <h1>Icon</h1>
            <p>Coming Soon</p>
        </div>
    </form>
</section>

<style>
    .inventory-creator-page {
        width: 100vw;
        height: calc(100vh - var(--theme-height-header));

        display: flex;
        justify-content: center;
        align-items: center;
        flex-flow: column nowrap;

        form {
            display: flex;
            flex-flow: column nowrap;
            justify-content: center;
            align-items: center;

            width: fit-content;
            height: fit-content;

            input::selection, textarea::selection {
                color: #FFFFF2;
                background: var(--theme-text-accent);
            }

            input, textarea {
                color: var(--theme-text);
                caret-color: var(--theme-text);
                caret-shape: underscore !important;
                appearance: none;
                background: none;
                border: none;
                outline: none;
                width: 32rem;
                user-select: none;
            }

            input:focus, textarea:focus {
                box-shadow: none;
            }

            .field-container {
                width: 62rem;
                height: fit-content;

                margin-bottom: 1rem;
                padding: 1.5rem;

                background: var(--theme-background-container);
                border: .122em solid var(--theme-border-container);
                border-radius: var(--theme-border-radius);

                color: var(--theme-text);

                h1 {
                    padding-left: .75rem;
                    font-family: 'FunnelDisplay', sans-serif;
                    font-size: 2rem;
                    font-weight: 700;
                }
            }

            .field-container {
                .information-icon {
                    height: 1.15rem;
                    width: 1.15rem;

                    color: var(--theme-text-third);

                    cursor: pointer;

                    transition: 125ms ease-in-out;
                }

                .information-icon:hover {
                    color: var(--theme-text);

                    transition: 50ms ease-in-out;
                }
            }

            .field-container.name {
                display: flex;
                flex-flow: row nowrap;
                justify-content: space-between;
                align-items: center;

                .field.inventory-name {
                    font-family: 'FunnelDisplay', sans-serif;
                    font-size: 2rem;
                    font-weight: 700;
                }
            }

            .field-container.description {
                display: flex;
                flex-flow: column nowrap;
                align-items: flex-start;

                textarea {
                    field-sizing: content;
                    max-height: 18rem !important;
                    width: 58rem;
                    margin-bottom: 1rem;
                    scrollbar-width: thin;
                    scrollbar-gutter: stable;
                    scroll-behavior: smooth;
                    scrollbar-color: var(--theme-text-accent) transparent;
                    resize: none;
                }
            }

            .field-container.icon {
                pointer-events: none;
                user-select: none;

                h1 {
                    color: var(--theme-text);
                }

                p {
                    color: var(--theme-text-third);
                    padding-left: .75rem;
                    font-family: 'FunnelDisplay', sans-serif;
                    font-weight: 700;
                }
            }
        }
    }
</style>