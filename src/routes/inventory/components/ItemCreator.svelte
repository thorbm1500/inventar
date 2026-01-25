<script>
</script>

<div class="create-item-container
    bg-container-background dark:bg-dark-container-background border-container-border dark:border-dark-container-border rounded-(--border-radius)">
    <form class="text-text-primary dark:text-dark-text-primary" autocomplete="off">
        <label for="item-name">Item Name</label>
        <input type="text" id="item-name" name="item-name" placeholder="Name"
               class="dark:bg-input-background border-button-border dark:border-input-border rounded-(--form-input-border-radius)" autofocus required/>
        <label for="description">Description</label>
        <input type="text" id="description" name="description" placeholder="Description"
               class="dark:bg-input-background border-button-border dark:border-input-border rounded-(--form-input-border-radius)"/>
        <label for="amount">Amount</label>
        <input type="number" id="amount" name="amount" value=0
               class="dark:bg-input-background border-button-border dark:border-input-border rounded-(--form-input-border-radius)" required/>
        <div class="price-section">
            <div class="price-section-input">
                <label for="price">Price</label>
                <input type="number" id="price" name="price" placeholder="0" min="0" value="0"
                       class="dark:bg-input-background border-button-border dark:border-input-border rounded-(--form-input-border-radius)"/>
            </div>
            <div class="price-section-input">
                <label for="currency">Currency</label>
                <input type="text" id="currency" name="currency" placeholder="EUR"
                       class="dark:bg-input-background border-button-border dark:border-input-border rounded-(--form-input-border-radius)"/>
            </div>
        </div>
        <label for="external">External</label>
        <input type="url" id="external" name="external" placeholder="URL"
               class="dark:bg-input-background border-button-border dark:border-input-border rounded-(--form-input-border-radius)"/>
        <div class="item-creation-buttons">
            <button type="" class="item-cancel-creation-button bg-button-background dark:bg-dark-button-background border-button-border dark:border-dark-button-border
                rounded-(--border-radius) text-text-primary dark:text-dark-text-primary">
                Cancel
            </button>
            <button type="submit" class="item-confirm-creation-button bg-button-background dark:bg-dark-button-background border-button-border dark:border-dark-button-border
                rounded-(--border-radius) text-text-primary dark:text-dark-text-primary">
                Create
            </button>
        </div>
    </form>
</div>

<style>
    .create-item-container {
        height: var(--container-full-height);
        width: 65vw;
        border-width: var(--border-width);

        margin: 0 auto;

        form {
            display: flex;
            flex-flow: column wrap;

            margin: 4rem;

            font-family: 'ArchivoRegular', sans-serif;

            #description {
                height: 3rem;
            }

            .price-section {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;

                .price-section-input:first-child {
                    flex-grow: 2;
                }

                .price-section-input {
                    display: flex;
                    flex-flow: column nowrap;
                    align-items: center;
                    flex-grow: 0;
                }
            }

            input {
                margin-top: .25rem;
                margin-bottom: 1.5rem;
            }
        }

        .item-creation-buttons {
            display: flex;
            justify-content: center;
            column-gap: .8rem;

            button {
                padding: .75rem 1.25rem;
                border-width: var(--border-width);
            }

            .item-confirm-creation-button:hover,
            .item-cancel-creation-button:hover {
                cursor: pointer;
                color: var(--dark-text-primary);
                transition-duration: 75ms;
            }

            .item-confirm-creation-button:hover {
                background-color: oklch(70.7% 0.165 254.624);
            }

            .item-cancel-creation-button:hover {
                background-color: oklch(58.6% 0.253 17.585);
            }
        }
    }
</style>