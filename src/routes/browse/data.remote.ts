import {query} from '$app/server';
import * as db from '$lib/server/db/database'
import type {RowList} from "postgres";
import util from '$lib/server/utilities';

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
export const getInventories = query(async (): Promise<RowList<any>> => {
    if (util.isOffline(true)) {
        return [];
    }
    else {
        const result = await db.Inventories.fetchAll();
        return result;
    }
});