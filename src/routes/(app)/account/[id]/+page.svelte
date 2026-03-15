<script lang="ts">
    import type {PageProps} from './$types';
    import DefaultProfilePicture from '$lib/assets/images/Default_Profile_Picture.png'
    import type {User} from "$lib/server/db/interfaces";

    let {data}: PageProps = $props();

    // svelte-ignore state_referenced_locally
    const userProfile: User = data.user;
</script>

<section class="profile-page-content">
    <div class="profile-page-container">
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
            <span>Member since {new Date(userProfile.created_at * 1000).toLocaleString()}</span>
        </div>
    </div>
</section>

<style>
    .profile-page-content {
        .profile-page-container {
            display: flex;
            flex-flow: column nowrap;

            background: var(--theme-background-container);
            border: var(--theme-border-width) solid var(--theme-border-container);
            border-radius: var(--theme-border-radius);

            width: 72rem;
            height: 48rem;

            margin: calc(50vh - (24rem + (var(--theme-height-header) / 2))) auto;

            p {
                color: var(--theme-text);
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
                        color: var(--theme-color-base);
                        margin-right: .5rem;
                        height: 1.751rem;
                        width: 1.75rem;
                    }
                }

                p, span {
                    font-family: 'FunnelDisplay', sans-serif;
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