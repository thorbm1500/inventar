import * as db from '$lib/server/db/database';
import type {DatabaseResult} from "$lib/server/db/database";

export interface UserInterface {
    uuid: string,
    email: string,
    username: string,
    profile_picture: string | null,
    created_at: string,
    last_login: string,
    superuser: boolean,
    primary_inventory: string | null
}

/**
 * Wrapper class for all User related actions.
 * Made to allow for cleaner database code.
 */
class User {
    static async createNewUser(email: string, username: string, passwordHash: string): Promise<string> {
        const result: DatabaseResult = await db.Users.create(email,username,passwordHash);
        if (!result.success) {
            //todo: Implement
        }
        return '';
    }
}

export default { User };