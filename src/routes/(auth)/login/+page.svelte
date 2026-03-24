<script lang='ts'>
    import InventarLogo from '$lib/assets/logos/inventar/inventar-logo-full-width-light.svg';
    import {ignorePasswordManagers} from "$lib/util/utilities";
    import {login, validateOTP} from '../data.remote';
    import {onMount} from "svelte";
    import {blur} from "svelte/transition";
    import {cubicOut} from "svelte/easing";

    let { data } = $props();
    // svelte-ignore state_referenced_locally
    const allowRegistration = data.allowRegistration;

    let totp: string = $state('');
    let hasBeenAutoSubmitted: boolean = $state(false);

    $effect(() => {
        if (!hasBeenAutoSubmitted) {
            if (totp.length !== 6) return;

            const form = document.getElementById('validate-otp') as HTMLFormElement;
            if (!form) return;

            form.submit();
            hasBeenAutoSubmitted = true;
        }
    });

    onMount(() => {
        document.body.addEventListener('paste', (event) => {
            if (!login.result?.otp || !(event instanceof ClipboardEvent)) return;
            event.preventDefault();

            const data = event.clipboardData?.getData('text/plain') ?? null;
            if (!data) return;
            totp = data.slice(0, 6);
        });

        document.body.addEventListener('keydown', (event) => {
            if (!login.result?.otp || !(event instanceof KeyboardEvent)) return;
            const key = event.key;

            if (key.length === 1 && totp.length < 6) {
                const key = event.key;
                if (/[0-9]/.test(key)) totp += key;
                return;
            } else if (totp.length !== 0 && (key.toLowerCase() === 'backspace' || key.toLowerCase() === 'delete')) {
                totp = totp.substring(0, totp.length - 1);
            }

            if (key.toLowerCase() === 'backspace') event.preventDefault();
        })
    })

    let passwordVisible: boolean = $state(false);
    let email: string = $state('');
    let _password: string = $state('');

    let canSignIn: boolean = $derived(email.length > 9 && _password.length > 31);
</script>

