import {form} from "$app/server";
import * as v from 'valibot';

export const accountSettings = form(
    v.object({
        uuid: v.pipe(v.string(), v.nonEmpty()),
        email: v.pipe(v.string(), v.nonEmpty()),
        username: v.pipe(v.string(), v.nonEmpty())
    }), async ({uuid,email,username}) => {

        return {success:true};
    });