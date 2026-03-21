import type {PageServerLoad} from "./$types";
import currencies from "$lib/server/db/components/currencies";
import {units} from "$lib/server/db/components/units";
import {Labels} from "$lib/server/db/components/labels";

export const load: PageServerLoad = async ({ params }) => {
    return {
        currencies: currencies,
        units: units,
        labels: await Labels.getLabelsForInventory(String(params.id))
    }
}