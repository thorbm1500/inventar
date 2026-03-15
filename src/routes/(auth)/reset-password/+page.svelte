<script lang='ts'>
    import InventarLogo from '$lib/assets/logos/inventar/inventar-logo-full-width-light.svg';
    import {requestReset} from '../data.remote';
</script>

<section>
    <div class="inventar-logo">
        <img src="{InventarLogo}" alt="inventar logo"/>
    </div>
    <div class="login-form">
        <form {...requestReset}>
            <label>
                <input {...requestReset.fields.email.as('text')} placeholder="Email"/>
            </label>
            <div class="reset-form-buttons">
                <a href="/login">
                    <button class="back-button">Back</button>
                </a>
                <button class="reset-button {requestReset.result && requestReset.result.success ? 'disabled' : ''}">Request reset</button>
            </div>
        </form>
        {#if requestReset.result}
            <p class="form-message {requestReset.result.success ? 'success' : 'error'}">{requestReset.result.message ?? 'Internal Error.'}</p>
        {/if}
    </div>
</section>

<style>
    section {
        height: 100%;
        width: 100%;
        font-family: 'FunnelSans', sans-serif;

        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        gap: 1rem;

        .inventar-logo {
            margin: 0 0 1.5rem 0;

            img {
                justify-self: center;
                max-width: clamp(22rem, 26rem, 75vw);
                height: auto;
                margin: 0;
            }
        }

        .login-form {
            display: flex;
            flex-flow: column nowrap;
            justify-content: center;
            align-content: center;
            align-items: center;

            .form-message {
                margin-top: 1.25rem;
            }

            .form-message.success {
                color: greenyellow;
            }

            .form-message.error {
                color: red;
            }
        }

        form {
            display: flex;
            flex-flow: column nowrap;
            justify-content: center;
            align-items: center;

            label {
                display: flex;
                flex-flow: column nowrap;
                color: white;

                input {
                    border-radius: .6em;
                    width: 16rem;
                    margin: .15rem;
                    font-weight: 400;
                    background: #1f2023;
                    border: .122em solid #464b65;
                    outline: none;
                    color: var(--theme-color-white);
                    accent-color: var(--theme-color-accent);
                }

                input:focus {
                    outline-width: 2.5rem;
                }

                input:invalid {
                    border-color: oklch(64.5% 0.246 16.439);
                }
            }
        }

        .reset-form-buttons {
            user-select: none;
        }

        .reset-form-buttons button, .back-button {
            width: fit-content;
            margin-left: .5em;
            margin-right: .5em;
            margin-top: 1.5rem;
            padding: .35rem .8rem;
            background: oklch(0.233 0.015 279.523);
            border: .12em solid oklch(0.302 0.011 271.028);
            border-radius: .6em;
            color: var(--theme-color-white);
        }

        .reset-form-buttons .back-button:hover {
            cursor: pointer;

            background: oklch(0.281 0.02 280.925);
            border: .12em solid oklch(0.375 0.013 267.193);
            filter: drop-shadow(0 0 1em rgba(255, 255, 242, 0.04));
        }

        .reset-form-buttons .reset-button:hover {
            cursor: pointer;

            background: oklch(62.3% 0.214 259.815);
            border: .12em solid oklch(74.6% 0.16 232.661);
            filter: drop-shadow(0 0 1em rgba(from oklch(62.3% 0.214 259.815) r g b / 0.10));
        }

        .reset-button.disabled {
            pointer-events: none;
            cursor: pointer !important;
        }
    }
</style>