<script module>
    import {page} from "$app/state";
    import {validate} from "uuid";
    import {error} from "@sveltejs/kit";
    import {getContext} from "svelte";
    import Header from "../../Header.svelte";
    import {getUser} from "./data.remote";
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

<Header />

<section class="profile-page-content">
    <div class="profile-page-container ui-container">
        <div class="profile-picture">
            <img src="{userProfile.profile_picture ?? DefaultProfilePicture}" alt="{userProfile.username}'s profile picture">
        </div>
        <div class="profile-meta">
            <p>{userProfile.username}</p>
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

                p,span {
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