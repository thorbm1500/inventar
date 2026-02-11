import * as v from 'valibot';
import {form} from "$app/server";
import type {DatabaseResult} from "$lib/server/db/database";
import * as db from '$lib/server/db/database';
import {promises as fs} from "fs";
import {getInventoryDirectory} from "$lib/server/internal/settings";
import {redirect} from "@sveltejs/kit";

export const createInventory = form(
    v.object({
        owner: v.pipe(v.string(), v.nonEmpty('Error: No UUID found. New inventories must be given the UUID of the owner, when created!')),
        name: v.pipe(v.string(), v.nonEmpty('Error: No inventory name found. New inventories must be given a name, when created!')),
        description: v.optional(v.string(), undefined),
        image: v.optional(v.file(), undefined)
    }),
    async ({owner, name, description, image}) => {
        const result: DatabaseResult = await db.Inventories.create(owner,name,description);
        if (!result.success) {
            return {success:false,message:result.message};
        }

        const uuid: string = result.result;

        if (image) {
            try {
                await fs.mkdir(getInventoryDirectory(uuid,['images']),{recursive:true});

                const bytes = await (image as File).bytes();
                await fs.writeFile(getInventoryDirectory(uuid,['images','thumbnail.png']), bytes);
            } catch (error) {
                console.error(`Error: Failed to write image. ${error}`);
                return {success: false, failed: true, error: `Item has been created, but image upload failed: ${error}`}
            }
        }

        return redirect(302, '/inventory/'.concat(uuid));
    }
);