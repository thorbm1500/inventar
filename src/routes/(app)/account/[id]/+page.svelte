<script module>
    import {page} from "$app/state";
    import {validate} from "uuid";
    import {error} from "@sveltejs/kit";
    import {getContext} from "svelte";
    import {getUser} from "./data.remote.ts";
    import DefaultProfilePicture from '$lib/assets/images/Default_Profile_Picture.png'
</script>

<script lang="ts">
    if (!page.params.id || !validate(page.params.id)) {
        error(404, 'Account ID is required!');
    }

    const userProfile: User | undefined = await getUser(page.params.id);

    if (!userProfile) {
        error(500, 'Failed to load user profile!');
    }

    const user = getContext('user');

</script>

<section class="profile-page-content">
    <div class="profile-page-container ui-container">
        <div class="profile-picture">
            <img src="{userProfile.profile_picture ?? DefaultProfilePicture}" alt="{userProfile.username}'s profile picture">
        </div>
        <div class="profile-meta">
            <div class="profile-username">
                {#if (userProfile.superuser) }
                    <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/>
                    </svg>
                {/if}
                <p>{userProfile.username}</p>
            </div>
            <span>Member since {new Date(Date.parse(userProfile.created_at)).toLocaleString()}</span>
        </div>
    </div>
</section>

<style>
    .profile-page-content {
        .profile-page-container {
            display: flex;
            flex-flow: column nowrap;

            width: 72rem;
            height: 48rem;

            margin: calc(50vh - (24rem + (var(--header-height) / 2))) auto;

            p {
                color: #FFFFF2;
            }

            .profile-picture {
                display: flex;
                width: 100%;
                justify-content: center;
                margin-top: 4rem;

                img {
                    width: 14rem !important;
                    height: 14rem !important;
                    border-radius: 100%;
                    border-width: .12em;
                    border-color: var(--theme-border-container);
                }
            }

            .profile-meta {
                display: flex;
                flex-flow: column nowrap;
                align-items: center;
                width: 100%;
                justify-content: center;
                margin-top: 1.5rem;

                .profile-username {
                    display: flex;
                    flex-flow: row nowrap;

                    align-items: baseline;

                    svg {
                        margin-right: .5rem;
                        height: 1.751rem;
                        width: 1.75rem;
                    }
                }

                p, span {
                    font-family: 'Funnel Display', sans-serif;
                }

                p {
                    color: var(--theme-text);
                    font-size: 2.75rem;
                    font-weight: 500;
                }

                span {
                    font-size: .85rem;
                    font-weight: 350;
                    color: var(--theme-text-third);
                }
            }
        }
    }
</style>