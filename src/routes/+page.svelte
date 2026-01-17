<script>
    import LogoFull from '$lib/assets/logos/Logo - Icon and Text.svg'
</script>

<section>
    <img src="{LogoFull}" alt="inventar logo">
    <p>Visit <a href="https://github.com/thorbm1500/inventar">github.com/thorbm1500/inventar</a> to read more</p>
</section>

<style>
    section {
        height: 100vh;
        align-content: center;
        justify-content: center;

        img {
            width: 28rem;
            justify-self: center;
        }

        p {
            margin-top: .5em;
            color: #0d0d0d;
            font-family: 'FunnelSans','ArchivoRegular', sans-serif;
            text-align: center;
            font-size: .9em;
            font-variation-settings: "wght" 400;
        }

        p a {
            font-variation-settings: "wght" 400;
            transition-duration: 0.4s;
        }

        p a:hover {
            font-variation-settings: "wght" 600;
            transition-duration: 0.4s;
        }

        p a:active {
            font-size: 1.25em;
            transition-duration: 0.4s;
        }
    }
</style>