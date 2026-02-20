import {form, query} from "$app/server";
import * as v from 'valibot';
import {Auth, Users} from "$lib/server/db/database";
import type {Session} from "$lib/server/db/interfaces";

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

export const getSessions = query(v.string(), async (id: string): Promise<Session[]> => {
    return Auth.getSessions(id);
});