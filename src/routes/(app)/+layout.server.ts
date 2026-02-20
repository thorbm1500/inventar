export async function load({ locals }) {
    return {
        user: locals.user,
        uuid: locals.uuid
    };
}