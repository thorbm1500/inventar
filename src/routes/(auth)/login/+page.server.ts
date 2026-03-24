import type {PageServerLoad} from './$types';
import {APPLICATION_SETTINGS} from "../../../hooks.server.ts";

export const load: PageServerLoad = (async() => {
        return {
            allowRegistration: APPLICATION_SETTINGS.security.general.allow_registration
        }
});