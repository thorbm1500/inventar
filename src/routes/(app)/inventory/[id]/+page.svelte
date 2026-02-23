<script module lang="ts">
    //todo: Add logic to archive deleted items for 30 days to allow for recovery of deleted items
    //todo: After above is implemented, add option to permanently delete any archived item.

    const confirmItemCreationIcons: string[] = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-cube-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M21 12.5v-4.509a1.98 1.98 0 0 0 -1 -1.717l-7 -4.008a2.016 2.016 0 0 0 -2 0l-7 4.007c-.619 .355 -1 1.01 -1 1.718v8.018c0 .709 .381 1.363 1 1.717l7 4.008a2.016 2.016 0 0 0 2 0" /><path d="M12 22v-10" /><path d="M12 12l8.73 -5.04" /><path d="M3.27 6.96l8.73 5.04" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-prism-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 9v13" /><path d="M13.02 21.655a1.7 1.7 0 0 1 -2.04 0l-5.98 -4.485a2.5 2.5 0 0 1 -1 -2v-11.17a1 1 0 0 1 1 -1h14a1 1 0 0 1 1 1v8" /><path d="M4.3 3.3l6.655 5.186a1.7 1.7 0 0 0 2.09 0l6.655 -5.186" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-sphere-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12c0 1.657 4.03 3 9 3c1.116 0 2.185 -.068 3.172 -.192m5.724 -2.35a1.1 1.1 0 0 0 .104 -.458" /><path d="M20.984 12.546a9 9 0 1 0 -8.442 8.438" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-diabolo-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6a8 3 0 1 0 16 0a8 3 0 1 0 -16 0" /><path d="M4 6v.143a1 1 0 0 0 .048 .307l1.952 5.55l-1.964 5.67a1 1 0 0 0 -.036 .265v.065c0 1.657 3.582 3 8 3c.17 0 .34 -.002 .508 -.006m5.492 -8.994l1.952 -5.55a1 1 0 0 0 .048 -.307v-.143" /><path d="M6 12c0 1.105 2.686 2 6 2s6 -.895 6 -2" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-frustum-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12.841 21.309a1.945 1.945 0 0 1 -1.682 0l-7.035 -3.365a1.99 1.99 0 0 1 -1.064 -2.278l2.538 -10.158a1.98 1.98 0 0 1 1.11 -1.328l4.496 -2.01a1.95 1.95 0 0 1 1.59 0l4.496 2.01c.554 .246 .963 .736 1.112 1.328l1.67 6.683" /><path d="M18 4.82l-5.198 2.324a1.963 1.963 0 0 1 -1.602 0l-5.2 -2.325" /><path d="M12 7.32v14.18" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-pyramid-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18.719 11.985l-5.889 -9.539a.999 .999 0 0 0 -1.664 0l-8.54 13.836a1.005 1.005 0 0 0 .386 1.452l8.092 4.054a1.994 1.994 0 0 0 1.789 0l.149 -.074" /><path d="M12 2v20" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-cylinder-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 6a7 3 0 1 0 14 0a7 3 0 1 0 -14 0" /><path d="M5 6v12c0 1.657 3.134 3 7 3c.173 0 .345 -.003 .515 -.008m6.485 -8.992v-6" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-hemisphere-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 9a9 3 0 1 0 18 0a9 3 0 1 0 -18 0" /><path d="M3 9a9 9 0 0 0 9 9m8.396 -5.752a8.978 8.978 0 0 0 .604 -3.248" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-octahedron-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M21.498 12.911l.206 -.208a.984 .984 0 0 0 0 -1.407l-8.845 -8.948a1.233 1.233 0 0 0 -1.718 0l-8.845 8.949a.984 .984 0 0 0 0 1.407l8.845 8.949a1.234 1.234 0 0 0 1.718 -.001l.08 -.081" /><path d="M2 12c.004 .086 .103 .178 .296 .246l8.845 2.632c.459 .163 1.259 .163 1.718 0l2.634 -.784m5.41 -1.61l.801 -.238c.195 -.07 .294 -.156 .296 -.243" /><path d="M12 2.12v19.76" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-hexagonal-prism-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20.792 6.996l-3.775 2.643a2.005 2.005 0 0 1 -1.147 .361h-7.74c-.41 0 -.81 -.126 -1.146 -.362l-3.774 -2.641" /><path d="M8 10v11" /><path d="M16 10v3.5" /><path d="M21 12.5v-5.131c0 -.655 -.318 -1.268 -.853 -1.643l-3.367 -2.363a2 2 0 0 0 -1.147 -.363h-7.266c-.41 0 -.811 .126 -1.147 .363l-3.367 2.363a2.006 2.006 0 0 0 -.853 1.644v9.261c0 .655 .318 1.269 .853 1.644l3.367 2.363a2 2 0 0 0 1.147 .362h4.133" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-hexagonal-pyramid-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18.642 12.04l-5.804 -9.583a.996 .996 0 0 0 -1.676 0l-7.846 12.954a1.988 1.988 0 0 0 .267 2.483l2.527 2.523c.374 .373 .88 .583 1.408 .583h4.982" /><path d="M12 2l-5 18.9" /><path d="M12 2l3.304 12.489" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-rectangular-prism-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M21 12.5v-3.509a1.98 1.98 0 0 0 -1 -1.717l-4 -2.008a2.016 2.016 0 0 0 -2 0l-10 5.007c-.619 .355 -1 1.01 -1 1.718v5.018c0 .709 .381 1.363 1 1.717l4 2.008a2.016 2.016 0 0 0 2 0l2.062 -1.032" /><path d="M9 21v-7.5" /><path d="M9 13.5l11.5 -5.5" /><path d="M3.5 11l5.5 2.5" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-irregular-polyhedron-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 12l1.752 -6.13a1 1 0 0 0 -.592 -1.205l-6.282 -2.503a2.46 2.46 0 0 0 -1.756 0l-6.282 2.503a1 1 0 0 0 -.592 1.204l1.752 6.131l-1.752 6.13a1 1 0 0 0 .592 1.205l6.282 2.503a2.46 2.46 0 0 0 1.756 0l.221 -.088" /><path d="M4.5 5.5l6.622 2.33a2.35 2.35 0 0 0 1.756 0l6.622 -2.33" /><path d="M6 12l5.21 1.862a2.34 2.34 0 0 0 1.58 0l5.21 -1.862" /><path d="M12 22v-14" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`,
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-database-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6c0 1.657 3.582 3 8 3s8 -1.343 8 -3s-3.582 -3 -8 -3s-8 1.343 -8 3" /><path d="M4 6v6c0 1.657 3.582 3 8 3c1.075 0 2.1 -.08 3.037 -.224" /><path d="M20 12v-6" /><path d="M4 12v6c0 1.657 3.582 3 8 3c.166 0 .331 -.002 .495 -.006" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`
    ];
