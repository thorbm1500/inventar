<script lang='ts'>
    import InventarLogo from '$lib/assets/logos/inventar/inventar-logo-full-width-light.svg';
    import {register} from '../data.remote';
</script>

<section>
    <div class="inventar-logo">
        <img src="{InventarLogo}" alt="inventar logo"/>
    </div>
    <div class="login-form">
        <form {...register}>
            <label>
                <input {...register.fields.username.as('text')} placeholder="Username" class="username-input"/>
            </label>
            <label>
                <input {...register.fields.email.as('text')} name="email" placeholder="Email" class="email-input"/>
            </label>
            <label>
                <input {...register.fields._password.as('password')} name="_password" placeholder="Password" class="password-input"/>
            </label>
            <label>
                <input {...register.fields._repeat_password.as('password')} name="_repeat_password" placeholder="Repeat Password" class="password-input"/>
            </label>
            <div class="login-form-buttons">
                <button type="submit" class="register-button">Register</button>
            </div>
        </form>
        <div class="back-to-sign-in">
            <p>Already got an account?</p>
            <a data-sveltekit-reload class="sign-in" href="/login">Sign in.</a>
        </div>
        {#if register.result }
            <p style='color: red'>{register.result.message ?? 'Message missing.'}</p>
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

            .back-to-sign-in {
                display: flex;
                flex-flow: row nowrap;
                gap: .35rem;

                p, .sign-in {
                    user-select: none;
                    margin-top: 1rem;
                    color: #51565b;

                    transition: 400ms 125ms ease;
                }

                .sign-in:hover {
                    color: var(--theme-color-white);

                    transition: 50ms ease;
                }
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

            .login-form-buttons {
                user-select: none;

                button {
                    width: fit-content;
                    margin-left: .25em;
                    margin-right: .25em;
                    margin-top: 1.5rem;
                    padding: .35rem .8rem;
                    background: oklch(0.233 0.015 279.523);
                    border: .12em solid oklch(0.302 0.011 271.028);
                    border-radius: .6em;
                    color: var(--theme-color-white);
                    cursor: pointer;
                }

                button:hover {
                    background: oklch(0.281 0.02 280.925);
                    border: .12em solid oklch(0.375 0.013 267.193);
                    filter: drop-shadow(0 0 1em rgba(255, 255, 242, 0.04));
                }

                .register-button:hover {
                    background: oklch(62.3% 0.214 259.815);
                    border: .12em solid oklch(74.6% 0.16 232.661);
                    filter: drop-shadow(0 0 1em rgba(from oklch(62.3% 0.214 259.815) r g b / 0.10));
                }
            }
        }
    }
</style>