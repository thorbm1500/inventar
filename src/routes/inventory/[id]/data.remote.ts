import {query} from '$app/server';
import * as db from '$lib/server/db/database'
import {error} from '@sveltejs/kit';
import * as v from 'valibot';
import util from "$lib/server/utilities";
import type {Currency, Inventory} from "$lib/server/db/schema";

export const getInventory = query(v.string(), async (id: string): Promise<Inventory> => {
    const result: Inventory[] = await db.Inventories.fetchInventoryByUuid(id);
    if (!result) error(500, "Failed to fetch inventory.");

    return result[0];
});

const itemsObj = v.object({
    id: v.string(),
    amount: v.number(),
    order: v.string()
});

export const getItems = query(itemsObj, async (data) => {
    if (util.isOffline()) {
        return [];
    }

    const result = await db.Inventories.fetchItems(data.id,data.amount,data.order,true);
    if (!result) error(500, `Failed to fetch items for inventory '${data.id}'.`);

    let item_list = []

    for (const item of result) {
        item_list.push(item);
    }

    return item_list;
});

export const getCurrencies = query(async (): Promise<Currency[]> => {
    const result: Currency[] = await db.getCurrencies();
    if (!result) error(500, "Failed to fetch currencies.");

    return result;
});