<script lang="ts">
    import type {Item} from "$lib/server/db/components/item";
    import {getItem} from "./data.remote.ts";
    import {page} from "$app/state";
    import {onMount} from "svelte";

    //todo - Add settings page for changing item details

    const item: Item | null = $derived(await getItem(String(page.params.item_id)));

    onMount(() => {
        // Return the user to the inventory, if the item loading fails.
        if (item === null) window.location.href = `/inventory/${page.params.id}`;
    })

    let previous = 50;
    let dataList: number[] = [];

    let data = $state.raw(poll());

    let w = $state(1);
    let h = $state(1);

    const min = $derived(Math.min(...data) - 5);
    const max = $derived(Math.max(...data) + 5);
    const x = $derived(scale([0, data.length], [0, w]));
    const y = $derived(scale([min, max], [h, 0]));

    const ticks = $derived.by(() => {
        const result = [];
        let n = 10 * Math.ceil(min / 10);
        while (n < max) {
            result.push(n);
            n += 10;
        }
        return result;
    });

    $effect(() => {
        const interval = setInterval(() => {
            data = poll();
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    });

    function next(): number {
        const value = previous + Math.random() - 0.4;
        previous = value;

        return value;
    }

    for (let i = 0; i < 100; i += 1) {
        dataList.push(next());
    }

    function poll() {
        return dataList = [...dataList.slice(1), next()];
    }

    function scale(domain, range) {
        const m = (range[1] - range[0]) / (domain[1] - domain[0]);
        return (value) => range[0] + m * (value - domain[0]);
    }
</script>

<section class="item-section">
    <section class="item-content">
        <div class="item-header">
            <div class="header-left">
                <div class="meta">
                    <p class="name">{ item?.name ?? 'Loading...' }</p>
                    <p class="uuid">{ item?.uuid ?? 'Loading...' }</p>
                </div>
                <div class="specifications">
                    <div class="amount">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.5 7.27783L12 12.0001M12 12.0001L3.49997 7.27783M12 12.0001L12 21.5001M21 16.0586V7.94153C21 7.59889 21 7.42757 20.9495 7.27477C20.9049 7.13959 20.8318 7.01551 20.7354 6.91082C20.6263 6.79248 20.4766 6.70928 20.177 6.54288L12.777 2.43177C12.4934 2.27421 12.3516 2.19543 12.2015 2.16454C12.0685 2.13721 11.9315 2.13721 11.7986 2.16454C11.6484 2.19543 11.5066 2.27421 11.223 2.43177L3.82297 6.54288C3.52345 6.70928 3.37369 6.79248 3.26463 6.91082C3.16816 7.01551 3.09515 7.13959 3.05048 7.27477C3 7.42757 3 7.59889 3 7.94153V16.0586C3 16.4013 3 16.5726 3.05048 16.7254C3.09515 16.8606 3.16816 16.9847 3.26463 17.0893C3.37369 17.2077 3.52345 17.2909 3.82297 17.4573L11.223 21.5684C11.5066 21.726 11.6484 21.8047 11.7986 21.8356C11.9315 21.863 12.0685 21.863 12.2015 21.8356C12.3516 21.8047 12.4934 21.726 12.777 21.5684L20.177 17.4573C20.4766 17.2909 20.6263 17.2077 20.7354 17.0893C20.8318 16.9847 20.9049 16.8606 20.9495 16.7254C21 16.5726 21 16.4013 21 16.0586Z"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"/>
                        </svg>
                        { Number(item?.amount ?? 0).toLocaleString(new Intl.Locale('da-DK'))}
                    </div>
                    <div class="part-number">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M5 9l14 0"/>
                            <path d="M5 15l14 0"/>
                            <path d="M11 4l-4 16"/>
                            <path d="M17 4l-4 16"/>
                        </svg>
                        AB029
                    </div>
                </div>
                <div class="description">
                    <span>{ item ? (item?.description ?? 'No description has been set.') : 'Loading...'}</span>
                </div>
            </div>
            <div class="header-right">
                <div class="image">
                    {#if item?.image}
                        <img src="{item?.image}" alt="Item">
                    {:else}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 21H20.0104C20.9816 21 21.4671 21 21.7348 20.7975C21.968 20.6211 22.1123 20.3515 22.1297 20.0596C22.1497 19.7246 21.8804 19.3205 21.3417 18.5125L18.3313 13.9969C17.8862 13.3292 17.6636 12.9954 17.3831 12.8791C17.1378 12.7773 16.8622 12.7773 16.6169 12.8791C16.3364 12.9954 16.1139 13.3292 15.6687 13.9969L14.9245 15.1132M19 21L11.3155 9.90018C10.8736 9.26182 10.6526 8.94264 10.3766 8.83044C10.1351 8.73228 9.8649 8.73228 9.62344 8.83044C9.34742 8.94264 9.12645 9.26182 8.68451 9.90018L2.73822 18.4893C2.17519 19.3025 1.89368 19.7092 1.90971 20.0473C1.92366 20.3419 2.06688 20.6152 2.30109 20.7943C2.57002 21 3.06459 21 4.05373 21H19ZM21 6C21 7.65685 19.6569 9 18 9C16.3432 9 15 7.65685 15 6C15 4.34315 16.3432 3 18 3C19.6569 3 21 4.34315 21 6Z"
                                  stroke="currentColor"
                                  stroke-width="2"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"/>
                        </svg>
                    {/if}
                </div>
            </div>
        </div>
    </section>
    <div class="item-page-divider"></div>
    <section class="item-statistics">
        <p>7-Day Inventory Trend</p>
        <div class="outer">
            <svg width="500" height="500" bind:clientWidth={w} bind:clientHeight={h}>
                <line y1={h} y2={h} x2={w} />

                <g class="tick">
                    <line x2={w} />
                </g>

                <polyline pathLength="100px" points="50,50 100,100 150,150 1450,200" />
            </svg>
        </div>
    </section>
</section>

<style>
    .item-section {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: flex-start;

        height: 100vh;
        width: 100vw;

        overflow-x: hidden;
        overflow-y: scroll;
        overflow: auto;

        box-sizing: border-box;

        .item-content {
            display: flex;
            flex-flow: column nowrap;
            align-items: flex-start;
            justify-content: center;

            width: 80vw;
            max-width: 120rem;

            overflow: visible;

            color: var(--theme-text);

            padding-top: 8rem;

            .item-header {
                display: flex;
                flex-flow: row nowrap;
                align-items: flex-start;
                justify-content: space-between;

                gap: 8rem;

                padding: 0 1.5rem;

                width: 100%;

                .header-left {
                    display: flex;
                    flex-flow: column nowrap;
                    align-items: flex-start;
                    justify-content: space-between;

                    .meta {
                        margin-bottom: 1rem;

                        .name {
                            font-family: 'FunnelDisplay', sans-serif;
                            font-size: 2.15rem;
                            font-weight: 800;
                        }

                        .uuid {
                            font-size: .85rem;
                            color: var(--theme-text-third);
                            opacity: .45;
                            font-weight: 550;
                        }
                    }

                    .specifications {
                        display: flex;
                        flex-flow: row nowrap;
                        align-items: flex-start;
                        justify-content: flex-start;
                        gap: 1rem;

                        margin-bottom: .5rem;

                        .amount {
                            display: flex;
                            flex-flow: row nowrap;
                            align-items: center;
                            gap: .25rem;

                            font-family: 'FunnelDisplay', sans-serif;
                            font-size: 1.1rem;
                            font-weight: 600;
                        }

                        .part-number {
                            display: flex;
                            flex-flow: row nowrap;
                            align-items: center;
                            gap: .25rem;

                            font-family: 'FunnelDisplay', sans-serif;
                            font-size: 1.1rem;
                            font-weight: 600;

                            color: var(--theme-text-secondary);
                            opacity: .95;
                        }
                    }

                    .description {
                        span {
                            color: var(--theme-text-secondary);
                            font-weight: 450;
                        }
                    }
                }

                .header-right {
                    .image {
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        width: 15vw;
                        min-width: 22rem;
                        max-width: 28rem;
                        min-height: 22rem;
                        max-height: 28rem;
                        aspect-ratio: 1/1 !important;

                        border: var(--theme-border-width) solid var(--theme-border-container);
                        border-radius: var(--theme-border-radius);

                        background: rgba(from var(--theme-text-third) r g b / .05);
                        filter: drop-shadow(0 0 .25rem rgba(from var(--theme-text-third) r g b / .25));

                        img {
                            width: 100%;
                            height: 100%;
                        }

                        svg {
                            width: 14.5%;
                            height: 14.5%;
                            color: var(--theme-text-secondary);
                        }
                    }
                }
            }
        }

        .item-page-divider {
            width: 80vw;
            max-width: 120rem;

            background: var(--theme-text-third);
            border-radius: 1rem;
            opacity: .1;

            margin: 3rem 0;
            padding: .1rem 0;
        }

        .item-statistics {
            width: 80vw;
            max-width: 120rem;
            padding-bottom: 4rem;

            p {
                font-family: 'FunnelDisplay', sans-serif;
                font-size: 1.15rem;
                padding: 1rem;
                color: var(--theme-text);
            }

            .outer {
                width: 100%;
                height: 24rem;
                padding: 2rem;
                box-sizing: border-box;
                overflow: hidden;

                border: .1rem solid var(--theme-border-container);
                border-radius: var(--theme-border-radius);
                background: rgba(from var(--theme-background-header) r g b / .25);
                backdrop-filter: blur(3px) brightness(1);

                svg {
                    width: 100%;
                    height: 100%;
                    overflow: visible;
                }

                polyline {
                    fill: none;
                    stroke: var(--theme-color-accent);
                    stroke-width: 2;
                    stroke-linejoin: round;
                    stroke-linecap: round;

                    filter: drop-shadow(0 0 .15rem rgba(from var(--theme-color-accent) r g b / .1));
                }

                line {
                    stroke: var(--theme-text-third);
                }

                .tick {
                    stroke-dasharray: 4 8;
                    stroke-width: 3;
                    stroke-linecap: round;
                }
            }
        }
    }
</style>