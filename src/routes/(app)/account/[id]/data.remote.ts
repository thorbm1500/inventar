import {query} from "$app/server";
import util from "$lib/server/utilities";
import * as db from "$lib/server/db/database";
import * as v from "valibot";
import type {DatabaseResult} from "$lib/server/db/database";

export const getUser = query(v.string(), async (id: string): Promise<any> => {
    if (!util.isOffline()) {
        const result: DatabaseResult = await db.Users.getFromUuid(id);

        if (result.success) {
            return result;
        }
    }

    return undefined;
});