</script>

<script lang="ts">
    import type {PageProps} from './$types';
    import {getContext, onMount} from "svelte";
    import {page} from "$app/state";
    import type {Inventory, Item, User} from "$lib/server/db/interfaces";
    import {parseTimestamp} from '$lib/utilities'
    import {getItems, getTotalItemCount} from './data.remote.ts';
    import Utility from "../../browse/utility";
    import {createItem} from './data.remote.ts';
    import {deleteItem, updatePrimaryIvnentory} from "./data.remote";
    import {Filters} from "./FilterHandler.svelte";

    let {data}: PageProps = $props();

    const user: User = $state(getContext('user'));
    //todo: Add option to save filters, and make them persistent for the user.
    const filters: Filters = new Filters(user.uuid);

    let addItemHover = $state(false);

    // svelte-ignore state_referenced_locally
    let inventory: Inventory = $state(data.inventory);

    onMount(async () => {
        const openItemCreatorButtonElement = document.getElementById('create-item-button');
        openItemCreatorButtonElement?.addEventListener('mouseover', () => addItemHover = true);
        openItemCreatorButtonElement?.addEventListener('mouseout', () => addItemHover = false);
    })

    let isItemCreatorOpen: boolean = $state(false);
    let itemCreatorConfirmCreationButtonIcon = $state(getRandomIcon());
    let isFilterContainerOpen: boolean = $state(false);

    /* Item Container*/
    let currentPage = $state(1);

    let offset = $derived(filters.rowAmount * (currentPage - 1));

    //todo: Update to respect inventory settings, in terms of amount, ordering, etc.
    let items: Item[] = $derived(await getItems({inventory: inventory.uuid, amount: filters.rowAmount, order_by: filters.current, order: filters.order, offset}));
    let itemCount: number = $derived(await getTotalItemCount(inventory.uuid));
    let totalPages = $derived(Math.max(1, Math.ceil(itemCount / filters.rowAmount) ?? 1));

    async function goToFirstPage() {
        currentPage = 1;
    }

    async function goToLastPage() {
        currentPage = totalPages;
    }

    async function updatePage(pageChange: number = 0) {
        currentPage += pageChange;
        if (currentPage < 1) currentPage = 1;
        else if (currentPage > totalPages) currentPage = totalPages;
    }

    async function refresh() {
        await getTotalItemCount(inventory.uuid).refresh();
        await getItems({inventory: inventory.uuid, amount: filters.rowAmount, order_by: filters.current, order: filters.order, offset}).refresh();
    }

    const latestIcons: number[] = [99, 99, 99];

    function getRandomIcon(): string {
        let next: number = 99;

        while (next === 99 || latestIcons?.includes(next)) {
            next = Math.floor(Math.random() * (14));
        }

        latestIcons?.shift();
        latestIcons?.push(next);
        return confirmItemCreationIcons[next];
    }
</script>

