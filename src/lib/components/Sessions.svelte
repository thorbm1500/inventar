<script lang="ts">
    import type {Session, User} from "$lib/server/db/interfaces";
    import {getContext} from "svelte";
    import {getSessions} from "../../routes/(app)/settings/data.remote.ts";
    import moment from "moment";

    const user: User = $derived(getContext('user'));

    // svelte-ignore state_referenced_locally
    const sessions: Session[] = $state(await getSessions(user.uuid));
    let currentTime = $state(Date.now());

    setTimeout(() => {
        currentTime = Date.now()
    }, 30000);

    /*

    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-spy"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 11h18" /><path d="M5 11v-4a3 3 0 0 1 3 -3h8a3 3 0 0 1 3 3v4" /><path d="M4 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M14 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M10 17h4" /></svg>


<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-devices-check"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 15.5v-6.5a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v4" /><path d="M18 8v-3a1 1 0 0 0 -1 -1h-13a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h7" /><path d="M16 9h2" /><path d="M15 19l2 2l4 -4" /></svg>
    * */
</script>

<section class="sessions-section">
    <div class="session-list">
        <h1>Computer</h1>
        <div class="header-seperator"></div>
        <div class="sessions computer">
            {#each sessions as session}
                {#if (session?.device === 'Computer')}
                    <div class="session">
                        <div class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                 stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-devices-2">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M10 15h-6a1 1 0 0 1 -1 -1v-8a1 1 0 0 1 1 -1h6"/>
                                <path d="M13 5a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-6a1 1 0 0 1 -1 -1l0 -14"/>
                                <path d="M7 19l3 0"/>
                                <path d="M17 8l0 .01"/>
                                <path d="M16 16a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>
                                <path d="M9 15l0 4"/>
                            </svg>
                            <div class="last_active {moment.duration({from: session.last_accessed, to: Date.now()}).minutes() > 5 ? 'inactive' : 'active'}">
                                {moment.duration({from: session.last_accessed, to: Date.now()}).minutes() > 5 ? 'Inactive' : 'Active'}
                            </div>
                        </div>
                        <div class="meta">
                            {session.ip}
                            {#if (session.continent && session.country && session.region)}
                                {session.continent}, {session.country}, {session.region}
                            {:else}
                                {session.continent ?? 'Unknown'} {session.country ? `, ${session.country}` : ''} {session.city ? `, ${session.city}` : ''}
                            {/if}
                        </div>
                    </div>
                {/if}
            {/each}
        </div>
        <h1>Mobile</h1>
        <div class="header-seperator"></div>
        <div class="sessions mobile">
            {#each sessions as session}
                {#if (session.device === 'Mobile')}
                    <div class="session">
                        <div class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-device-ipad"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 3a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2l12 0" /><path d="M9 18h6" /></svg>
                            <div class="last_active {moment.duration({from: session.last_accessed, to: Date.now()}).minutes() > 5 ? 'inactive' : 'active'}">
                                {moment.duration({from: session.last_accessed, to: Date.now()}).minutes() > 5 ? 'Inactive' : 'Active'}
                            </div>
                        </div>
                        <div class="meta">
                            {session.ip}
                            {#if (session.continent && session.country && session.region)}
                                {session.continent}, {session.country}, {session.region}
                            {:else}
                                {session.continent ?? 'Unknown'} {session.country ? `, ${session.country}` : ''} {session.city ? `, ${session.city}` : ''}
                            {/if}
                        </div>
                    </div>
                {/if}
            {/each}
        </div>
    </div>
</section>

<style>
    .sessions-section {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: center;

        width: 100%;
        height: fit-content;

        font-family: 'FunnelSans', sans-serif;

        .session-list {
            width: 100%;

            h1 {
                font-family: 'FunnelDisplay', sans-serif;
                font-size: 1.25rem;
                font-weight: 600;
                color: var(--theme-text);
                margin-top: 1rem;
            }

            h1:first-child {
                margin-top: 0;
            }

            .header-seperator {
                width: 100%;
                background: var(--theme-border-container);
                height: .1rem;
                border-radius: var(--theme-border-radius);
                opacity: .5;
                margin-bottom: .5rem;
            }

            .sessions {
                display: flex;
                flex-flow: column nowrap;

                width: 100%;

                .session {
                    display: flex;
                    flex-flow: row nowrap;
                    justify-content: space-between;

                    width: 100%;

                    background: var(--theme-background-container);
                    border: var(--theme-border-width) solid var(--theme-border-container);
                    border-radius: var(--theme-border-radius);

                    color: var(--theme-text);

                    .icon {
                        display: flex;
                        flex-flow: column nowrap;
                        align-items: center;
                        justify-content: center;

                        height: 5rem;
                        width: 5rem;

                        margin: 1rem;

                        svg {
                            width: 100%;
                            height: 100%;
                        }

                        .last_active {
                            display: flex;
                            flex-flow: row nowrap;
                            align-items: center;
                            justify-content: center;
                            align-content: center;

                            font-weight: 700;
                            letter-spacing: .05rem;
                            font-size: .925rem;

                            font-family: 'FunnelDisplay', sans-serif;
                        }

                        .last_active.inactive {
                            opacity: .75;
                        }

                        .last_active.active::before, .last_active.inactive::before {
                            content: '';
                            height: .5rem;
                            width: .5rem;
                            border-radius: 100%;
                            margin-right: .25rem;
                        }

                        .last_active.active::before {
                            background: var(--theme-text-accent);
                            filter: drop-shadow(0 0 .25rem rgba(from var(--theme-text-accent) r g b / .35));
                        }

                        .last_active.inactive::before {
                            background: #44484c;
                        }
                    }

                    .meta {
                        display: flex;
                        align-items: center;
                        justify-content: center;

                        width: 100%;

                        font-size: 1.1rem;
                    }
                }
            }

            .sessions.computer {

            }

            .sessions.mobile {

            }
        }
    }
</style>