<script module>
    import {createInventory} from "./data.remote.ts";
</script>

<script lang="ts">

</script>

<section class="inventory-creator-page">
    <form {...createInventory} id="create-inventory-form" encType="multipart/form-data">
        <div class="field-container name">
            <input {...createInventory.fields.name.as('text')} class="field inventory-name" name="name" value="New Inventory" placeholder="Inventory Name..." required>
            <button form="create-inventory-form">CREATE</button>
        </div>
        <div class="field-container description">
            <h1>Description</h1>
            <textarea {...createInventory.fields.description.as('text')} placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."></textarea>
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

            label {
                display: flex;
                flex-flow: column nowrap;
                margin: 1rem;

                font-family: 'FunnelSans', sans-serif;
                color: var(--theme-text);
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
                outline: none;
                border: none;
                outline-color: transparent;
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
            }

            .field-container.description {
                display: flex;
                flex-flow: column nowrap;
                align-items: flex-start;

                h1 {
                    padding-left: .75rem;
                    font-family: 'FunnelDisplay', sans-serif;
                    font-size: 2rem;
                    font-weight: 700;
                }

                textarea {
                    min-height: 12rem !important;
                    width: 58rem;
                    margin-bottom: 1rem;
                }
            }
        }
    }
</style>