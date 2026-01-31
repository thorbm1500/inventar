<script lang="ts">
    import {page} from "$app/state";
    import {validate} from "uuid";
    import {error} from "@sveltejs/kit";

    if (!page.params.id || !validate(page.params.id)) {
        error(404, 'Account ID is required!');
    }
</script>