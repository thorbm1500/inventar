<script module>
    import {createInventory} from "./data.remote.ts";
</script>

<script lang="ts">
    import {getContext, onMount} from "svelte";
    import type {User} from "$lib/server/db/schema";

    let user: User | undefined = $state();

    let imageSource = $state('');
    let fieldFiles = $state(0);

    onMount(() => {
        user = getContext('user');

        const imageField: HTMLInputElement = document.getElementById("image") as HTMLInputElement;
        if (!imageField) return;

        imageField.addEventListener('change', () => {
            fieldFiles = imageField?.files?.length ?? 0;
            const reader = new FileReader();

            reader.addEventListener('load', (e) => {
                imageSource = e.target?.result as string ?? '';
            });

            if (imageField.files === null || imageField.files[0] === null) return;

            reader.readAsDataURL(imageField.files[0]);
        })
    });

    function removeImage() {
        const imageField: HTMLInputElement = document.getElementById("image") as HTMLInputElement;
        if (!imageField) return;

        imageField.value = "";
        imageSource = '';
        fieldFiles = 0;
    }
</script>

<section class="inventory-creator-page">
    <form {...createInventory} id="create-inventory-form" encType="multipart/form-data">
        <input {...createInventory.fields.owner.as('text')} value="{user?.uuid}" hidden>
        <div class="field-container name">
            <!-- todo - Add popup tip-->
            <svg class="information-icon name" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M14.6 8.075q0-1.075-.712-1.725T12 5.7q-.725 0-1.312.313t-1.013.912q-.4.575-1.088.663T7.4 7.225q-.35-.325-.387-.8t.237-.9q.8-1.2 2.038-1.862T12 3q2.425 0 3.938 1.375t1.512 3.6q0 1.125-.475 2.025t-1.75 2.125q-.925.875-1.25 1.363T13.55 14.6q-.1.6-.513 1t-.987.4t-.987-.387t-.413-.963q0-.975.425-1.787T12.5 11.15q1.275-1.125 1.688-1.737t.412-1.338M12 22q-.825 0-1.412-.587T10 20t.588-1.412T12 18t1.413.588T14 20t-.587 1.413T12 22"/>
            </svg>
            <input {...createInventory.fields.name.as('text')} data-protonpass-ignore="true" data-lpignore="true" data-1p-ignore data-bwignore class="field inventory-name" name="name" value="New Inventory" minlength="3" placeholder="Inventory Name..." autofocus required>
            <button form="create-inventory-form">CREATE</button>
        </div>
        <div class="field-container description">
            <h1 style="pointer-events:none;user-select:none;">Description</h1>
            <textarea {...createInventory.fields.description.as('text')} placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam commodo at lacus a rhoncus. Sed in magna nisi..." spellcheck="false"></textarea>
        </div>
        <div class="field-container image">
            <h1 style="pointer-events:none;user-select:none;">Thumbnail</h1>
            <div class="image-content">
                <div style="display:flex;flex-flow:row nowrap;justify-content:flex-start;align-items:center;gap:.35rem;">
                    <label style="user-select: none;" for="image">UPLOAD</label>
                    <button title="Remove" onclick="{removeImage}">
                        <svg fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="size-6" style="visibility:{fieldFiles>0?'visible':'hidden'}">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                        </svg>
                    </button>
                </div>
                <input {...createInventory.fields.image.as('file')} name="image" id="image" accept="image/*" style="pointer-events:none;user-select:none;">
                <div class="image-preview"><img src="{imageSource}" alt="Inventory Thumbnail"
                                            style="pointer-events:none;user-select:none;opacity:{imageSource===''?'0':'1'};height:{imageSource===''?'2rem':'24rem !important'};width:{imageSource===''?'2rem':'24rem !important'};"
                                            id="thumbnail-image"></div>
            </div>
        </div>
    </form>
</section>

<style>
    .inventory-creator-page {
        width: 100vw;
        height: calc(100vh - var(--header-height));

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

            *::selection {
                color: #FFFFF2;
                background: var(--theme-text-accent);
            }

            input, textarea {
                color: var(--theme-text);
                appearance: none;
                background: none;
                border: none;
                outline: none;
                width: 32rem;
            }

            input:focus, textarea:focus {
                outline-style: none !important;
                box-shadow: none;
                appearance: none;
                caret-shape: underscore;
                caret-color: var(--theme-text);
            }

            .field-container {
                width: 62rem;
                height: fit-content;

                margin-bottom: 1rem;
                padding: 1.5rem;

                background: var(--theme-background-container);
                border: .122em solid var(--theme-border-container);
                border-radius: var(--border-radius);

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
                    position: absolute;
                    height: 1.15rem;
                    width: 1.15rem;

                    color: var(--theme-text);
                    opacity: .25;

                    transform: translateX(-.8rem);

                    cursor: pointer;

                    transition: 125ms ease-in-out;
                }

                .information-icon:hover {
                    opacity: 1;

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

                button {
                    font-family: 'FunnelDisplay', sans-serif;
                    font-size: 1.15rem;
                    font-weight: 650;

                    background: var(--theme-background-container);
                    border: .075em solid var(--theme-border-container);
                    border-radius: var(--border-radius);
                    padding: .5rem 1rem;

                    cursor: pointer;
                    user-select: none;
                }

                button:hover {
                    background: var(--theme-background-button-hover);
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

            .field-container.image {
                input {
                    visibility: hidden;
                    width: fit-content;
                }

                .image-content {
                    display: flex;
                    flex-flow: row nowrap;
                    justify-content: space-between;
                    align-items: flex-start;

                    label {
                        font-family: 'FunnelDisplay', sans-serif;

                        background: var(--theme-background-container);
                        border: .075em solid var(--theme-border-container);
                        border-radius: var(--border-radius);

                        margin-top: .75rem;
                        margin-left: .75rem;
                        padding: .5rem 1rem;

                        text-align: center;
                        height: fit-content;
                        font-weight: 550;

                        cursor: pointer;
                        user-select: none;
                    }

                    label:hover {
                        background: var(--theme-background-button-hover);
                    }

                    svg {
                        margin-top: .75rem;
                        cursor: pointer;
                        user-select: none;

                        transition: 50ms ease-in-out;
                    }

                    svg:hover {
                        color: #ff2357;
                    }

                    .image-preview {
                        background: transparent;

                        img {
                            aspect-ratio: 1/1 !important;
                            border-radius: var(--border-radius);
                            border: .075em solid var(--theme-border-container);

                            transition: 200ms ease-in-out;
                        }
                    }
                }
            }
        }
    }
</style>