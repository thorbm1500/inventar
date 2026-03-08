<script lang="ts">
    import {createItem} from "./data.remote"
    import { ignorePasswordManagers } from "$lib/util/utilities";
</script>

<section class="item-creator-section">
    <h1 class="item-creator-title">Item Creator
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480">
            <path d="M450 210h-98l84.9-49a30 30 0 1 0-30-52l-85 49 49-84.9a30 30 0 0 0-52-30l-48.9 85V30a30 30 0 1 0-60 0v98l-49-84.9a30 30 0 1 0-52 30l49 85-84.9-49a30 30 0 0 0-30 52l85 48.9H30a30 30 0 1 0 0 60h98l-84.9 49a30 30 0 1 0 30 52l85-49-49 84.9a30 30 0 0 0 52 30l48.9-85V450a30 30 0 1 0 60 0v-98l49 84.9a30 30 0 1 0 52-30l-49-85 84.9 49a30 30 0 0 0 30-52l-85-48.9H450a30 30 0 1 0 0-60Z"
                  fill="currentColor"></path>
        </svg>
    </h1>
    <form {...createItem}>
        <div class="form-field">
            <h1>Name</h1>
            <input {...createItem.fields.name.as('text')} placeholder="Required." use:ignorePasswordManagers required/>
        </div>
        <div class="form-field">
            <h1>Description</h1>
            <textarea {...createItem.fields.description.as('text')} placeholder="Optional" use:ignorePasswordManagers></textarea>
        </div>
        <div class="form-field">
            <h1>Amount</h1>
            <input {...createItem.fields.amount.as('number')} min="0" value="0" placeholder="Required." use:ignorePasswordManagers required/>
        </div>
    </form>
</section>

<style>
    .item-creator-section {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: flex-start;

        padding-top: 4rem;
        margin: 0 calc(50vw - 40rem);

        overflow-y: scroll;
        scrollbar-width: none;

        width: 80rem;
        height: 100vh;

        .item-creator-title {
            align-self: flex-start !important;

            font-family: 'FunnelDisplay', sans-serif;
            font-size: 2rem;
            font-weight: 750;
            color: var(--theme-text);

            margin-left: 2.5rem;

            svg {
                position: absolute;
                height: 6rem;
                transform: translateY(-4.25rem) translateX(-2.5rem);
                opacity: .1;
            }
        }

        form {
            display: flex;
            flex-flow: column nowrap;
            align-items: center;
            justify-content: center;
            gap: .5rem;

            width: 100%;

            .form-field {
                h1 {
                    font-family: 'FunnelDisplay', sans-serif;
                    font-weight: 600;
                    margin-left: .5rem;

                    color: var(--theme-text);
                }
            }

            input, textarea {
                width: 35rem;

                border-color: transparent;
                border-bottom-color: rgba(from var(--theme-text-third) r g b / .5);
                border-width: .15rem;
                border-radius: .5rem;

                background: var(--theme-background-container);
                color: var(--theme-text);
                backdrop-filter: blur(2px) brightness(.75);

                font-family: 'FunnelSans', sans-serif;
                font-weight: 500;

                resize: none;
                appearance: none;

                transition: border-bottom-color 200ms ease;
            }

            textarea {
                height: fit-content;
                min-height: 10rem;
                max-height: 16rem;

                scrollbar-color: var(--theme-text-accent) transparent;
                scrollbar-width: thin;
            }

            input:focus, textarea:focus {
                box-shadow: none;
                border-bottom-color: var(--theme-text-accent);

                transition: border-bottom-color 75ms ease;
            }

            input:focus::placeholder, textarea:focus::placeholder {
                color: var(--theme-text-accent);
            }

            input::placeholder {
                font-style: italic;
            }
        }
    }
</style>