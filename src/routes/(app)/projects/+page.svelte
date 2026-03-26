<script lang="ts">
    import {getContext, hasContext, onDestroy, onMount} from "svelte";

    onMount(() => {
        if (hasContext('set_page_title')) (getContext('set_page_title') as Function)('Projects');
        const resetPageInfo: Function | undefined = getContext('reset_page_info');
        if (resetPageInfo) onDestroy(() => resetPageInfo());
    });
</script>