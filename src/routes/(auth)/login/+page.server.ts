import type {PageServerLoad} from './$types';
import {getApplicationSettings} from "../../../hooks.server";

export const load: PageServerLoad = (async() => {
        return {
            allowRegistration: (await getApplicationSettings()).security.general.allow_registration
        }
});