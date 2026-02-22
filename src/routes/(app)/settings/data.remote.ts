import {command} from "$app/server";
import {generateRegistrationToken} from "$lib/server/internal/auth";
import {connection} from "$lib/server/db/database";

export const generateNewRegistrationToken = command(async (): Promise<string> => {
    const newToken: string = generateRegistrationToken();
    await connection.execute(`UPDATE application_settings SET text_value=? WHERE category='security' AND subcategory='general' AND setting='registration_token'`,[newToken]);
    return newToken;
})