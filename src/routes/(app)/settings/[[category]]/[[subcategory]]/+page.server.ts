import type {PageServerLoad} from './$types';
import {redirect} from "@sveltejs/kit";
import {validate} from 'uuid';
import {Users} from '$lib/server/db/database';
import {getApplicationSettings} from '../../../../../hooks.server';
import type {ApplicationSettings} from '$lib/server/internal/settings';

export const load: PageServerLoad = async({locals}): Promise<{settings: ApplicationSettings}> => {
    if (locals.user) {
        if (locals.user.superuser) {
            return {
                settings: await getApplicationSettings()
            };
        }
    } else if(locals.uuid && validate(locals.uuid) && await Users.isSuperuser(locals.uuid)) {
        return {
            settings: await getApplicationSettings()
        };
    }

    redirect(302, '/');
}