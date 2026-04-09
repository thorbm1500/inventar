<script module lang="ts">
    import '$lib/styles/components/customSetting.css';
    import {ignorePasswordManagers} from "$lib/util/utilities";
</script>

<script lang="ts">
    let {title = $bindable(), settings = $bindable(), value = $bindable(), placeholder = "", readonly = false, type = "", name = "name", id = "id"} = $props();
</script>

<div class="custom-setting">
    {#if !readonly}
        <div class="option">
            <h1>{title}</h1>
            <input {type} bind:value {name} {id} use:ignorePasswordManagers {placeholder} spellcheck="false" />
        </div>
    {:else}
        <div class="option readonly">
            <h1>{title}</h1>
            <div class="readonly-container select-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                </svg>
                {value}
            </div>
        </div>
    {/if}
</div>