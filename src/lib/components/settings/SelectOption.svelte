<script module lang="ts">
    import '$lib/styles/components/customSetting.css';
</script>

<script lang="ts">
    let {title = $bindable(), value = $bindable(), values, size = 1, normalizeValues = false} = $props();
</script>

<div class="custom-setting">
    <div class="option select">
        <div class="top-section">
            <h1>{title}</h1>
            <select {size} bind:value>
                {#each values as value}
                    <option value={normalizeValues ? String(value).toLocaleLowerCase() : value}>
                        {value}
                    </option>
                {/each}
            </select>
        </div>
    </div>
</div>