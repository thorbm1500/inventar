import {query} from "$app/server";
import util from "$lib/server/utilities";
import * as db from "$lib/server/db/database";
import * as v from "valibot";

export const getUser = query(v.string(), async (id: string): Promise<any> => {
    if (util.isOffline(true)) {
        return undefined;
    }
    else {
        const result = await db.Users.getFromUuid(id);
        return result;
    }
});