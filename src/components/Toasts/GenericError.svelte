<script>
    let { error = 'An Error Occurred' } = $props()
</script>

<section class="error-toast-section generic-toast-child-class">
    <div class="generic-toast-child-inner-container">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <p>{error}</p>
    </div>
</section>

<style>
    .error-toast-section {
        background: rgba(from var(--theme-toast-error-background) r g b / .65);
        border-color: var(--theme-toast-error-border);

        color: var(--theme-text);
        box-shadow: 0 0 1rem var(--theme-toast-error-glow);
    }
</style>