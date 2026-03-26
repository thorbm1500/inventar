<script lang="ts">
    import {createItem} from './data.remote';
    import {ignorePasswordManagers} from '$lib/util/utilities';
    import type {Label} from '$lib/server/db/components/labels';
    import {onMount} from "svelte";
    import type {Unit} from "$lib/server/db/components/units";
    import {blur} from "svelte/transition";

    let {data} = $props();

    // svelte-ignore state_referenced_locally
    const currencies = data.currencies;
    let currentCurrency: string = $state('DKK');
    let currentPriceFormat = $derived(currencies.get(currentCurrency) ?? '%value%');
    let currentPrice = $derived(createItem.fields.price.value() ?? 0);

    const units: Unit[] = $derived.by(() => {
        const types: Unit[] = [];
        for (const unit of data.units) {
            if (unit.type !== selectedUnitType) continue;
            types.push(unit);
        }
        return types;
    });

    const unit_types: string[] = $derived.by(() => {
        const types: string[] = [];
        for (const unit of data.units) {
            if (!types.includes(unit.type)) types.push(unit.type);
        }
        return types;
    });

    // svelte-ignore state_referenced_locally
    let selectedUnitType: string = $state(unit_types[0]);
    // svelte-ignore state_referenced_locally
    let selectedUnit: string = $state(units[0].unit);

    $effect(() => {
        for (const unit of units) {
            if (unit.unit === selectedUnit) return;
        }
        selectedUnit = units[0].unit;
    });

    interface SelectableLabels extends Label {
        selected: boolean
    }

    const inventoryLabels: SelectableLabels[] = $state([]);

    // svelte-ignore state_referenced_locally
    for (const label of data.labels) {
        inventoryLabels.push({...label, selected: false});
    }

    createItem.fields.set({
        amount: 0,
        price: 0.0
    });

    let imageSource = $state('');
    let fieldFiles = $state(0);

    onMount(() => {
        const imageField: HTMLInputElement = document.getElementById("image-field") as HTMLInputElement;
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
        const imageField: HTMLInputElement = document.getElementById("image-field") as HTMLInputElement;
        if (!imageField) return;

        imageField.value = "";
        imageSource = '';
        fieldFiles = 0;
    }
</script>

<section class="item-creator-page">
    <section class="item-creator-section">
        <h1 class="item-creator-title">Item Creator
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480">
                <path d="M450 210h-98l84.9-49a30 30 0 1 0-30-52l-85 49 49-84.9a30 30 0 0 0-52-30l-48.9 85V30a30 30 0 1 0-60 0v98l-49-84.9a30 30 0 1 0-52 30l49 85-84.9-49a30 30 0 0 0-30 52l85 48.9H30a30 30 0 1 0 0 60h98l-84.9 49a30 30 0 1 0 30 52l85-49-49 84.9a30 30 0 0 0 52 30l48.9-85V450a30 30 0 1 0 60 0v-98l49 84.9a30 30 0 1 0 52-30l-49-85 84.9 49a30 30 0 0 0 30-52l-85-48.9H450a30 30 0 1 0 0-60Z"
                      fill="currentColor"></path>
            </svg>
        </h1>
        <!--todo: Enhance, and validate form-->
        <form {...createItem} enctype="multipart/form-data">
            <div class="field">
                <h1 class="name">Name</h1>
                <input class="input required{(createItem.fields.name.value()?.length ?? 0) < 3 ? ' notice' : ''}" {...createItem.fields.name.as('text')} placeholder="{data.namePlaceholder}"
                       use:ignorePasswordManagers required/>
            </div>
            <div class="field">
                <h1 class="name">Description</h1>
                <textarea class="input" {...createItem.fields.description.as('text')} placeholder="{data.descriptionPlaceholder}" use:ignorePasswordManagers></textarea>
            </div>
            <div class="multiple-fields">
                <div class="field">
                    <h1 class="name">Amount</h1>
                    <input class="input required{createItem.fields.amount.value() === undefined ? ' notice' : ''}" {...createItem.fields.amount.as('number')} min="0" value="0" placeholder="Required"
                           required/>
                </div>
                <div class="field">
                    <h1 class="name">Type</h1>
                    <select class="input required" {...createItem.fields.unit_type.as('select')} bind:value={selectedUnitType} required>
                        {#each unit_types as type}
                            <option value="{type}">{type}</option>
                        {/each}
                    </select>
                </div>
                <div class="field">
                    <h1 class="name">Unit</h1>
                    <select class="input required" {...createItem.fields.unit.as('select')} bind:value={selectedUnit} required>
                        {#each units as {unit}}
                            <option value="{unit}">{unit}</option>
                        {/each}
                    </select>
                </div>
            </div>
            <div class="field">
                <h1 class="name">Part Number</h1>
                <input class="input" {...createItem.fields.part_number.as('text')} placeholder="{data.partNumberPlaceholder}" use:ignorePasswordManagers/>
            </div>
            <div class="multiple-fields">
                <div class="field">
                    <h1 class="name">Price</h1>
                    <div class="formatted-price">
                        <p class="hidden-text">{currentPrice}</p>
                        <p class="format">{currentPriceFormat.replace('%value%', '')}</p>
                    </div>
                    <input class="input price" {...createItem.fields.price.as('number')} min="0" step="0.5" bind:value={currentPrice}/>
                </div>
                <div class="field">
                    <h1 class="name">Currency</h1>
                    <select class="input" {...createItem.fields.currency.as('select')} bind:value={currentCurrency}>
                        {#each currencies.keys() as code}
                            <option value="{code}">{code}</option>
                        {/each}
                    </select>
                </div>
            </div>
            <div class="field">
                <h1 class="name">External URL</h1>
                <input class="input" {...createItem.fields.url.as('url')} placeholder="{data.urlPlaceholder}" use:ignorePasswordManagers/>
            </div>
            <div class="field">
                <!--todo: Add image preview, and general styling-->
                <h1 class="name">Image</h1>
                <div class="image-content">
                    <div class="image-container">
                        <label for="image-field" class="image-box">
                            {#if createItem.fields.image.value() !== undefined && fieldFiles > 0}
                                <img transition:blur|global src="{imageSource}" alt="User Upload"/>
                            {:else}
                                <svg in:blur width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 21H20.0104C20.9816 21 21.4671 21 21.7348 20.7975C21.968 20.6211 22.1123 20.3515 22.1297 20.0596C22.1497 19.7246 21.8804 19.3205 21.3417 18.5125L18.3313 13.9969C17.8862 13.3292 17.6636 12.9954 17.3831 12.8791C17.1378 12.7773 16.8622 12.7773 16.6169 12.8791C16.3364 12.9954 16.1139 13.3292 15.6687 13.9969L14.9245 15.1132M19 21L11.3155 9.90018C10.8736 9.26182 10.6526 8.94264 10.3766 8.83044C10.1351 8.73228 9.8649 8.73228 9.62344 8.83044C9.34742 8.94264 9.12645 9.26182 8.68451 9.90018L2.73822 18.4893C2.17519 19.3025 1.89368 19.7092 1.90971 20.0473C1.92366 20.3419 2.06688 20.6152 2.30109 20.7943C2.57002 21 3.06459 21 4.05373 21H19ZM21 6C21 7.65685 19.6569 9 18 9C16.3432 9 15 7.65685 15 6C15 4.34315 16.3432 3 18 3C19.6569 3 21 4.34315 21 6Z"
                                          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <p in:blur>Upload Image</p>
                            {/if}
                        </label>
                    </div>
                    <div class="image-actions">
                        <div class="action-buttons">
                            <label class="theme-button" for="image-field">
                                Upload
                            </label>
                            <button class="theme-button{fieldFiles>0?'':' disabled'} delete" type="button" onclick={removeImage} title="">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M20 6a1 1 0 0 1 .117 1.993l-.117 .007h-.081l-.919 11a3 3 0 0 1 -2.824 2.995l-.176 .005h-8c-1.598 0 -2.904 -1.249 -2.992 -2.75l-.005 -.167l-.923 -11.083h-.08a1 1 0 0 1 -.117 -1.993l.117 -.007zm-10 4a1 1 0 0 0 -1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0 -1 -1m4 0a1 1 0 0 0 -1 1v6a1 1 0 0 0 2 0v-6a1 1 0 0 0 -1 -1"/>
                                    <path d="M14 2a2 2 0 0 1 2 2a1 1 0 0 1 -1.993 .117l-.007 -.117h-4l-.007 .117a1 1 0 0 1 -1.993 -.117a2 2 0 0 1 1.85 -1.995l.15 -.005z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="upload-info">
                            <h3>Accepted Extensions</h3>
                            <p>PNG • JPEG • WEBP • AV1</p>
                        </div>
                        <div class="upload-info">
                            <h3>Max File Size</h3>
                            <p>50MB</p> <!--todo: Get from Application Settings-->
                        </div>
                    </div>
                </div>
                <input id="image-field" {...createItem.fields.image.as('file')} accept="image/*" hidden/>
            </div>
            <div class="field">
                <!--todo: Add box for adding from existing labels-->
                <!--todo: General layout and styling-->
                <h1 class="name">Labels</h1>
                <div class="label-container">
                    {#if inventoryLabels.length === 0}
                        <p class="empty-label-container">This inventory does not have any labels yet.</p>
                    {:else}
                        <button class="add-label-button" title="" type="button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                 stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/>
                                <path d="M9 12h6"/>
                                <path d="M12 9v6"/>
                            </svg>
                        </button>
                        {#each inventoryLabels as label}
                            <button type="button" onclick="{() => label.selected = !label.selected}"
                                    class="label {label.color}{label.selected ? ' selected' : ''}">{label.name}</button>
                        {/each}
                    {/if}
                </div>
            </div>
            <button class="theme-button" type="submit">Create</button>
        </form>
    </section>
</section>

<style>
    .item-creator-page {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: flex-start;

        width: 100vw;
        height: 100vh;

        user-select: none;
    }

    .item-creator-section {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: flex-start;

        overflow: visible;
        overflow-x: hidden;
        scrollbar-width: none;

        width: 80vw;
        min-width: 32rem;
        max-width: 94rem;

        height: fit-content;

        padding-top: 8rem;

        .item-creator-title {
            align-self: flex-start !important;

            font-family: 'FunnelDisplay', sans-serif;
            font-size: 2rem;
            font-weight: 750;
            color: var(--theme-text);

            margin-left: 2.5rem;
            position: absolute;

            svg {
                position: absolute;
                height: 6rem;
                transform: translateY(-4.35rem) translateX(-2.15rem);
                opacity: .1;
            }
        }

        form {
            display: flex;
            flex-flow: column nowrap;
            align-items: center;
            justify-content: center;
            gap: .75rem;

            width: 100%;
            max-width: 54rem;

            padding: 4rem 0;

            button {
                align-self: start;
            }

            .field {
                width: 100%;

                .name {
                    font-family: 'FunnelDisplay', sans-serif;
                    font-size: 1.2rem;
                    font-weight: 800;
                    margin-left: .5rem;
                    margin-bottom: .1rem;

                    color: var(--theme-text);
                }

                .input {
                    width: 100%;

                    border-color: transparent;
                    border-bottom-color: rgba(from var(--theme-text-third) r g b / .5);
                    border-width: .15rem;
                    border-radius: .5rem;

                    background: var(--theme-background-container);
                    color: var(--theme-text);
                    backdrop-filter: blur(2px) brightness(.75);

                    font-family: 'FunnelSans', sans-serif;
                    font-weight: 600;

                    resize: none;
                    appearance: none;
                    user-select: none;

                    transition: border-bottom-color 200ms ease;
                }

                .input:focus {
                    box-shadow: none;
                    border-bottom-color: var(--theme-color-accent);

                    transition: border-bottom-color 75ms ease;
                }

                .input::placeholder {
                    transition: opacity 80ms ease;
                }

                .input:focus::placeholder {
                    opacity: 0;

                    transition: opacity 50ms ease;
                }

                .input.notice {
                    border-bottom-color: var(--theme-color-notice) !important;
                }

                .formatted-price {
                    position: relative;
                    display: flex;
                    flex-flow: row nowrap;
                    gap: .5rem;

                    overflow: visible;
                    height: 0;

                    font-family: 'FunnelSans', sans-serif;
                    font-weight: 600;
                    z-index: 10;

                    pointer-events: none;
                    transform: translate(.88rem, .6rem);

                    .format {
                        position: sticky;
                        color: var(--theme-text);
                    }

                    .hidden-text {
                        position: sticky;
                        color: transparent;
                    }
                }

                .image-content {
                    display: flex;
                    flex-flow: row nowrap;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 2rem;

                    .image-container {
                        padding: .5rem;

                        .image-box {
                            display: flex;
                            flex-flow: column nowrap;
                            align-items: center;
                            justify-content: center;
                            gap: .25rem;

                            width: 16rem;
                            height: 16rem;

                            border: .15rem solid var(--theme-border-container);
                            border-radius: var(--theme-border-radius);

                            filter: drop-shadow(0 0 .5rem rgba(from var(--theme-border-container) r g b / 15%));

                            font-size: .9rem;
                            font-weight: 650;
                            color: var(--theme-color-second);

                            svg {
                                width: 2rem;
                                height: 2rem;
                            }

                            img {
                                position: absolute;

                                height: auto !important;
                                width: 100% !important;
                            }
                        }
                    }

                    .image-actions {
                        display: flex;
                        flex-flow: column nowrap;
                        align-items: flex-start;
                        justify-content: center;

                        font-weight: 700;
                        color: var(--theme-text-fourth);

                        .action-buttons {
                            display: flex;
                            flex-flow: row nowrap;
                            align-items: center;
                            justify-content: flex-start;
                            gap: .35rem;

                            .theme-button.delete:hover {
                                color: var(--theme-color-danger) !important;
                            }
                        }

                        .upload-info {
                            margin-top: .5rem;
                            padding-left: .25rem;

                            h3 {
                                font-size: .95rem;
                            }

                            p {
                                font-size: .75rem;
                            }
                        }
                    }
                }

                .label-container {
                    display: flex;
                    flex-flow: row;
                    align-items: center;
                    justify-content: flex-start;
                    gap: .5rem;

                    padding: 1rem;

                    .add-label-button {
                        cursor: pointer;

                        svg {
                            color: var(--theme-color-second);
                        }
                    }

                    .add-label-button:hover {
                        svg {
                            color: var(--theme-color-base);
                        }
                    }

                    .label {
                        font-size: .9rem;
                        filter: brightness(.5);

                        transition: filter 100ms ease;
                    }

                    .label.selected {
                        filter: brightness(1);

                        transition: filter 40ms ease;
                    }
                }

                .empty-label-container {
                    padding: 1.75rem;
                    text-align: center;
                    color: var(--theme-text-fourth);
                }
            }

            .multiple-fields {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: space-between;

                margin-bottom: .5rem;

                width: 100%;

                .field:first-child {
                    padding-right: .25rem;
                }

                .field:last-child {
                    padding-left: .25rem;
                }

                .field {
                    margin-bottom: 0;
                }
            }

            textarea {
                height: fit-content;
                min-height: 10rem;
                max-height: 16rem;

                scrollbar-color: var(--theme-color-accent) transparent;
                scrollbar-width: thin;
            }
        }
    }
</style>