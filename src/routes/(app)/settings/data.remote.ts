import {form, query} from "$app/server";
import * as v from 'valibot';
import {Users} from "$lib/server/db/database";

export const getSettings = query(v.string(), async (id: string): Promise<Object> => {
    return structuredClone(await Users.getSettings(id));
});

export const accountSettings = form(
    v.object({
        uuid: v.pipe(v.string(), v.nonEmpty()),
        email: v.pipe(v.string(), v.nonEmpty()),
        username: v.pipe(v.string(), v.nonEmpty())
    }), async ({uuid,email,username}) => {

        return {success:true};
    });