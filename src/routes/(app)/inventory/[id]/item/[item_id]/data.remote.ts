import {query} from "$app/server";
import * as v from 'valibot';
import {type Item, Items} from "$lib/server/db/components/item";

export const getItem = query(v.string(), async(uuid: string) => {
    const item: Item | undefined = await Items.getItem(uuid);

    return item === undefined ? null : item;
});