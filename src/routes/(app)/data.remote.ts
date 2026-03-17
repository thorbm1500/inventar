import * as v from "valibot";
import {command} from "$app/server";
import {Users} from "$lib/server/db/database";
import type {PageTheme} from "$lib/server/db/interfaces";

/**
 * todo: Reimplement
 */
export const updateTheme = command(v.object({id: v.string(), theme: v.string()}), async (data): Promise<void> => {
    await Users.updatePreferredTheme(data.id, data.theme as PageTheme);
});