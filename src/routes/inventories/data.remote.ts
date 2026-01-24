import {query} from '$app/server';
import * as db from '$lib/server/db/db'
import type {RowList} from "postgres";

export const getInventories = query(async (): Promise<RowList<any>> => {
    return await db.Inventories.fetchAll();
});