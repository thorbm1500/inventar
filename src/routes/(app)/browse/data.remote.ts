import {LOGGER} from "../../../hooks.server";
import {query} from '$app/server';
import util from '$lib/server/internal/utilities';
import * as v from "valibot";
import type {Inventory} from '$lib/server/db/interfaces';
import {Inventories} from "$lib/server/db/database";

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
        const inventories: Inventory[] = await Inventories.fetch(data.amount, data.order_by, data.order === 'ASC' ? 'ASC' : 'DESC', data.offset);
        return inventories;
    } else {
        LOGGER.warn(`Unable to fetch inventories from database. Browser is offline.`);
    }

    return [];
});