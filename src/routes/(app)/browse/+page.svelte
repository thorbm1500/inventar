<script lang="ts">
    import {getInventories} from './data.remote.ts';
    import type {Inventory} from '$lib/server/db/interfaces';
    import {parseTimestamp} from '$lib/util/utilities';

    let order_by = $state('name');
    let order = $state('');
    let currentPage = $state(1);
    let viewType: string = $state('card');

    let inventories: Inventory[] = $state.raw([]);
    await refresh();

    async function refresh(pageChange: number = 0) {
        currentPage += pageChange;
        const offset = 6 * (currentPage - 1);

        const newInventories = await getInventories({amount: 6, order_by, order, offset});
        inventories = newInventories;
    }
</script>

<section class="browse-section">
    <section class="browse-content">
        <section class="browse-header">
            <div class="meta">
                Browse
            </div>
            <div class="create-inventory-button">
                <button class="theme-button" onclick="{() => window.location.href='/inventory/new'}" title="">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                         class="icon icon-tabler icons-tabler-outline icon-tabler-database-plus">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M4 6c0 1.657 3.582 3 8 3s8 -1.343 8 -3s-3.582 -3 -8 -3s-8 1.343 -8 3"/>
                        <path d="M4 6v6c0 1.657 3.582 3 8 3c1.075 0 2.1 -.08 3.037 -.224"/>
                        <path d="M20 12v-6"/>
                        <path d="M4 12v6c0 1.657 3.582 3 8 3c.166 0 .331 -.002 .495 -.006"/>
                        <path d="M16 19h6"/>
                        <path d="M19 16v6"/>
                    </svg>
                    Add Inventory
                </button>
            </div>
        </section>
        <div class="inventory-list-container">
            <div class="inventory-header">
                <div class="header-item">
                    <button class="sort-button" title="">
                        Sort by: Relevance <!--todo-->
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="header-item">
                    <button class="view-button" title="">
                        View: 20 <!--todo-->
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="header-item">
                    <!--todo-->
                    <button class="view-type-button {viewType === 'card' ? 'selected' : ''}" title="" onclick="{() => {viewType = 'card'}}">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.4 3H4.6C4.03995 3 3.75992 3 3.54601 3.10899C3.35785 3.20487 3.20487 3.35785 3.10899 3.54601C3 3.75992 3 4.03995 3 4.6V8.4C3 8.96005 3 9.24008 3.10899 9.45399C3.20487 9.64215 3.35785 9.79513 3.54601 9.89101C3.75992 10 4.03995 10 4.6 10H8.4C8.96005 10 9.24008 10 9.45399 9.89101C9.64215 9.79513 9.79513 9.64215 9.89101 9.45399C10 9.24008 10 8.96005 10 8.4V4.6C10 4.03995 10 3.75992 9.89101 3.54601C9.79513 3.35785 9.64215 3.20487 9.45399 3.10899C9.24008 3 8.96005 3 8.4 3Z"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"/>
                            <path d="M19.4 3H15.6C15.0399 3 14.7599 3 14.546 3.10899C14.3578 3.20487 14.2049 3.35785 14.109 3.54601C14 3.75992 14 4.03995 14 4.6V8.4C14 8.96005 14 9.24008 14.109 9.45399C14.2049 9.64215 14.3578 9.79513 14.546 9.89101C14.7599 10 15.0399 10 15.6 10H19.4C19.9601 10 20.2401 10 20.454 9.89101C20.6422 9.79513 20.7951 9.64215 20.891 9.45399C21 9.24008 21 8.96005 21 8.4V4.6C21 4.03995 21 3.75992 20.891 3.54601C20.7951 3.35785 20.6422 3.20487 20.454 3.10899C20.2401 3 19.9601 3 19.4 3Z"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"/>
                            <path d="M19.4 14H15.6C15.0399 14 14.7599 14 14.546 14.109C14.3578 14.2049 14.2049 14.3578 14.109 14.546C14 14.7599 14 15.0399 14 15.6V19.4C14 19.9601 14 20.2401 14.109 20.454C14.2049 20.6422 14.3578 20.7951 14.546 20.891C14.7599 21 15.0399 21 15.6 21H19.4C19.9601 21 20.2401 21 20.454 20.891C20.6422 20.7951 20.7951 20.6422 20.891 20.454C21 20.2401 21 19.9601 21 19.4V15.6C21 15.0399 21 14.7599 20.891 14.546C20.7951 14.3578 20.6422 14.2049 20.454 14.109C20.2401 14 19.9601 14 19.4 14Z"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"/>
                            <path d="M8.4 14H4.6C4.03995 14 3.75992 14 3.54601 14.109C3.35785 14.2049 3.20487 14.3578 3.10899 14.546C3 14.7599 3 15.0399 3 15.6V19.4C3 19.9601 3 20.2401 3.10899 20.454C3.20487 20.6422 3.35785 20.7951 3.54601 20.891C3.75992 21 4.03995 21 4.6 21H8.4C8.96005 21 9.24008 21 9.45399 20.891C9.64215 20.7951 9.79513 20.6422 9.89101 20.454C10 20.2401 10 19.9601 10 19.4V15.6C10 15.0399 10 14.7599 9.89101 14.546C9.79513 14.3578 9.64215 14.2049 9.45399 14.109C9.24008 14 8.96005 14 8.4 14Z"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button class="view-type-button {viewType === 'list' ? 'selected' : ''}" title="" onclick="{() => {viewType = 'list'}}">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.8 10C18.9201 10 19.4802 10 19.908 9.78201C20.2843 9.59027 20.5903 9.28431 20.782 8.90798C21 8.48016 21 7.92011 21 6.8V6.2C21 5.0799 21 4.51984 20.782 4.09202C20.5903 3.7157 20.2843 3.40973 19.908 3.21799C19.4802 3 18.9201 3 17.8 3L6.2 3C5.0799 3 4.51984 3 4.09202 3.21799C3.71569 3.40973 3.40973 3.71569 3.21799 4.09202C3 4.51984 3 5.07989 3 6.2L3 6.8C3 7.9201 3 8.48016 3.21799 8.90798C3.40973 9.28431 3.71569 9.59027 4.09202 9.78201C4.51984 10 5.07989 10 6.2 10L17.8 10Z"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"/>
                            <path d="M17.8 21C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V17.2C21 16.0799 21 15.5198 20.782 15.092C20.5903 14.7157 20.2843 14.4097 19.908 14.218C19.4802 14 18.9201 14 17.8 14L6.2 14C5.0799 14 4.51984 14 4.09202 14.218C3.71569 14.4097 3.40973 14.7157 3.21799 15.092C3 15.5198 3 16.0799 3 17.2L3 17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21H17.8Z"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
            {#if inventories.length === 0}
                <div class="empty-inventory-list">
                    {#if navigator.onLine }
                        <span class="text-theme-text-third">No inventories found.</span>
                        <a href="/inventory/new">Create your first inventory now!</a>
                    {:else}
                        <span class="text-theme-text-third">No internet found. Reconnect to browse inventories.</span>
                    {/if}
                </div>
            {:else if viewType === 'list'}
                <div class="inventory-list list">
                    {#each inventories as {uuid, name, description, item_amount, last_update}}
                        <a data-sveltekit-preload-data="hover" href='/inventory/{uuid}' target='_parent' class="list-entry">
                            <div class="entry-item inventory-meta">
                                <div class="inventory-image">
                                    <svg fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/>
                                    </svg>
                                </div>
                                <div class="inventory-name-and-description">
                                    <h1 class="inventory-name">{name}</h1>
                                    <span class="line-clamp-2">
                                    {#if description}
                                        {description}
                                    {:else}
                                        No description has been set.
                                    {/if}
                                </span>
                                </div>
                            </div>
                            <div class="entry-item inventory-item-last_change">
                                {parseTimestamp(String(last_update))}
                            </div>
                            <div class="entry-item inventory-item-amount">
                                {item_amount}
                            </div>
                        </a>
                    {/each}
                </div>
            {:else}
                <div class="inventory-list card">
                    <div class="cards">
                        {#each inventories as {uuid, name, description, item_amount, last_update}}
                            <a data-sveltekit-preload-data="hover" href='/inventory/{uuid}' target='_parent' class="card-entry">
                                <div class="inventory-image">
                                    <svg fill="none" viewBox="0 0 24 24" stroke-width="1.75" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/>
                                    </svg>
                                </div>
                                <div class="entry-item inventory-meta">
                                    <div class="inventory-name-and-description">
                                        <h1 class="inventory-name">{name}</h1>
                                        <span class="line-clamp-3">
                                    {#if description}
                                        {description}
                                    {:else}
                                        No description has been set.
                                    {/if}
                                </span>
                                    </div>
                                </div>
                                <div class="inventory-info">
                                    <div class="entry-item inventory-item-last_change">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                             stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M12 8l0 4l2 2"/>
                                            <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"/>
                                        </svg>
                                        <p>{parseTimestamp(String(last_update))}</p>
                                    </div>
                                    <div class="entry-item inventory-item-amount">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                             stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-packages">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                            <path d="M7 16.5l-5 -3l5 -3l5 3v5.5l-5 3l0 -5.5"/>
                                            <path d="M2 13.5v5.5l5 3"/>
                                            <path d="M7 16.545l5 -3.03"/>
                                            <path d="M17 16.5l-5 -3l5 -3l5 3v5.5l-5 3l0 -5.5"/>
                                            <path d="M12 19l5 3"/>
                                            <path d="M17 16.5l5 -3"/>
                                            <path d="M12 13.5v-5.5l-5 -3l5 -3l5 3v5.5"/>
                                            <path d="M7 5.03v5.455"/>
                                            <path d="M12 8l5 -3"/>
                                        </svg>
                                        <p>{item_amount}</p>
                                    </div>
                                </div>
                            </a>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    </section>
</section>

<style>
    .browse-section {
        width: 100vw;
        height: 100vh;

        overflow-x: hidden !important;
        overflow-y: scroll;
        overflow: auto;

        box-sizing: border-box;
    }

    .browse-content {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: center;

        user-select: none !important;
        padding-top: 6.5rem;
        padding-bottom: 4rem;

        width: 100vw;
        height: fit-content;

        .browse-header {
            display: flex;
            flex-flow: row nowrap;
            align-items: center;
            justify-content: space-between;

            width: 90rem;
            height: fit-content;

            .meta, .create-inventory-button {
                margin: 0 2.5rem 2.5rem 2.5rem;
            }

            .meta {
                font-family: 'FunnelDisplay', sans-serif;
                font-weight: 750;
                font-size: 2.75rem;

                color: var(--theme-text);
            }

            .create-inventory-button {
                .theme-button:hover svg {
                    fill: var(--theme-color-accent) !important;
                }
            }
        }

        .inventory-list-container {
            max-width: 90rem;

            color: var(--theme-text);

            .inventory-header {
                display: flex;
                flex-flow: row nowrap;
                align-items: center;
                justify-content: flex-start;
                gap: .5rem;

                margin-bottom: .5rem;
                padding: 0 1rem .5rem 1rem;

                .header-item {
                    display: flex;
                    flex-flow: row nowrap;
                    align-items: center;
                    justify-content: center;

                    background: var(--theme-background-button);
                    border: var(--theme-border-width) solid var(--theme-border-button);
                    border-radius: var(--theme-border-radius);

                    font-family: "FunnelSans", sans-serif;

                    width: fit-content;
                    height: 2.75rem;

                    cursor: pointer;

                    * {
                        cursor: pointer;
                    }

                    .sort-button, .view-button, .view-type-button {
                        display: flex;
                        flex-flow: row nowrap;
                        align-items: center;
                        justify-content: center;

                        svg {
                            width: 1.25rem;
                            height: 1.25rem;
                        }
                    }

                    .sort-button, .view-button {
                        padding: 0 .75rem 0 1rem;

                        svg {
                            margin-left: .5rem;
                        }
                    }

                    .view-type-button:first-child {
                        margin-left: .75rem;
                        margin-right: .25rem;
                    }

                    .view-type-button:last-child {
                        margin-left: .25rem;
                        margin-right: .75rem;
                    }

                    .view-type-button.selected {
                        color: var(--theme-color-accent);
                    }
                }
            }

            .empty-inventory-list {
                display: flex;
                align-content: center;
                align-items: center;
                justify-content: center;
                height: 36rem;
                gap: .35em;

                span, a {
                    font-size: 1.05rem;
                }

                span {
                    color: var(--theme-text-third);
                }

                a {
                    color: var(--theme-text-secondary);
                }

                a:hover {
                    color: var(--theme-text);
                }
            }

            .inventory-list.list {
                display: flex;
                flex-flow: column nowrap;
                justify-content: flex-start;

                height: fit-content;

                .list-entry {
                    width: 100%;
                    height: 6rem !important;

                    display: flex;
                    flex-flow: row nowrap;
                    justify-content: center;
                    align-items: center;
                    align-content: center;

                    background: var(--theme-background-container);
                    border: var(--theme-border-width) solid var(--theme-border-container);
                    border-radius: var(--theme-border-radius);

                    font-family: 'FunnelSans', sans-serif;

                    margin: .5rem 0;

                    .entry-item:first-child {
                        flex: 1 50%;
                        display: flex;
                    }

                    .entry-item {
                        flex: 1 25%;
                    }

                    svg {
                        width: 2.25rem;
                        height: 2.25rem;
                        transition: 450ms 100ms ease-in-out;
                    }

                    .inventory-meta {
                        display: flex;
                        flex-flow: row nowrap;
                        align-items: center;

                        .inventory-image {
                            padding: 0 1.15rem;
                        }

                        .inventory-name-and-description {
                            display: flex;
                            flex-flow: column nowrap;
                            justify-content: flex-start;
                            align-content: flex-start;

                            h1 {
                                font-weight: 700;
                                font-size: 1.5rem;
                            }

                            span {
                                font-size: 0.85rem;
                                color: var(--theme-text-third);
                                line-clamp: 2 !important;
                                text-overflow: ellipsis;

                                transition: 450ms 100ms ease-in-out;
                            }
                        }
                    }

                    .inventory-item-amount {
                        text-align: center;
                    }

                    .inventory-item-last_change {
                        text-align: center;
                    }
                }

                .list-entry:hover {
                    background: var(--theme-background-button-hover);

                    svg {
                        stroke: var(--theme-color-accent);
                        transition: 50ms ease-in-out;
                    }

                    .inventory-meta {
                        span {
                            color: var(--theme-text-accent);
                            transition: 50ms ease-in-out;
                        }
                    }
                }
            }

            .inventory-list.card {
                display: flex;
                flex-flow: row nowrap;
                justify-content: center;
                min-width: 20rem;
                width: 72.5vw;
                max-width: 90rem;

                .cards {
                    display: flex;
                    flex-flow: row wrap;
                    justify-content: flex-start;
                    gap: 1.5rem;

                    height: fit-content;
                    width: 100%;

                    margin: .5rem 0;

                    .card-entry {
                        flex: 1;

                        min-width: 20rem;
                        width: 20rem;
                        max-width: 21.35rem;
                        height: 28rem !important;

                        display: flex;
                        flex-flow: column nowrap;
                        justify-content: center;
                        align-items: center;
                        align-content: center;

                        background: var(--theme-background-container);
                        border: var(--theme-border-width) solid var(--theme-border-container);
                        border-radius: var(--theme-border-radius);

                        padding: 2.5rem 0 1.5rem 0;

                        svg {
                            width: 6em;
                            height: 6rem;
                            margin: 1.5rem 0;
                        }

                        .inventory-name-and-description {
                            display: flex;
                            flex-flow: column nowrap;
                            justify-content: flex-start;
                            align-items: center;
                            text-align: center;

                            h1 {
                                font-size: 2rem;
                                font-weight: 800;
                            }

                            span {
                                font-size: 0.9rem;
                                font-weight: 450;
                                text-wrap-style: pretty;
                                color: var(--theme-text-third);

                                width: 75%;
                            }
                        }

                        .inventory-info {
                            display: flex;
                            flex-flow: row nowrap;
                            justify-content: center;
                            align-items: flex-end;

                            height: 100%;
                            width: 65%;

                            .entry-item {
                                flex: 50%;

                                display: flex;
                                flex-flow: column nowrap;
                                align-items: center;
                                justify-content: center;

                                svg {
                                    width: 1.5rem;
                                    height: 1.5rem;
                                    padding: 0;
                                    margin: 0;

                                    color: var(--theme-text-third);
                                }

                                p {
                                    color: var(--theme-text-third);
                                    text-align: center;
                                    text-wrap: nowrap;
                                }
                            }
                        }
                    }

                    .card-entry:hover {
                        background: var(--theme-background-button-hover);

                        svg {
                            stroke: var(--theme-color-accent);
                            transition: 50ms ease-in-out;
                        }

                        .inventory-meta {
                            span {
                                color: var(--theme-text-accent);
                                transition: 50ms ease-in-out;
                            }
                        }
                    }
                }
            }
        }
    }
</style>