<div class="background" style="opacity: {(Math.max(1, totp.length) / 60)};"></div>
<section class="dark">
    <div class="inventar-logo">
        <img src="{InventarLogo}" alt="inventar logo"/>
    </div>
    {#if !login.result?.otp}
        <div class="login-content">
            <form name="login-credentials-form" class="login-credentials-form" {...login}>
                <label>
                    <input {...login.fields.email.as('text')} bind:value={email} placeholder="Email" class="email-input" autocomplete="email"/>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 7.99999V13C16 13.7956 16.3161 14.5587 16.8787 15.1213C17.4413 15.6839 18.2043 16 19 16C19.7956 16 20.5587 15.6839 21.1213 15.1213C21.6839 14.5587 22 13.7956 22 13V12C21.9999 9.74302 21.2362 7.55247 19.8333 5.78452C18.4303 4.01658 16.4705 2.77521 14.2726 2.26229C12.0747 1.74936 9.76793 1.99503 7.72734 2.95936C5.68676 3.92368 4.03239 5.54995 3.03325 7.57371C2.03411 9.59748 1.74896 11.8997 2.22416 14.1061C2.69936 16.3125 3.90697 18.2932 5.65062 19.7263C7.39428 21.1593 9.57143 21.9603 11.8281 21.9991C14.0847 22.0379 16.2881 21.3122 18.08 19.94M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79085 9.79086 7.99999 12 7.99999C14.2091 7.99999 16 9.79085 16 12Z"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"/>
                    </svg>
                </label>
                <label>
                    <input {...login.fields._password.as(passwordVisible ? 'text' : 'password')} bind:value={_password} placeholder="Password" class="password-input" autocomplete="current-password"/>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 11V8.2C22 7.0799 22 6.51984 21.782 6.09202C21.5903 5.71569 21.2843 5.40973 20.908 5.21799C20.4802 5 19.9201 5 18.8 5H5.2C4.0799 5 3.51984 5 3.09202 5.21799C2.71569 5.40973 2.40973 5.71569 2.21799 6.09202C2 6.51984 2 7.0799 2 8.2V11.8C2 12.9201 2 13.4802 2.21799 13.908C2.40973 14.2843 2.71569 14.5903 3.09202 14.782C3.51984 15 4.0799 15 5.2 15H11M12 10H12.005M17 10H17.005M7 10H7.005M19.25 17V15.25C19.25 14.2835 18.4665 13.5 17.5 13.5C16.5335 13.5 15.75 14.2835 15.75 15.25V17M12.25 10C12.25 10.1381 12.1381 10.25 12 10.25C11.8619 10.25 11.75 10.1381 11.75 10C11.75 9.86193 11.8619 9.75 12 9.75C12.1381 9.75 12.25 9.86193 12.25 10ZM17.25 10C17.25 10.1381 17.1381 10.25 17 10.25C16.8619 10.25 16.75 10.1381 16.75 10C16.75 9.86193 16.8619 9.75 17 9.75C17.1381 9.75 17.25 9.86193 17.25 10ZM7.25 10C7.25 10.1381 7.13807 10.25 7 10.25C6.86193 10.25 6.75 10.1381 6.75 10C6.75 9.86193 6.86193 9.75 7 9.75C7.13807 9.75 7.25 9.86193 7.25 10ZM15.6 21H19.4C19.9601 21 20.2401 21 20.454 20.891C20.6422 20.7951 20.7951 20.6422 20.891 20.454C21 20.2401 21 19.9601 21 19.4V18.6C21 18.0399 21 17.7599 20.891 17.546C20.7951 17.3578 20.6422 17.2049 20.454 17.109C20.2401 17 19.9601 17 19.4 17H15.6C15.0399 17 14.7599 17 14.546 17.109C14.3578 17.2049 14.2049 17.3578 14.109 17.546C14 17.7599 14 18.0399 14 18.6V19.4C14 19.9601 14 20.2401 14.109 20.454C14.2049 20.6422 14.3578 20.7951 14.546 20.891C14.7599 21 15.0399 21 15.6 21Z"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"/>
                    </svg>
                    <button type="button" class="show-password" onclick="{() => passwordVisible = !passwordVisible}">
                        {#if passwordVisible}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                 stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/>
                                <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"/>
                            </svg>
                        {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                 stroke-linejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M21 9c-2.4 2.667 -5.4 4 -9 4c-3.6 0 -6.6 -1.333 -9 -4"/>
                                <path d="M3 15l2.5 -3.8"/>
                                <path d="M21 14.976l-2.492 -3.776"/>
                                <path d="M9 17l.5 -4"/>
                                <path d="M15 17l-.5 -4"/>
                            </svg>
                        {/if}
                    </button>
                </label>
                <div class="login-form-buttons">
                    <button type="{canSignIn ? 'submit' : 'button'}" class="theme-button {canSignIn ? '' : 'disabled'}">Login</button>
                    {#if allowRegistration}
                        <button type="button" onclick="{() => window.location.replace('/register')}" class="theme-button">
                            Register
                        </button>
                    {/if}
                </div>
            </form>
            <button type="button" onclick="{() => window.location.replace('/reset-password')}" class="forgot-password">Forgot password?</button>
        </div>
    {:else}
        <div transition:blur={{ duration: 200, amount: 5, easing: cubicOut }} class="otp-content">
            <form id="validate-otp" class="validate-otp-form" {...validateOTP}>
                <input {...validateOTP.fields.uuid.as('text')} use:ignorePasswordManagers value="{login.result?.uuid}" hidden>
                <input {...validateOTP.fields._password.as('password')} use:ignorePasswordManagers value="{_password}" hidden>
                <!-- svelte-ignore a11y_autofocus -->
                <input {...validateOTP.fields.totp.as('text')} id="one-time-code" autocomplete="one-time-code" pattern="^[0-9]?[0-9]?[0-9]?[0-9]?[0-9]?[0-9]?$" bind:value={totp}
                       style="opacity: 0;position:absolute;pointer-events:none;">
                <div class="otp-hint">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.91822 3.38565C8.40742 2.50524 10.1447 2 12 2C17.5228 2 22 6.47715 22 12C22 12.0331 21.9998 12.0662 21.9995 12.0993M3.38114 6.92585C2.50352 8.41335 2 10.1479 2 12C2 16.6596 5.18693 20.5748 9.5 21.685M20.7076 16.9206C19.3872 19.2522 17.1574 21.001 14.5 21.685M14.0893 6.37378C13.4387 6.13207 12.7348 6 12 6C8.68629 6 6 8.68629 6 12C6 12.7387 6.13351 13.4463 6.37772 14.0999M17.6251 9.90767C17.8675 10.5591 18 11.2641 18 12C18 15.3137 15.3137 18 12 18C11.2701 18 10.5707 17.8697 9.92373 17.631M12 10V14"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"/>
                    </svg>
                    Enter the 6-digit code, from your Authenticator App
                </div>
            </form>
            <div class="otp-boxes {totp.length === 6 ? 'filled' : ''}">
                <label for="totp" class="box {totp.length === 0 ? 'next' : 'filled'}">
                    {totp.charAt(0) ?? ''}
                </label>
                <label for="totp" class="box {totp.length > 1 ? 'filled' : (totp.length === 1 ? 'next' : '')}">
                    {totp.charAt(1) ?? ''}
                </label>
                <label for="totp" class="box {totp.length > 2 ? 'filled' : (totp.length === 2 ? 'next' : '')}">
                    {totp.charAt(2) ?? ''}
                </label>
                <label for="totp" class="box {totp.length > 3 ? 'filled' : (totp.length === 3 ? 'next' : '')}">
                    {totp.charAt(3) ?? ''}
                </label>
                <label for="totp" class="box {totp.length > 4 ? 'filled' : (totp.length === 4 ? 'next' : '')}">
                    {totp.charAt(4) ?? ''}
                </label>
                <label for="totp" class="box {totp.length > 5 ? 'filled' : (totp.length === 5 ? 'next' : '')}">
                    {totp.charAt(5) ?? ''}
                </label>
            </div>
            <div class="otp-response">
                {#if validateOTP.result && validateOTP.result.success === false}
                    {validateOTP?.result?.message ?? 'Internal Error'}
                {/if}
            </div>
            <div class="otp-buttons">
                <button type="button" class="theme-button" onclick="{() => {
                window.location.reload();
            }}">Back
                </button>
                <button title="" form="validate-otp" type="submit" id="submit-and-verify-otp" class="theme-button blue-hover {totp.length === 6 ? '' : 'disabled'}">
                    Verify & Continue
                </button>
            </div>
        </div>
    {/if}
</section>

<style>
    .background {
        position: absolute;
        top: 90vh;
        justify-self: center;

        width: 120vw !important;
        height: 30vh;

        background: #e5effd;
        opacity: .1;
        filter: blur(10rem);
        z-index: 0;

        transition: 400ms ease;
    }

    section {
        will-change: contents;

        height: 100%;
        width: 100%;
        font-family: 'FunnelSans', sans-serif;

        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        gap: 2rem;

        * {
            z-index: 100;
        }

        .inventar-logo {
            margin: 0 0 1.5rem 0;
            fill: var(--theme-color-base) !important;
            filter: drop-shadow(0 0 4rem rgba(from var(--theme-color-base) r g b / .2));

            pointer-events: none;

            img {
                fill: var(--theme-color-base) !important;
                justify-self: center;
                max-width: clamp(22rem, 27rem, 75vw);
                height: auto;
                margin: 0;
            }
        }

        .login-content {
            display: flex;
            flex-flow: column nowrap;
            justify-content: center;
            align-content: center;
            align-items: center;

            .login-credentials-form {
                display: flex;
                flex-flow: column nowrap;
                justify-content: center;
                align-items: center;

                label {
                    display: flex;
                    flex-flow: column nowrap;
                    color: var(--theme-text);

                    input {
                        border-radius: var(--theme-border-radius);
                        width: 16rem;
                        margin: .18rem;
                        font-family: 'FunnelSans', sans-serif;
                        font-weight: 400;
                        background: var(--theme-background-input);
                        backdrop-filter: var(--theme-backdrop-container);
                        border-width: .122em;
                        border-style: solid;
                        border-color: var(--theme-border-input);
                        accent-color: var(--theme-color-accent);

                        padding-left: 2.35rem;
                    }

                    .password-input {
                        padding-right: 2.35rem;
                    }

                    input:invalid {
                        border-color: oklch(64.5% 0.246 16.439);
                    }

                    input:focus {
                        box-shadow: none;
                        border-color: var(--theme-border-input-focus);
                    }

                    input::placeholder {
                        color: var(--theme-text-fourth);
                    }

                    svg {
                        width: 1.25rem;
                        height: 1.25rem;
                        position: absolute;

                        color: var(--theme-text-fourth);

                        transform: translate(1rem, 1rem);
                    }

                    .show-password {
                        cursor: pointer;

                        svg {
                            width: 1.25rem;
                            height: 1.25rem;

                            transform: translate(0, 0);
                        }

                        transform: translate(14.15rem, -2rem);
                    }

                    .show-password:hover {
                        svg {
                            color: var(--theme-color-second);
                            filter: brightness(1.25);
                        }
                    }
                }

                .login-form-buttons {
                    display: flex;
                    flex-flow: row nowrap;
                    align-items: center;
                    justify-content: center;

                    user-select: none;

                    button {
                        margin-left: .25rem;
                        margin-right: .25rem;
                        margin-top: 1.5rem;
                    }
                }
            }

            .forgot-password {
                user-select: none;
                margin-top: 1rem;
                color: var(--theme-text-fourth);

                cursor: pointer;
                transition: 200ms 25ms ease-out;
            }

            .forgot-password:hover {
                color: var(--theme-color-white);

                transition: 50ms ease;
            }
        }

        .otp-content {
            .otp-boxes.filled .box {
                text-shadow: 0 0 0.65rem rgba(255, 255, 255, 0.15);

                transition: var(--theme-transition-in);
            }

            .otp-boxes {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: center;
                gap: 1rem;

                transform: translateY(1rem);

                .box {
                    width: 4.5rem;
                    height: 4.5rem;

                    background: color-mix(var(--theme-background-button) 65%, transparent);
                    backdrop-filter: var(--theme-backdrop-container);

                    border-color: color-mix(var(--theme-border-input) 65%, transparent);
                    border-width: .1rem;
                    border-radius: .5rem;

                    color: var(--theme-text);
                    font-family: 'FunnelDisplay', sans-serif;
                    font-size: 2.75rem;
                    font-weight: 650;
                    text-align: center;

                    cursor: pointer;
                    caret-color: transparent;
                    appearance: none !important;
                    overflow: visible;

                    transform: rotate3d(1, 0, 0, 13deg) translateZ(1.5rem);

                    transition: var(--theme-transition-out);
                }

                .next {
                    transform: rotate3d(1, 0, 0, 13deg) translateZ(2rem);

                    transform-style: preserve-3d;
                }

                .filled {
                    transform: rotate3d(0, 0, 0, 0deg) translateZ(0);

                    transition: var(--theme-transition-out);
                }

                .box.filled, .box.next, .box:hover {
                    border-color: var(--theme-border-input-focus);

                    transition: var(--theme-transition-in);
                }

                .box:focus {
                    box-shadow: none;
                }
            }

            .otp-hint {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                gap: .25rem;
                margin-bottom: 1rem;

                color: var(--theme-text-fourth);
                font-weight: 500;

                svg {
                    width: 1.25rem;
                    height: 1.25rem;
                }
            }

            .otp-response {
                margin-top: 1.25rem;
                height: 1.75rem;

                color: var(--theme-text-danger);
                font-size: 1.1rem;
                font-weight: 600;
            }

            .otp-hint, .otp-response {
                justify-self: center;
                user-select: none;

                z-index: 150;
            }

            .otp-buttons {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: center;
                gap: .35rem;

                margin-top: 1.25rem;
            }
        }
    }
</style>