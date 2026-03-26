import type {PageServerLoad} from "./$types";
import {currencies} from "$lib/util/currencies";
import {units} from "$lib/server/db/components/units";
import {Labels} from "$lib/server/db/components/labels";
import {faker} from "@faker-js/faker/locale/en";

export const load: PageServerLoad = async ({ params }) => {
    return {
        namePlaceholder: faker.commerce.productName(),
        descriptionPlaceholder: faker.lorem.sentences(3),
        partNumberPlaceholder: faker.vehicle.vin(),
        urlPlaceholder: faker.internet.url(),
        currencies: currencies,
        units: units,
        labels: await Labels.getLabelsForInventory(String(params.id))
    }
}