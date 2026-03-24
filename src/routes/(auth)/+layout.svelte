<script lang="ts">
    import '$lib/styles/index.css';

    let { children } = $props();
</script>

<div class="background"></div>

<section class="main-container dark">
    {@render children()}
</section>

<style>
    .main-container {
        height: 100vh;
        width: 100vw;
        scrollbar-width: none;
        background: var(--theme-background) !important;
        user-select: none;
    }

    .background {
        position: absolute;
        top: 85vh;
        justify-self: center;

        width: 120vw !important;
        height: 30vh;
        z-index: 0;

        animation: backgroundAnimation 10s infinite ease;
    }

    @keyframes backgroundAnimation {
        0%,100% {
            color: #6b42ff;
            opacity: .075;
            background: linear-gradient(0deg, currentColor 0%, var(--theme-background) 100%);
            filter: blur(8rem);
        }
        50% {
            color: #85adff;
            opacity: .2;
            background: linear-gradient(0deg, currentColor 0%, var(--theme-background) 100%);
            filter: blur(12rem);
        }
    }
</style>