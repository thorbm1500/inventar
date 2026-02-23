// @ts-nocheck
import type {PageServerLoad} from './$types';
import {redirect} from "@sveltejs/kit";
import {validate} from "uuid";
import {Users} from "$lib/server/db/database";
import {APPLICATION_SETTINGS} from "$lib/server/internal/settings";
import type {ApplicationSettings} from "$lib/server/db/components/ApplicationSettingsDefaults";

export const load = async({locals}: Parameters<PageServerLoad>[0]): Promise<{settings: ApplicationSettings}> => {
    if (locals.user) {
        if (locals.user.superuser) {
            return {settings: APPLICATION_SETTINGS};
        }
    } else if(locals.uuid && validate(locals.uuid) && await Users.isSuperuser(locals.uuid)) {
        return {settings: APPLICATION_SETTINGS};
    }

    redirect(302, '/');
}