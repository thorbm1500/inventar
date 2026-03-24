import * as v from "valibot";
import {command} from "$app/server";
import {Users} from "$lib/server/db/database";

/**
 * todo: Reimplement
 */
export const updateTheme = command(v.object({id: v.string(), theme: v.string()}), async (data): Promise<void> => {
    if (data.theme === 'light' || data.theme === 'dark') await Users.updatePreferredTheme(data.id, data.theme);
});