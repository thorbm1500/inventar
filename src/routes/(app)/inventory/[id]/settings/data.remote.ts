import {form, query} from "$app/server";
import * as v from "valibot";
import type {InventoryGeneralSettings} from "$lib/server/db/schema";
import util from "$lib/server/utilities";
import * as db from "$lib/server/db/database";
import Log from "$lib/server/internal/log";
import {error} from "@sveltejs/kit";

export const getGeneralSettings = query(v.pipe(v.string(), v.nonEmpty(`The inventory's UUID must be provided when attempting the browse its contents!`)), async (id: string): Promise<InventoryGeneralSettings | undefined> => {
    let settings: InventoryGeneralSettings | undefined;

    if (!util.isOffline()) {
        settings = await db.Inventories.fetchGeneralSettings(id);
        if (!settings) {
            Log.error(`Failed to fetch general settings for inventory with ID: ${id}`);
            error(500, "Failed to fetch general inventory settings.");
        }

    }

    return settings;
});

export const updateInventoryGeneral = form(
    v.object({
        name: v.pipe(v.string(), v.nonEmpty('All inventories must have a name!')),
        description: v.optional(v.string(), ''),
        hideEmptyDescriptions: v.boolean()
    }),
    ({name, description, hideEmptyDescriptions}) => {

        return {success:true};
    }
);