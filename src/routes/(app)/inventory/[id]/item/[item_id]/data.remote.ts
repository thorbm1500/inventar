import {query} from "$app/server";
import * as v from 'valibot';
import {Items} from "$lib/server/db/components/item";

export const getItem = query(v.string(), async(uuid: string) => {
    const item = await Items.getItem(uuid);

    return item === undefined ? null : item;
});