import * as v from 'valibot';
import {form} from "$app/server";

export const createInventory = form(
    v.object({
        name: v.pipe(v.string(), v.nonEmpty()),
        description: v.string(),
        image: v.file()
    }),
    async ({name, description, image}) => {

    }
);