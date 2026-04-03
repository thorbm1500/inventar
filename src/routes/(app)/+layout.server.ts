import {APPLICATION_LOCALE} from "../../hooks.server";

export async function load({ locals }) {
    return {
        user: locals.user,
        userSettings: locals.userSettings,
        uuid: locals.uuid,
        locale: APPLICATION_LOCALE
    };
}