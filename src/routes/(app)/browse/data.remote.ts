import {query} from '$app/server';
import * as db from '$lib/server/db/database'
import util from '$lib/server/utilities';
import * as v from "valibot";
import type {DatabaseResult} from "$lib/server/db/database";
import type {Inventory} from '$lib/server/db/schema';

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
 *   - <strong>uuid</strong> <i>as UUIDv7</i>
 *   - <strong>owner</strong> <i>as UUIDv7</i>
 *   - <strong>name</strong> <i>as string</i>
 *   - <strong>description</strong> <i>as string</i>
 *   - <strong>image_path</strong> <i>as URL/URI as string</i>
 *   - <strong>item_amount</strong> <i>as number</i>
 *   - <strong>last_update</strong> <i>as Date or string</i>
 * @return Array
 */
export const getInventories = query(inventoriesObj, async (data): Promise<Inventory[]> => {
    if (!util.isOffline()) {
        const result: DatabaseResult = await db.Inventories.fetch(data.amount,data.order_by,data.order == '' ? 'ASC' : data.order,data.offset);

        if (result.success) {
            return result.result ?? [];
        }
    }

    return [];
});

export const getTotalInventoryCount = query(async (): Promise<number> => {
    if (util.isOffline()) {
        const result: DatabaseResult = await db.Inventories.fetchTotalInventoryCount();

        if (result.success) {
            return result.result ?? 1;
        }
    }

    return 1;
});