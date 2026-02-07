import {error} from '@sveltejs/kit';
import {query} from '$app/server';
import * as db from '$lib/server/db/database'
import * as v from 'valibot';
import util from "$lib/server/utilities";
import type {Currency} from "$lib/server/db/schema";
import type {DatabaseResult} from "$lib/server/db/database";
import type {InventoryInterface} from "$lib/server/components/Inventory";
import type {ItemInterface} from "$lib/server/components/Item";

export const getInventory = query(v.string(), async (id: string): Promise<InventoryInterface> => {
    const result: DatabaseResult = await db.Inventories.fetchInventoryByUuid(id);
    if (!result.success) error(500, "Failed to fetch inventory.");

    return result.result as InventoryInterface;
});

const itemsObj = v.object({
    inventory_uuid: v.string(),
    amount: v.number(),
    order_by: v.string(),
    order: v.string(),
    offset: v.number()
});

export const getCurrencies = query(async (): Promise<Currency[]> => {
    const result: DatabaseResult = await db.getCurrencies();
    if (!result.success) error(500, `Failed to fetch currencies: ${result.message}`);

    const currencies = result.result as Currency[];
    return currencies;
});

export const getItems = query(itemsObj, async (data): Promise<ItemInterface[]> => {
    if (util.isOffline()) {
        const result: DatabaseResult = await db.Items.fetch(data.inventory_uuid,data.amount,data.order_by,data.order == '' ? 'ASC' : data.order,data.offset);

        if (result.success) {
            return result.result as ItemInterface[];
        }
    }

    return [];
});

export const getTotalItemCount = query(v.string(), async (id: string): Promise<number> => {
    if (util.isOffline()) {
        const result: DatabaseResult = await db.Items.fetchTotalItemCount(id);

        if (result.success) {
            return result.result;
        }
    }

    return 1;
});