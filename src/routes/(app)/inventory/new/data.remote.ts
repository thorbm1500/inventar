import {LOGGER} from "../../../../hooks.server";
import * as v from 'valibot';
import {form} from "$app/server";
import type {Inventory} from "$lib/server/db/interfaces";
import {Inventories} from "$lib/server/db/database";

export const createInventory = form(
    v.object({
        owner: v.pipe(v.string(), v.nonEmpty('Error: No UUID found. New inventories must be given the UUID of the owner, when created!')),
        name: v.pipe(v.string(), v.nonEmpty('Error: No inventory name found. New inventories must be given a name, when created!')),
        description: v.optional(v.string(), undefined)
    }),
    async ({owner, name, description}): Promise<{ success: boolean, message: string, redirect: string }> => {
        const inventory: Inventory | undefined = await Inventories.create(owner, name, description);
        if (!inventory) {
            LOGGER.error(`Failed to create new inventory with name: ${name}`)
            return {success: false, message: 'Failed to create new inventory!', redirect: ''};
        }

        return {success: true, message: '', redirect: '/inventory/'.concat(inventory.uuid)};
    }
);