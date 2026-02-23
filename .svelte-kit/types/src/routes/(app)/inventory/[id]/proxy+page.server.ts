// @ts-nocheck
import type {PageServerLoad} from './$types';
import {validate} from "uuid";
import {error} from "@sveltejs/kit";
import {getInventory} from "./data.remote";
import type {Currency, Inventory} from "$lib/server/db/interfaces";
import {getCurrencies} from "$lib/server/db/database";

export const ssr = false;

export const load = async ({params}: Parameters<PageServerLoad>[0]): Promise<{ inventory: Inventory, currencies: Currency[] }> => {
    if (!params.id || !validate(params.id)) {
        error(404, 'Inventory ID is required!');
    }

    const inventory: Inventory | undefined = await getInventory(params.id);
    if (inventory === undefined) error(404, {message: 'Failed to find inventory!'});

    return {
        inventory,
        currencies: await getCurrencies()
    };
};