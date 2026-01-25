<script>
    import Header from "../Header.svelte";
    import {getInventories} from './data.remote.ts';
</script>

<Header/>

<section>
    <ul>
        {#each await getInventories() as { inventory_uuid, name, description, image }}
            <li>Name: {name}<br>
            UUID: {inventory_uuid}</li>
        {/each}
    </ul>
</section>

<style>
section {
    ul {
        li {
            color: #FFFFF2;
        }
    }
}
</style>