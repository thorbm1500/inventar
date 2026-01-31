import {query} from '$app/server';
import * as db from '$lib/server/db/database'
import util from '$lib/server/utilities';
import type {Inventory} from "$lib/server/db/schema";
import * as v from "valibot";

const inventoriesObj = v.object({
    amount: v.number(),
    order_by: v.string(),
    order: v.string(),
    offset: v.number()
});

/**
 * Get a list of all inventories from the database.
 * The list is returned as a standard Array, and
 * contains a map for each inventory returned.
 * The map contains the following variables;
 *   - <strong>inventory_uuid</strong> <i>as UUID v7</i>
 *   - <strong>name</strong> <i>as string</i>
 *   - <strong>description</strong> <i>as string</i>
 *   - <strong>image_path</strong> <i>as URL/URI as string</i>
 *   - <strong>primary_inventory</strong> <i>as boolean</i>
 * @return Array
 */
export const getInventories = query(inventoriesObj, async (data): Promise<Inventory[]> => {
    if (util.isOffline(false)) {
        return [];
    }
    else {
        const result = await db.Inventories.fetch(data.amount,data.order_by,data.order == '' ? 'ASC' : data.order,data.offset);
        return result;
    }
});

export const getTotalInventoryCount = query(async (): Promise<number> => {
    if (util.isOffline(false)) {
        return 1;
    }
    else {
        const result = await db.Inventories.fetchTotalInventoryCount();
        return result;
    }
});