import {Inventories} from "$lib/server/db/database";
import type {PageServerLoad} from "./$types";
import currencies from "$lib/server/db/components/currencies";
import {units} from "$lib/server/db/components/units";

export const load: PageServerLoad = async ({ params }) => {
    return {
        currencies: currencies,
        units: units,
        labels: await Inventories.fetchLabels(String(params.id))
    }
}