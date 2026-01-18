<script lang='ts'>
    import {enhance} from '$app/forms';
    import type {ActionData} from './$types';

    let {form}: { form: ActionData } = $props();
</script>
<section>
    <form method="post" action="?/login" use:enhance>
        <label for="Email">
            <input
                    type="text"
                    name="email"
                    value="Email"
                    class="bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </label>
        <label for="Password">
            <input
                    type="password"
                    name="password"
                    value="Password"
                    class="bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
        </label>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >Login
        </button>
        <button
                formaction="?/register"
                class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >Register
        </button>
    </form>
    <p style='color: red'>{form?.message ?? ''}</p>
</section>

<style>
    section {
        justify-content: center;
        align-content: center;
        align-items: center;
        height: 100%;
        width: 100%;

        form {
            display: flex;
            flex-flow: column nowrap;
            justify-content: center;
            align-items: center;

            label {
                display: flex;
                flex-direction: column nowrap;
                color: white;
            }

            label input {
                border-radius: 8px;
                color: black;
            }

            button {
                width: fit-content;
                margin-left: .2em;
                margin-right: .2em;
            }
        }
    }
</style>