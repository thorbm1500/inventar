export async function load({ locals }) {
    return {
        user: locals.user,
        userSettings: locals.userSettings,
        uuid: locals.uuid
    };
}