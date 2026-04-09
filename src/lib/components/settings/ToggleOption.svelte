<script module lang="ts">
    import '$lib/styles/components/customSetting.css';
</script>

<script lang="ts">
    let {title = $bindable(), settings = $bindable(), value = $bindable(), name = "name", id = "id", readonly = false} = $props();
</script>

<div class="custom-setting">
    <div class="option toggle">
        <div class="top-section">
            <h1>{title}</h1>
            {#if !readonly}
                <label class="toggle-container {value ? 'on' : ''}">
                    <!--suppress HtmlUnknownTag -->
                    <div id="toggle-slider"></div>
                    <input type="checkbox" {name} {id} class="toggle-button" bind:checked={value} hidden>
                </label>
            {:else}
                <label class="toggle-container {value ? 'on' : 'off'} disable">
                    <!--suppress HtmlUnknownTag -->
                    <div id="toggle-slider"></div>
                    <input type="checkbox" {name} {id} class="toggle-button" checked={value} disabled hidden>
                </label>
            {/if}
        </div>
    </div>
</div>