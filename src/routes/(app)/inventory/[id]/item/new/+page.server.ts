import {getCurrencies, getUnits, Inventories} from "$lib/server/db/database";
import type {PageServerLoad} from "./$types";

export const load: PageServerLoad = async ({ params }) => {
    return {
        currencies: await getCurrencies(),
        units: await getUnits(),
        labels: await Inventories.fetchLabels(String(params.id))
    }
}