<div class="page-content">
    <div class="body-section">
        <section class="inventory-outer-section">
            <section class="inventory-section">
                <section class="inventory-header-section">
                    <div class="inventory-header-content">
                        <div class="inventory-name">
                            <h1>{inventory.name}</h1>
                            <button class="primary-inventory-bookmark-icon" onclick="{() =>{
                                updatePrimaryIvnentory({user:user.uuid,inventory:user.primary_inventory === inventory.uuid ? undefined : inventory.uuid});
                                user.primary_inventory = user.primary_inventory === inventory.uuid ? '' : inventory.uuid;
                            }}">
                                {#if user.primary_inventory === inventory.uuid }
                                    <svg style="color:var(--theme-text-accent);" width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="currentColor" fill-rule="evenodd"
                                              d="M21 11.098v4.993c0 3.096 0 4.645-.734 5.321c-.35.323-.792.526-1.263.58c-.987.113-2.14-.907-4.445-2.946c-1.02-.901-1.529-1.352-2.118-1.47a2.2 2.2 0 0 0-.88 0c-.59.118-1.099.569-2.118 1.47c-2.305 2.039-3.458 3.059-4.445 2.945a2.24 2.24 0 0 1-1.263-.579C3 20.736 3 19.188 3 16.091v-4.994C3 6.81 3 4.666 4.318 3.333S7.758 2 12 2s6.364 0 7.682 1.332S21 6.81 21 11.098M8.25 6A.75.75 0 0 1 9 5.25h6a.75.75 0 0 1 0 1.5H9A.75.75 0 0 1 8.25 6"
                                              clip-rule="evenodd"/>
                                    </svg>
                                {:else}
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <g fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 16.09v-4.992c0-4.29 0-6.433-1.318-7.766C18.364 2 16.242 2 12 2S5.636 2 4.318 3.332S3 6.81 3 11.098v4.993c0 3.096 0 4.645.734 5.321c.35.323.792.526 1.263.58c.987.113 2.14-.907 4.445-2.946c1.02-.901 1.529-1.352 2.118-1.47c.29-.06.59-.06.88 0c.59.118 1.099.569 2.118 1.47c2.305 2.039 3.458 3.059 4.445 2.945c.47-.053.913-.256 1.263-.579c.734-.676.734-2.224.734-5.321Z"/>
                                            <path stroke-linecap="round" d="M15 6H9" opacity="0.5"/>
                                        </g>
                                    </svg>
                                {/if}
                            </button>
                        </div>
                        <div class="header-buttons">
                            <button id="filters-button" class="theme-button filters-button {isFilterContainerOpen?'open':''}" title="Filters" onclick={() => {
                                isItemCreatorOpen = false;
                                isFilterContainerOpen = !isFilterContainerOpen;

                                if (!isItemCreatorOpen) {
                                    document.getElementById('item-creator-form-reset-button')?.click();
                                }
                            }}>
                                {#if isFilterContainerOpen}
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <g fill="currentColor">
                                            <path d="M19.396 11.056a6 6 0 0 1-5.647 10.506q.206-.21.396-.44a8 8 0 0 0 1.789-6.155a8.02 8.02 0 0 0 3.462-3.911m-14.787-.005a7.99 7.99 0 0 0 9.386 4.698a6 6 0 1 1-9.534-4.594z"/>
                                            <path d="M12 2a6 6 0 1 1-6 6l.004-.225A6 6 0 0 1 12 2"/>
                                        </g>
                                    </svg>
                                {:else}
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                            <path d="M7 8a5 5 0 1 0 10 0A5 5 0 1 0 7 8"/>
                                            <path d="M8 11a5 5 0 1 0 3.998 1.997"/>
                                            <path d="M12.002 19.003A5 5 0 1 0 16 11"/>
                                        </g>
                                    </svg>
                                {/if}
                                Filters
                            </button>
                            <button id="create-item-button" class="theme-button create-item-button {isItemCreatorOpen?'open':''}" onclick={() => {
                                isFilterContainerOpen = false;
                                isItemCreatorOpen = !isItemCreatorOpen;

                                if (!isItemCreatorOpen) {
                                    document.getElementById('item-creator-form-reset-button')?.click();
                                }}}>
                                {#if isItemCreatorOpen || addItemHover}
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="currentColor"
                                              d="M2 10.96a.985.985 0 0 1-.37-1.37L3.13 7c.11-.2.28-.34.47-.42l7.83-4.4c.16-.12.36-.18.57-.18s.41.06.57.18l7.9 4.44c.19.1.35.26.44.46l1.45 2.52c.28.48.11 1.09-.36 1.36l-1 .58v4.96c0 .38-.21.71-.53.88l-7.9 4.44c-.16.12-.36.18-.57.18s-.41-.06-.57-.18l-7.9-4.44A.99.99 0 0 1 3 16.5v-5.54c-.3.17-.68.18-1 0m10-6.81v6.7l5.96-3.35zM5 15.91l6 3.38v-6.71L5 9.21zm14 0v-3.22l-5 2.9c-.33.18-.7.17-1 .01v3.69zm-5.15-2.55l6.28-3.63l-.58-1.01l-6.28 3.63z"/>
                                    </svg>
                                {:else}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                         stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-package">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5"/>
                                        <path d="M12 12l8 -4.5"/>
                                        <path d="M12 12l0 9"/>
                                        <path d="M12 12l-8 -4.5"/>
                                        <path d="M16 5.25l-8 4.5"/>
                                    </svg>
                                {/if}
                                Add Item
                            </button>
                            <button id="refresh-button" class="theme-button refresh-button" title="Refresh" onclick="{async () => await refresh()}">
                                <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
                                </svg>
                            </button>
                            <button id="inventory-settings-button" class="theme-button inventory-settings-button" title="Settings"
                                    onclick="{() => window.location.href=`/inventory/${inventory.uuid}/settings`}">
                                <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                          d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </section>
                {#if isFilterContainerOpen }
                    <div class="extra-container {isFilterContainerOpen?'open':'closed'} inventory-filter-container">
                        <div class="header" style="display:flex;flex-flow:row nowrap;align-items:center;justify-content:space-between;">
                            <h1>Filters</h1>
                            <button class="filters-save-button {filters.unsavedChanges ? 'new' : 'default' }" title="Save Filters">
                                <svg width="16" height="16" fill="currentColor" class="bi bi-floppy-fill" viewBox="0 0 16 16">
                                    <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0H3v5.5A1.5 1.5 0 0 0 4.5 7h7A1.5 1.5 0 0 0 13 5.5V0h.086a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5H14v-5.5A1.5 1.5 0 0 0 12.5 9h-9A1.5 1.5 0 0 0 2 10.5V16h-.5A1.5 1.5 0 0 1 0 14.5z"/>
                                    <path d="M3 16h10v-5.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5zm9-16H4v5.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5zM9 1h2v4H9z"/>
                                </svg>
                            </button>
                        </div>
                        <section class="filters">
                            <div class="filter columns">
                                <div style="display:flex;flex-flow:row nowrap;gap:.2rem;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                         stroke-linejoin="round" class="lucide lucide-table2-icon lucide-table-2">
                                        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                                    </svg>
                                    <h1>Columns</h1>
                                </div>
                                <div class="buttons">
                                    <button class="extra-container-button price filter-button {filters.price ? '' : 'off'}"
                                            style="order:{filters.price ? 1 : 101};display:flex;flex-flow:row nowrap;align-items:center;"
                                            onclick={() => {
                                                filters.price = !filters.price;
                                                filters.reset();
                                            }}>
                                        {#if filters.price }
                                            <svg width="24" height="24" viewBox="0 0 24 24">
                                                <path fill="currentColor"
                                                      d="M12 9a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M3.18 12a9.821 9.821 0 0 0 17.64 0a9.821 9.821 0 0 0-17.64 0"/>
                                            </svg>
                                        {:else}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                      d="M21 9q-3.6 4-9 4T3 9m0 6l2.5-3.8M21 14.976L18.508 11.2M9 17l.5-4m5.5 4l-.5-4"/>
                                            </svg>
                                        {/if}
                                        Prices
                                    </button>
                                    <button class="extra-container-button last-updated filter-button {filters.last_updated ? '' : 'off'}"
                                            style="order:{filters.last_updated ? 2 : 102};display:flex;flex-flow:row nowrap;align-items:center;"
                                            onclick={() => {
                                                filters.last_updated = !filters.last_updated;
                                                filters.reset();
                                            }}>
                                        {#if filters.last_updated }
                                            <svg width="24" height="24" viewBox="0 0 24 24">
                                                <path fill="currentColor"
                                                      d="M12 9a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M3.18 12a9.821 9.821 0 0 0 17.64 0a9.821 9.821 0 0 0-17.64 0"/>
                                            </svg>
                                        {:else}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                      d="M21 9q-3.6 4-9 4T3 9m0 6l2.5-3.8M21 14.976L18.508 11.2M9 17l.5-4m5.5 4l-.5-4"/>
                                            </svg>
                                        {/if}
                                        Last Updated
                                    </button>
                                    <button class="extra-container-button description filter-button {filters.description ? '' : 'off'}"
                                            style="order:{filters.description ? 3 : 103};display:flex;flex-flow:row nowrap;align-items:center;"
                                            onclick={() => {
                                                filters.description = !filters.description
                                                filters.reset();
                                            }}>
                                        {#if filters.description }
                                            <svg width="24" height="24" viewBox="0 0 24 24">
                                                <path fill="currentColor"
                                                      d="M12 9a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M3.18 12a9.821 9.821 0 0 0 17.64 0a9.821 9.821 0 0 0-17.64 0"/>
                                            </svg>
                                        {:else}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                      d="M21 9q-3.6 4-9 4T3 9m0 6l2.5-3.8M21 14.976L18.508 11.2M9 17l.5-4m5.5 4l-.5-4"/>
                                            </svg>
                                        {/if}
                                        Description
                                    </button>
                                </div>
                            </div>
                            <div class="filter row-amount" style="display:flex;flex-flow:column nowrap">
                                <div style="display:flex;flex-flow:row nowrap;">
                                    <svg width="24" height="24" viewBox="0 0 24 24">
                                        <path fill="currentColor"
                                              d="M8 5.5h8a3 3 0 0 0 3-3a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5a3 3 0 0 0 3 3m8 13H8a3 3 0 0 0-3 3a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5a3 3 0 0 0-3-3"
                                              opacity="0.5"/>
                                        <path fill="currentColor"
                                              d="M5 11.5c0-1.886 0-2.828.586-3.414S7.114 7.5 9 7.5h6c1.886 0 2.828 0 3.414.586S19 9.614 19 11.5v1c0 1.886 0 2.828-.586 3.414S16.886 16.5 15 16.5H9c-1.886 0-2.828 0-3.414-.586S5 14.386 5 12.5z"/>
                                    </svg>
                                    <h1>Row Amount</h1>
                                </div>
                                <div style="display:flex;flex-flow:row nowrap;gap:.25rem;">
                                    <button onclick={() => filters.rowAmount = 15} class="extra-container-button filter-button row-amount {filters.rowAmount === 15 ? 'selected' : ''}">
                                        15
                                    </button>
                                    <button onclick={() => filters.rowAmount = 30} class="extra-container-button filter-button row-amount {filters.rowAmount === 30 ? 'selected' : ''}">
                                        30
                                    </button>
                                    <button onclick={() => filters.rowAmount = 45} class="extra-container-button filter-button row-amount {filters.rowAmount === 45 ? 'selected' : ''}">
                                        45
                                    </button>
                                    <button onclick={() => filters.rowAmount = 60} class="extra-container-button filter-button row-amount {filters.rowAmount === 60 ? 'selected' : ''}">
                                        60
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                {:else if isItemCreatorOpen }
                    <div class="extra-container {isItemCreatorOpen?'open':'open'} create-item-container" id="create-item-container" style="display:flex;flex-flow:column nowrap;">
                        <form {...createItem} id="item-creator-form" class="item-creator-form" autocomplete="off" enctype="multipart/form-data">
                            <button type="reset" id="item-creator-form-reset-button" title="Reset form" hidden></button>
                            <input {...createItem.fields.user.as('text')} value="{user?.uuid??'x'}" data-protonpass-ignore="true" data-lpignore="true" data-1p-ignore data-bwignore hidden
                                   required/>
                            <input {...createItem.fields.inventoryUuid.as('text')} value="{page.params?.id??'x'}" data-protonpass-ignore="true" data-lpignore="true" data-1p-ignore data-bwignore hidden
                                   required/>
                            <div class="options-top-section" style="display:flex;flex-flow:row nowrap;justify-content:space-between;">
                                <div class="option-container" style="width:52rem;">
                                    <h1>Name</h1>
                                    <input style="width:100%;" {...createItem.fields.name.as('text')} placeholder="Item Name..." data-protonpass-ignore="true" data-lpignore="true"
                                           data-1p-ignore data-bwignore required/>
                                </div>
                                <div class="option-container">
                                    <h1>Amount</h1>
                                    <input {...createItem.fields.amount.as('number')} value=0 required/>
                                </div>
                            </div>
                        </form>
                        <div style="display:flex;flex-flow:row nowrap;align-items:center;justify-content:flex-start;gap:.4rem;margin:.5rem 0;">
                            <button form="item-creator-form" type="submit" class="theme-button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                     stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-sandbox">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M19.953 8.017l1.047 6.983v2a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-2l1.245 -8.297a2 2 0 0 1 1.977 -1.703h3.778"/>
                                    <path d="M3 15h18"/>
                                    <path d="M13 3l5.5 1.5"/>
                                    <path d="M15.75 3.75l-2 7"/>
                                    <path d="M7 10.5c1.667 -.667 3.333 -.667 5 0c1.667 .667 3.333 .667 5 0"/>
                                </svg>
                                Open Creator
                            </button>
                            <button onmouseenter="{() => itemCreatorConfirmCreationButtonIcon = getRandomIcon() }"
                                    onfocus="{() => itemCreatorConfirmCreationButtonIcon = getRandomIcon() }"
                                    form="item-creator-form" type="submit" class="theme-button confirm-creation-button" id="confirm-creation-button">
                                {@html itemCreatorConfirmCreationButtonIcon }
                                Quick Add
                            </button>
                        </div>
                    </div>
                {/if}
                <section class="inventory-body-section">
                    <div class="inventory-list-container">
                        <div class="inventory-header">
                            <div class="header-items">
                                <div class="header-item name-filter">
                                    <button id="name-filter-button" title="Filter by name"
                                            onclick={async () => filters.update('name')}>
                                        Name
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6 { filters.current === 'name' ? 'auto-hide-filter-icon' : '' }">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="{Utility.getFilterSymbol(filters.current==='name'?filters.order:'')}"/>
                                        </svg>
                                    </button>
                                </div>
                                {#if filters.last_updated }
                                    <div class="header-item latest-change-filter">
                                        <button id="latest-change-filter-button" title="Filter by latest update"
                                                onclick={async () => filters.update('last_updated')}>
                                            Last Updated
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6 { filters.current === 'last_updated' ? 'auto-hide-filter-icon' : '' }"
                                                 style="opacity:0;">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="{Utility.getFilterSymbol(filters.current==='last_updated'?filters.order:'')}"/>
                                            </svg>
                                        </button>
                                    </div>
                                {/if}
                                {#if filters.price }
                                    <div class="header-item price-filter">
                                        <button id="price-filter-button" title="Filter by item price"
                                                onclick={async () => filters.update('price')}>
                                            Price
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6 { filters.current === 'price' ? 'auto-hide-filter-icon' : '' }" style="opacity:0;">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="{Utility.getFilterSymbol(filters.current==='price'?filters.order:'')}"/>
                                            </svg>
                                        </button>
                                    </div>
                                {/if}
                                <div class="header-item items-filter">
                                    <button id="items-filter-button" title="Filter by item amount"
                                            onclick={async () => filters.update('items')}>
                                        Items
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" class="size-6 { filters.current === 'items' ? 'auto-hide-filter-icon' : '' }" style="opacity:0;">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="{Utility.getFilterSymbol(filters.current==='items'?filters.order:'')}"/>
                                        </svg>
                                    </button>
                                </div>
                                <div class="item-manage-spacer"></div>
                            </div>
                        </div>
                        <div class="inventory-list">
                            {#if inventory }
                                {#if items.length > 0 }
                                    {#each items as item}
                                        <a data-sveltekit-preload-data="tap" href='/' target='_parent' style="height:5.5rem;"
                                           class="inventory-list-entry">
                                            <div class="entry-item inventory-meta">
                                                <div class="inventory-image">
                                                    {#if item.image }
                                                        <img src='/src/lib/assets/uploads/item-images/{item.image}' alt="Item Thumbnail">
                                                    {:else }
                                                        <svg fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="size-6">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                  d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/>
                                                        </svg>
                                                    {/if}
                                                </div>
                                                <div class="inventory-name-and-description">
                                                    <h1 class="inventory-name">{item.name}</h1>
                                                    <span class="line-clamp-2">
                                                        {#if filters.description}
                                                            {#if item.description}
                                                                {item.description}
                                                            {:else}
                                                                No description has been set.
                                                            {/if}
                                                        {/if}
                                                    </span>
                                                </div>
                                            </div>
                                            {#if filters.last_updated }
                                                <div class="entry-item inventory-item-last_change">
                                                    {parseTimestamp(item?.last_update)}
                                                </div>
                                            {/if}
                                            {#if filters.price }
                                                <div class="entry-item inventory-item-price">
                                                    {item.currency_format.replace('%value%', String(item.price ?? 0))}
                                                </div>
                                            {/if}
                                            <div class="entry-item inventory-item-amount">
                                                {item.amount}
                                            </div>
                                            <div class="quick-delete">
                                                <!-- todo - Add popup warning to confirm deletion -->
                                                <button title="Delete Item" onclick="{() => {
                                                    deleteItem(item.uuid);
                                                }}">
                                                    <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </a>
                                    {/each}
                                {:else}
                                    <div class="empty-inventory-list">
                                        <span class="text-theme-text-third">
                                            {#if navigator.onLine }
                                                There are no items in this inventory yet. Add your first item now!
                                            {:else}
                                                No internet found. Reconnect to browse inventory.
                                            {/if}
                                        </span>
                                    </div>
                                {/if}
                            {:else}
                                <div class="inventory-list-loading">
                                    <div class="spinner">
                                        <svg width="24" height="24" viewBox="0 0 24 24">
                                            <rect width="10" height="10" x="1" y="1" fill="currentColor" rx="1">
                                                <animate id="SVG7WybndBt" fill="freeze" attributeName="x" begin="0;SVGo3aOUHlJ.end" dur="0.2s" values="1;13"/>
                                                <animate id="SVGVoKldbWM" fill="freeze" attributeName="y" begin="SVGFpk9ncYc.end" dur="0.2s" values="1;13"/>
                                                <animate id="SVGKsXgPbui" fill="freeze" attributeName="x" begin="SVGaI8owdNK.end" dur="0.2s" values="13;1"/>
                                                <animate id="SVG7JzAfdGT" fill="freeze" attributeName="y" begin="SVG28A4To9L.end" dur="0.2s" values="13;1"/>
                                            </rect>
                                            <rect width="10" height="10" x="1" y="13" fill="currentColor" rx="1">
                                                <animate id="SVGUiS2jeZq" fill="freeze" attributeName="y" begin="SVG7WybndBt.end" dur="0.2s" values="13;1"/>
                                                <animate id="SVGU0vu2GEM" fill="freeze" attributeName="x" begin="SVGVoKldbWM.end" dur="0.2s" values="1;13"/>
                                                <animate id="SVGOIboFeLf" fill="freeze" attributeName="y" begin="SVGKsXgPbui.end" dur="0.2s" values="1;13"/>
                                                <animate id="SVG14lAaeuv" fill="freeze" attributeName="x" begin="SVG7JzAfdGT.end" dur="0.2s" values="13;1"/>
                                            </rect>
                                            <rect width="10" height="10" x="13" y="13" fill="currentColor" rx="1">
                                                <animate id="SVGFpk9ncYc" fill="freeze" attributeName="x" begin="SVGUiS2jeZq.end" dur="0.2s" values="13;1"/>
                                                <animate id="SVGaI8owdNK" fill="freeze" attributeName="y" begin="SVGU0vu2GEM.end" dur="0.2s" values="13;1"/>
                                                <animate id="SVG28A4To9L" fill="freeze" attributeName="x" begin="SVGOIboFeLf.end" dur="0.2s" values="1;13"/>
                                                <animate id="SVGo3aOUHlJ" fill="freeze" attributeName="y" begin="SVG14lAaeuv.end" dur="0.2s" values="1;13"/>
                                            </rect>
                                        </svg>
                                    </div>
                                </div>
                            {/if}
                        </div>
                        <div class="inventory-footer">
                            <div class="inventory-footer-items">
                                <button class="pagination-back-button pagination-button" style="visibility: { currentPage === 1 ? 'hidden' : 'visible' }"
                                        onclick={async () => { await goToFirstPage() } } title="Switch to previous page">
                                    <svg width="19" height="19" viewBox="0 0 16 16">
                                        <path fill="currentColor" fill-rule="evenodd"
                                              d="M7.721 2.22a.75.75 0 0 1 1.061 1.06L4.061 8.002l4.721 4.721a.75.75 0 0 1-1.06 1.061L2.47 8.532a.75.75 0 0 1 0-1.06L7.722 2.22Zm5 0a.75.75 0 0 1 1.061 1.06L9.061 8.002l4.721 4.721a.75.75 0 0 1-1.06 1.061L7.47 8.532a.75.75 0 0 1 0-1.06z"
                                              clip-rule="evenodd"/>
                                    </svg>
                                </button>
                                <button class="pagination-back-button pagination-button{ currentPage === 1 ? ' disabled' : '' }"
                                        onclick={async () => { await updatePage(-1) } } title="Switch to previous page">
                                    <svg width="19" height="19" viewBox="0 0 16 16">
                                        <path fill="currentColor" fill-rule="evenodd"
                                              d="M10.78 2.22a.75.75 0 0 0-1.06 0L4.468 7.472a.75.75 0 0 0 0 1.06l5.252 5.252a.75.75 0 1 0 1.06-1.06L6.06 8.001l4.72-4.721a.75.75 0 0 0 0-1.06"
                                              clip-rule="evenodd"/>
                                    </svg>
                                </button>
                                <p class="pagination-current-page">
                                    {currentPage}
                                </p>
                                <button class="pagination-forward-button pagination-button{ currentPage === totalPages ? ' disabled' : '' }"
                                        onclick={async () => { await updatePage(1) } } title="Switch to next page">
                                    <svg width="19" height="19" viewBox="0 0 16 16">
                                        <path fill="currentColor" fill-rule="evenodd"
                                              d="M5.22 2.22a.75.75 0 0 1 1.06 0l5.252 5.252a.75.75 0 0 1 0 1.06L6.28 13.784a.75.75 0 1 1-1.06-1.06l4.72-4.723L5.22 3.28a.75.75 0 0 1 0-1.06"
                                              clip-rule="evenodd"/>
                                    </svg>
                                </button>
                                <button class="pagination-forward-button pagination-button" style="visibility: { currentPage === totalPages ? 'hidden' : 'visible' }"
                                        onclick={async () => { await goToLastPage() } } title="Switch to next page">
                                    <svg width="19" height="19" viewBox="0 0 16 16">
                                        <path fill="currentColor" fill-rule="evenodd"
                                              d="M3.53 2.22a.75.75 0 0 0-1.06 1.06l4.72 4.722l-4.72 4.721a.75.75 0 0 0 1.06 1.061l5.252-5.252a.75.75 0 0 0 0-1.06zm5 0a.75.75 0 0 0-1.06 1.06l4.721 4.722l-4.721 4.721a.75.75 0 0 0 1.06 1.061l5.252-5.252a.75.75 0 0 0 0-1.06z"
                                              clip-rule="evenodd"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </section>
        </section>
    </div>
</div>

<style>
    :root {
        --inventory-header-height: 6rem;
    }

    .auto-hide-filter-icon {
        opacity: 0;

        transition: 1750ms 500ms ease-in-out,
        transform 0ms;
    }

    .body-section {
        height: var(--theme-max-page-height);
        overflow: hidden;
        box-sizing: border-box;
        width: 100%;
        position: absolute;
        top: var(--theme-height-header);
        z-index: 10;
    }

    .inventory-outer-section {
        max-height: 100%;
        overflow: auto;
        overflow-y: scroll;
        overflow-x: hidden;
        scrollbar-width: none;
    }

    .inventory-section {
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        align-content: center;

        width: 100vw;
        height: fit-content;

        .inventory-header-section {
            display: flex;
            flex-flow: column nowrap;
            align-items: center;
            align-content: center;
            margin: .5rem 0;

            width: 100%;

            z-index: 1000;

            .inventory-header-content {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                align-content: center;
                justify-content: space-between;

                padding: 2rem 0;
                margin: 0;

                width: 80rem;

                .inventory-name {
                    display: flex;
                    flex-flow: row nowrap;
                    align-items: center;
                    justify-content: flex-start;
                    overflow: visible;
                    user-select: none;

                    h1 {
                        font-size: 2.25rem;
                        font-family: 'FunnelDisplay', sans-serif;
                        font-variation-settings: "wght" 800;
                        color: var(--theme-text);
                    }

                    .primary-inventory-bookmark-icon {
                        svg {
                            stroke-width: 2.5;
                            height: 1.75rem;
                            width: 1.75rem;
                            color: var(--theme-text);
                            align-self: center;
                            margin-left: .35rem;
                            padding-top: .1em;
                            cursor: pointer;
                        }

                        .primary-inventory-icon {
                            color: var(--theme-text-accent);
                        }
                    }

                    .primary-inventory-bookmark-icon:hover {
                        svg {
                            color: var(--theme-text-accent);
                        }
                    }
                }

                .header-buttons {
                    display: flex;
                    flex-flow: row nowrap;
                    gap: .5rem;

                    .refresh-button, .inventory-settings-button {
                        padding: .5em 1em !important;
                    }

                    .filters-button.open, .create-item-button.open {
                        color: var(--theme-text-accent);
                        fill: var(--theme-text-accent);

                        transition: var(--theme-transition-in);
                    }

                    .refresh-button, .filters-button, .create-item-button, .inventory-settings-button {
                        stroke-width: 1.8;
                        transition: var(--theme-transition-out);
                    }

                    .refresh-button:hover, .filters-button:hover, .create-item-button:hover, .inventory-settings-button:hover {
                        stroke-width: 2.25;

                        transition: var(--theme-transition-in);
                    }

                    .refresh-button, .inventory-settings-button {
                        svg {
                            transform: rotate(0deg);
                            transition-duration: 500ms;
                            transition-timing-function: cubic-bezier(.5, .5, -.1, 3) !important;
                        }
                    }

                    .refresh-button:hover {
                        svg {
                            transform: rotate(360deg);
                            transition-duration: 250ms;
                            transition-timing-function: cubic-bezier(1, .4, .4, 1) !important;
                        }
                    }

                    .refresh-button:active {
                        svg {
                            transform: rotate(580deg);
                            transition-duration: 50ms;
                            transition-timing-function: cubic-bezier(.25, .4, .1, 2) !important;
                        }
                    }
                }
            }
        }

        .extra-container {
            display: flex;
            flex-flow: column wrap;
            justify-content: flex-start;

            width: 90rem;
            opacity: 0;
            margin-top: 0;
            margin-bottom: 2.5rem;
            height: 0;

            transition: 125ms ease-in-out;

            background: var(--theme-background-container);
            border-color: var(--theme-border-container);
            border-width: var(--theme-border-width);
            border-radius: var(--theme-border-radius);

            .header {
                h1 {
                    font-size: 1.7rem;
                    font-family: 'FunnelDisplay', sans-serif;
                    font-weight: 650;
                    color: var(--theme-text);
                    margin-bottom: 1rem;
                }
            }

            .extra-container-button {
                background: var(--theme-background-button);
                border: var(--theme-border-width) solid var(--theme-border-button);
                border-radius: var(--theme-border-radius);
                padding: .75rem 1.5rem;

                color: var(--theme-text);
                font-size: 1rem;
                font-weight: 700;

                gap: .25rem;

                cursor: pointer;
                user-select: none;

                transition: filter 100ms ease-in-out;
            }

            .extra-container-button:hover {
                background: var(--theme-background-button-hover);
            }

            .extra-container-button:active {
                transform: scale(0.975);
            }
        }

        .extra-container.open {
            padding: 1.75rem 2.5rem;
            visibility: visible;
            height: fit-content;
            opacity: 1;
        }

        .extra-container.closed {
            visibility: hidden;
            margin-top: 0;
            opacity: 0;
        }

        .extra-container.create-item-container {
            display: flex;
            align-items: flex-start;
            align-content: center;

            color: var(--theme-text);
            font-family: 'FunnelDisplay', sans-serif;

            form {
                width: 100%;

                input, option, select, textarea {
                    background: var(--theme-background-input);
                    border: var(--theme-border-width) solid var(--theme-border-input);
                    border-radius: var(--theme-border-radius);
                    margin-bottom: .25rem;

                    font-family: 'FunnelSans', sans-serif;
                    color: var(--theme-text);
                    caret-shape: underscore;
                    caret-color: var(--theme-text);

                    transition: border-color var(--theme-transition-out);

                    resize: none;
                }

                input:focus, option:focus, select:focus, textarea:focus {
                    box-shadow: none;
                    border-color: var(--theme-border-input-focus);

                    transition: border-color var(--theme-transition-in),
                    box-shadow 0ms linear;
                }

                .option-container:first-child {
                    width: 100% !important;
                    margin-right: .35rem;
                }

                .option-container:last-child {
                    margin-left: .35rem;
                }

                .option-container {
                    h1 {
                        font-size: 1.1rem;
                        margin-top: .5rem;
                        margin-bottom: .25rem;
                    }
                }
            }
        }

        .extra-container.inventory-filter-container {
            .header {
                .filters-save-button {
                    svg {
                        width: 1.75rem;
                        height: 1.75rem;
                        color: var(--theme-text);
                    }
                }

                .filters-save-button.default {
                    svg {
                        color: var(--theme-text-third);
                        opacity: .5;
                    }
                }

                .filters-save-button.new {
                    cursor: pointer;

                    svg {
                        color: var(--theme-text);
                    }
                }

                .filters-save-button.new:hover {
                    svg {
                        color: var(--theme-text-accent);
                    }
                }
            }

            .filters {
                display: flex;
                flex-flow: row wrap;
                align-items: center;
                justify-content: flex-start;
                width: 100%;
                height: fit-content;

                .filter {
                    flex: 1;
                    align-items: center;
                    color: var(--theme-text);
                    font-family: 'Google Sans', sans-serif;

                    .filter-button.off {
                        filter: saturate(.5) opacity(.5);
                        transition: filter 100ms ease-in-out;
                    }
                }

                .filter h1 {
                    font-weight: 600;
                    font-size: 1.1rem;
                    margin-bottom: .3rem;
                }

                .filter.columns {
                    .buttons {
                        display: flex;
                        flex-flow: row wrap;
                        justify-content: flex-start;
                        gap: .25rem;
                    }
                }

                .filter.row-amount {
                    align-items: flex-start;
                    justify-content: flex-start;

                    .row-amount.selected {
                        background: var(--theme-background-button-selected);
                    }
                }
            }
        }

        .inventory-body-section {
            user-select: none !important;

            .inventory-list-container {
                width: 90rem;
                height: fit-content;
                box-sizing: border-box;

                background: var(--theme-background-container);

                border: var(--theme-border-width) solid var(--theme-border-container);
                border-radius: var(--theme-border-radius);

                color: var(--theme-text);

                margin: 0 0 4rem 0;

                .inventory-header {
                    border-color: transparent;
                    border-bottom-color: inherit;
                    border-width: var(--theme-border-width);
                    width: 100%;
                    height: 3rem !important;

                    .header-items {
                        display: flex;
                        flex-flow: row nowrap;
                        margin-top: .75em;
                        margin-bottom: .75em;

                        .item-manage-spacer {
                            flex: 1 5%;
                        }

                        .header-item:first-child {
                            flex: 1 68%;
                        }

                        .header-item.items-filter {
                            flex: 1 7%;
                        }

                        .header-item {
                            flex: 1 10%;

                            display: flex;
                            flex-flow: row nowrap;
                            justify-content: center;

                            font-family: 'FunnelSans', sans-serif;
                            font-weight: 600;

                            button {
                                display: flex;
                                flex-flow: row nowrap;
                                justify-content: flex-end;

                                cursor: pointer;

                                transition: 400ms 100ms ease-in-out;

                                svg {
                                    height: 1.25rem;
                                    align-self: center;
                                    stroke-width: 2;
                                    transition: 125ms ease-in-out,
                                    transform 0ms;
                                    position: fixed;
                                    transform: translateX(1.5rem);
                                }
                            }

                            button:hover {
                                svg {
                                    stroke-width: 2.5;
                                    transition: 125ms ease-in-out;
                                }

                                svg.auto-hide-filter-icon {
                                    opacity: 1 !important;

                                    transition: 100ms ease-in-out,
                                    transform 0ms;
                                }
                            }
                        }
                    }
                }

                .inventory-list {
                    display: flex;
                    flex-flow: column nowrap;
                    justify-content: flex-start;
                    height: fit-content;

                    .empty-inventory-list {
                        display: flex;
                        align-content: center;
                        align-items: center;
                        justify-content: center;
                        height: 12rem;

                        span {
                            margin: auto;
                            font-size: 1.05rem;
                        }
                    }

                    .inventory-list-loading {
                        display: flex;
                        align-content: center;
                        align-items: center;
                        justify-content: center;
                        height: 12rem;

                        .spinner {
                            height: 3rem;
                            width: 3rem;

                            svg {
                                height: 100%;
                                width: 100%;
                            }
                        }
                    }

                    .inventory-list-entry:first-child {
                        border-top-color: transparent;
                    }

                    .inventory-list-entry:nth-of-type(odd) {
                        background: var(--theme-background-list-odd);
                    }

                    .inventory-list-entry {
                        width: 100%;

                        display: flex;
                        flex-flow: row nowrap;
                        justify-content: center;
                        align-items: center;
                        align-content: center;

                        background: var(--theme-background-list-even);
                        border-style: solid;
                        border-width: var(--theme-border-width);
                        border-top-color: var(--theme-border-container);
                        border-bottom-color: transparent;
                        border-left-color: transparent;
                        border-right-color: transparent;

                        font-family: 'FunnelSans', sans-serif;

                        z-index: 20;

                        .quick-delete {
                            flex: 1 5%;
                            align-items: center;
                            opacity: 0;

                            transition: 200ms 100ms;
                            transition-timing-function: cubic-bezier(0.57, 0.1, 0.25, 1.5) !important;
                            user-select: none;

                            z-index: 25;

                            button {
                                cursor: pointer;
                                width: 2.25rem;
                                height: 2.25rem;

                                svg {
                                    justify-self: center;
                                    stroke: var(--theme-text);
                                    width: 100%;
                                    height: 100%;

                                    padding: .5em .25em;

                                    background: var(--theme-background-button);
                                    border: .122em solid var(--theme-border-button);
                                    border-radius: .7em;
                                    transition: 50ms ease-in-out;
                                }
                            }

                            button:hover {
                                svg {
                                    background: var(--theme-background-button-hover);
                                    stroke: oklch(58.6% 0.253 17.585) !important;
                                    stroke-width: 2.25;
                                    transition: 50ms ease-out;
                                }
                            }
                        }

                        .entry-item.inventory-item-amount {
                            flex: 1 7%;
                        }

                        .entry-item:first-child {
                            flex: 1 68%;
                        }

                        .entry-item {
                            flex: 1 10%;
                        }

                        .inventory-meta {
                            display: flex;
                            flex-flow: row nowrap;
                            align-items: center;

                            .inventory-image {
                                display: flex;
                                align-items: center;
                                justify-content: center;

                                width: 5rem;
                                height: 5rem;

                                svg {
                                    width: 2.5rem;
                                    height: 2.5rem;
                                    transition: 1400ms ease;
                                }

                                img {
                                    width: 100%;
                                    height: 100%;
                                    border-radius: var(--theme-border-radius);

                                    transition: 400ms ease;
                                }

                                img:hover {
                                    transform: scale(1.75);
                                    border-radius: .2em;

                                    transition: 50ms ease;
                                }
                            }

                            .inventory-name-and-description {
                                display: flex;
                                flex-flow: column nowrap;
                                justify-content: flex-start;
                                align-content: flex-start;
                                max-width: 54rem;

                                h1 {
                                    font-weight: 700;
                                    font-size: 1.5rem;
                                    max-width: 50rem;
                                    line-clamp: 1 !important;
                                    text-overflow: ellipsis;
                                    overflow: hidden;
                                    text-wrap: nowrap;
                                }

                                span {
                                    font-size: 0.85rem;
                                    color: var(--theme-text-third);
                                    line-clamp: 2 !important;
                                    text-overflow: ellipsis;
                                    max-width: 50rem;
                                    overflow: hidden;

                                    transition: 450ms 100ms ease-in-out;
                                }
                            }
                        }

                        .inventory-item-price {
                            text-align: center;
                        }

                        .inventory-item-amount {
                            text-align: center;
                        }

                        .inventory-item-last_change {
                            text-align: center;
                        }
                    }

                    .inventory-list-entry:hover {
                        background: var(--theme-background-button-hover);

                        .quick-delete {
                            opacity: 1;
                            transition: 50ms;
                            transition-timing-function: cubic-bezier(0.57, 0.1, 0.25, 1.5) !important;

                            svg {
                                stroke: var(--theme-text);
                            }
                        }

                        .inventory-meta {
                            .inventory-image {
                                svg {
                                    stroke: var(--theme-text-accent);
                                    transition: stroke 75ms ease;
                                }
                            }

                            span {
                                color: var(--theme-text-accent);
                                transition: 75ms ease;
                            }
                        }
                    }

                    .inventory-name {
                        flex: 1 0 70%;
                        justify-content: center;
                    }

                    .inventory-item-price {
                        flex: 1 0 10%;
                        justify-content: center;
                    }

                    .inventory-item-amount {
                        flex: 1 0 10%;
                        justify-content: center;
                    }
                }

                .inventory-footer {
                    border-color: transparent;
                    border-top-color: inherit;
                    border-width: var(--theme-border-width);
                    width: 100%;
                    height: 3rem !important;

                    .inventory-footer-items {
                        display: flex;
                        flex-flow: row nowrap;
                        align-content: center;
                        justify-content: center;
                        gap: 1rem;

                        margin-top: .75em;
                        margin-bottom: .75em;

                        font-family: 'FunnelSans', sans-serif;

                        .pagination-button {
                            cursor: pointer;
                            color: var(--theme-text);
                        }

                        .pagination-button:hover {
                            color: var(--theme-text-accent);
                        }

                        .pagination-button.disabled {
                            cursor: initial;
                            color: var(--theme-text-third);
                            pointer-events: none;
                        }
                    }
                }
            }

        }
    }
</style>