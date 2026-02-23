<script lang="ts">
    import type {Session, User} from "$lib/server/db/interfaces";
    import {getContext} from "svelte";
    import {endSession, getSessions} from "../../routes/(app)/account/[id]/settings/data.remote.ts";
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

    /* Session Icon
    * <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio-tower-icon lucide-radio-tower"><path d="M4.9 16.1C1 12.2 1 5.8 4.9 1.9"/><path d="M7.8 4.7a6.14 6.14 0 0 0-.8 7.5"/><circle cx="12" cy="9" r="2"/><path d="M16.2 4.8c2 2 2.26 5.11.8 7.47"/><path d="M19.1 1.9a9.96 9.96 0 0 1 0 14.1"/><path d="M9.5 18h5"/><path d="m8 22 4-11 4 11"/></svg>
    * */
</script>

<section class="sessions-section">
    <div class="session-list">
        <h1>Computer</h1>
        <div class="header-seperator"></div>
        <div class="sessions computer">
            {#each sessions as session}
                {#if (session?.device === 'Computer')}
                    <div class="session" style="order:{moment.duration({from: session.last_accessed, to: Date.now()}).minutes() > 5?2:1}">
                        <div class="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"
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
                        <div class="platform">
                            <p class="name">{session.platform}</p>
                            <p class="ip">{session.ip}</p>
                        </div>
                        <div class="meta">
                            {#if (session.continent && session.country && session.region)}
                                <div class="top">
                                    {session.continent}, {session.country}
                                </div>
                                <div class="bottom">
                                    {session.region}, {session.city}
                                </div>
                            {:else}
                                {session.continent ?? 'Unknown'} {session.country ? `, ${session.country}` : ''} {session.city ? `, ${session.city}` : ''}
                            {/if}
                        </div>
                        <div class="timestamps">
                            <button onclick="{() => endSession(session.session_id)}" title="End Session">End Session</button>
                            <div class="last_seen">
                                <p>Last Seen</p>
                                <p>{moment(session.last_accessed).calendar()}</p>
                            </div>
                            <div class="created_at">
                                <p>Created</p>
                                <p>{moment(session.created_at).calendar()}</p>
                            </div>
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
                    <div class="session" style="order:{moment.duration({from: session.last_accessed, to: Date.now()}).minutes() > 5?2:1}">
                        <div class="icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                 stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-device-mobile">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                <path d="M6 5a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2v-14"/>
                                <path d="M11 4h2"/>
                                <path d="M12 17v.01"/>
                            </svg>
                            <div class="last_active {moment.duration({from: session.last_accessed, to: Date.now()}).minutes() > 5 ? 'inactive' : 'active'}">
                                {moment.duration({from: session.last_accessed, to: Date.now()}).minutes() > 5 ? 'Inactive' : 'Active'}
                            </div>
                        </div>
                        <div class="platform">
                            <p class="name">{session.platform}</p>
                            <p class="ip">{session.ip}</p>
                        </div>
                        <div class="meta">
                            {#if (session.continent && session.country && session.region)}
                                <div class="top">
                                    {session.continent}, {session.country}
                                </div>
                                <div class="bottom">
                                    {session.region}, {session.city}
                                </div>
                            {:else}
                                <div class="top">
                                    {session.continent ?? 'Unknown'} {session.country ? `, ${session.country}` : ''}
                                </div>
                                <div class="bottom">
                                    {session.region ?? ''} {session.city ? `, ${session.city}` : ''}
                                </div>
                            {/if}
                        </div>
                        <div class="timestamps">
                            <button onclick="{() => endSession(session.session_id)}" title="End Session">End Session</button>
                            <div class="last_seen">
                                <p>Last Seen</p>
                                <p>{moment(session.last_accessed).calendar()}</p>
                            </div>
                            <div class="created_at">
                                <p>Created</p>
                                <p>{moment(session.created_at).calendar()}</p>
                            </div>
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
        justify-content: stretch;

        width: 100%;
        height: fit-content;

        font-family: 'FunnelSans', sans-serif;

        .session-list {
            width: 100%;
            height: fit-content;

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
                width: 80%;
                background: var(--theme-border-container);
                height: .1rem;
                border-radius: 100%;
                opacity: .25;
                margin: .25rem 0 .75rem 0;
                justify-self: center;
            }

            .sessions.mobile .session .icon svg {
                width: 2.4rem;
                height: 2.4rem;
            }

            .sessions {
                display: flex;
                flex-flow: column nowrap;
                width: 100%;
                gap: .75rem;

                .session {
                    display: flex;
                    flex-flow: row nowrap;
                    justify-content: space-between;

                    width: 100%;
                    height: fit-content;

                    padding: 1.25rem 1.5rem;

                    background: var(--theme-background-container);
                    border: var(--theme-border-width) solid var(--theme-border-container);
                    border-radius: var(--theme-border-radius);

                    color: var(--theme-text);

                    .icon {
                        display: flex;
                        flex-flow: column nowrap;
                        align-items: center;
                        justify-content: center;

                        height: fit-content;
                        width: 10rem;

                        svg {
                            padding: 0;
                            width: 2.5rem;
                            height: 2.5rem;
                        }

                        .last_active {
                            display: flex;
                            flex-flow: row nowrap;
                            align-items: center;
                            justify-content: center;
                            align-content: center;

                            font-weight: 700;
                            letter-spacing: .05rem;
                            font-size: .875rem;
                            margin-top: .25rem;

                            font-family: 'FunnelDisplay', sans-serif;
                        }

                        .last_active.inactive {
                            opacity: .75;
                        }

                        .last_active.active::before, .last_active.inactive::before {
                            content: '';
                            height: .475rem;
                            width: .475rem;
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

                    .platform {
                        display: flex;
                        flex-flow: column nowrap;
                        align-items: center;
                        justify-content: center;
                        align-content: center;

                        margin: 0 1.5rem;

                        font-family: 'FunnelDisplay', sans-serif;
                        font-size: 1.2rem;
                        font-weight: 600;

                        .ip {
                            font-size: .95rem;
                            color: var(--theme-text-secondary);
                        }
                    }

                    .meta {
                        display: flex;
                        flex-flow: column nowrap;
                        align-items: center;
                        justify-content: center;

                        width: 100%;

                        .top {
                            font-family: 'FunnelDisplay', sans-serif;
                            font-size: 1.1rem;
                            font-weight: 750;
                        }
                        .bottom {
                            font-weight: 650;
                            font-family: 'FunnelSans', sans-serif;
                            font-size: .85rem;
                            color: var(--theme-text-secondary);
                        }
                    }

                    .timestamps {
                        display: flex;
                        flex-flow: column nowrap;
                        align-items: flex-end;
                        justify-content: center;

                        button {
                            color: var(--theme-text);
                            font-family: 'FunnelSans', sans-serif;
                            font-size: .95rem;
                            font-weight: 550;

                            cursor: pointer;
                        }

                        button:hover {
                            color: var(--theme-text-danger);
                        }

                        .created_at,.last_seen {
                            display: flex;
                            flex-flow: row nowrap;
                            align-items: flex-start;
                            justify-content: center;
                            text-wrap: nowrap;

                            font-family: 'FunnelDisplay', sans-serif;
                            font-weight: 600;

                            p:first-child {
                                font-size: .75rem;
                                color: var(--theme-text-secondary);
                                text-wrap: nowrap;
                                margin-right: .15rem;
                            }
                            p:last-child {
                                font-size: .75rem;
                                color: var(--theme-text-secondary);
                                text-wrap: nowrap;
                            }
                        }
                    }
                }
            }
        }
    }
</style>