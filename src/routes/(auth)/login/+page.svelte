<script lang='ts'>
    import InventarLogo from '$lib/assets/logos/inventar/inventar-logo-full-width-light.svg';
    import {login} from "../data.remote";
</script>

<section class="dark">
    <div class="inventar-logo">
        <img src="{InventarLogo}" alt="inventar logo" />
    </div>
    <div class="login-form">
        <form {...login}>
            <label>
                <input {...login.fields.email.as('text')} placeholder="Email" class="email-input" autocomplete="email"/>
            </label>
            <label>
                <input {...login.fields._password.as('password')} placeholder="Password" class="password-input" autocomplete="current-password"/>
            </label>
            <div class="login-form-buttons">
                <button type="submit" class="login-button">Login</button>
                <a href="/register">
                    <button class="">Register</button>
                </a>
            </div>
        </form>
        <a data-sveltekit-reload class="forgot-password" href="/reset-password">Forgot password?</a>
        {#if login.result}
            <p style='color: red'>{login.result.message ?? ''}</p>
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
        gap: 2rem;

        .inventar-logo {
            margin: 0 0 1.5rem 0;
            fill: #FFFFF2 !important;

            img {
                fill: #FFFFF2 !important;
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
                    border-radius: var(--theme-border-radius);
                    width: 16rem;
                    margin: .18rem;
                    font-family: 'FunnelSans', sans-serif;
                    font-weight: 400;
                    background: #14161c;
                    border-width: .122em;
                    border-style: solid;
                    border-color: #505779;
                    color: #FFFFF2;
                    accent-color: var(--theme-text-accent);
                }

                input:invalid {
                    border-color: oklch(64.5% 0.246 16.439);
                }

                input:focus {
                    box-shadow: none;
                    border-color: var(--theme-border-input-focus);
                }
            }

            .login-form-buttons {
                user-select: none;

                button {
                    width: fit-content;
                    margin-left: .25rem;
                    margin-right: .25rem;
                    margin-top: 1.5rem;
                    padding: .35rem .8rem;
                    background: #14161c;
                    border: var(--theme-border-width) solid #505779;
                    border-radius: var(--theme-border-radius);
                    color: #FFFFF2;
                    pointer-events: all;
                }

                button:hover {
                    cursor: pointer;

                    background: #1b1e28;
                    filter: drop-shadow(0 0 .25rem rgba(255, 255, 242, 0.02));
                }
            }
        }

        .forgot-password {
            user-select: none;
            margin-top: 1rem;
            color: #51565b;

            transition: 250ms 75ms ease;
        }

        .forgot-password:hover {
            color: #FFFFF2;

            transition: 50ms ease;
        }
    }
</style>