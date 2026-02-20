import * as v from 'valibot';
import {form} from "$app/server";
import * as db from '$lib/server/db/database';
import {redirect} from "@sveltejs/kit";
import type {Inventory} from "$lib/server/db/interfaces";
import Log from "$lib/server/internal/log";

export const createInventory = form(
    v.object({
        owner: v.pipe(v.string(), v.nonEmpty('Error: No UUID found. New inventories must be given the UUID of the owner, when created!')),
        name: v.pipe(v.string(), v.nonEmpty('Error: No inventory name found. New inventories must be given a name, when created!')),
        description: v.optional(v.string(), undefined)
    }),
    async ({owner, name, description}) => {
        const inventory: Inventory | undefined = await db.Inventories.create(owner, name, description);
        if (!inventory) {
            Log.error(`Failed to create new inventory with name: ${name}`)
            return {success: false, message: 'Failed to create new inventory!'};
        }

        return redirect(302, '/inventory/'.concat(inventory.uuid));
    }
);