<script>
    import Header from "../Header.svelte";
    import {getInventories} from './data.remote.ts';
</script>

<Header/>

<section>
    <ul>
        {#each await getInventories() as { inventory_uuid, name, description, image }}
            <li><a href='/inventory/{inventory_uuid}' target='_parent'>Inventory {name}</a></li>
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