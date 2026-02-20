import type { PageServerLoad } from './$types';
import type {Inventory} from "$lib/server/db/schema";
import {validate} from "uuid";
import {error} from "@sveltejs/kit";
import {getInventory} from "../data.remote";

export const load: PageServerLoad = async ({ params }): Promise<{inventory: Inventory}> => {
    if (!params.id || !validate(params.id)) {
        error(404, 'Inventory ID is required!');
    }

    const inventory = await getInventory(params.id);
    if (inventory === undefined) error(404, {message: 'Failed to find inventory!'});

    return {
        inventory
    };
};