import inventar from "$lib/server/internal/inventar";

export async function load({ locals }) {
    return {
        user: locals.user,
        userSettings: locals.userSettings,
        uuid: locals.uuid,
        locale: inventar.Instance.locale
    };
}