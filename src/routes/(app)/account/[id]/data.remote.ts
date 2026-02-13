import {query} from "$app/server";
import util from "$lib/server/utilities";
import * as db from "$lib/server/db/database";
import * as v from "valibot";
import type {User} from "$lib/server/db/schema";

export const getUser = query(v.string(), async (id: string): Promise<User | undefined> => {
    if (!util.isOffline()) {
        const user: User | undefined = await db.Users.getFromUuid(id);
        return user;
    }

    return undefined;
});