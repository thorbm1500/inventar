import {query} from '$app/server';
import * as db from '$lib/server/db/database'
import {error} from '@sveltejs/kit';
import * as v from 'valibot';
import util from "$lib/server/utilities";
import type {Currency, Inventory, Item} from "$lib/server/db/schema";

export const getInventory = query(v.string(), async (id: string): Promise<Inventory> => {
    const [result] = await db.Inventories.fetchInventoryByUuid(id);
    if (!result) error(500, "Failed to fetch inventory.");

    return result as Inventory;
});

const itemsObj = v.object({
    inventory_uuid: v.string(),
    amount: v.number(),
    order_by: v.string(),
    order: v.string(),
    offset: v.number()
});

export const getCurrencies = query(async (): Promise<Currency[]> => {
    const result: Currency[] = await db.getCurrencies();
    if (!result) error(500, "Failed to fetch currencies.");

    return result;
});

export const getItems = query(itemsObj, async (data): Promise<Item[]> => {
    if (util.isOffline()) {
        return [];
    }
    else {
        const result = await db.Items.fetch(data.inventory_uuid,data.amount,data.order_by,data.order == '' ? 'ASC' : data.order,data.offset);
        return result;
    }
});

export const getTotalItemCount = query(v.string(), async (id: string): Promise<number> => {
    if (util.isOffline()) {
        return 1;
    }
    else {
        const result = await db.Items.fetchTotalItemCount(id);
        return result;
    }
});