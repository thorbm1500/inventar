import {command, query} from "$app/server";
import {generateRegistrationToken} from "$lib/server/internal/auth";
import {connection} from "$lib/server/db/database";
import {promises as fs} from 'fs';
import * as v from 'valibot';

export const generateNewRegistrationToken = command(async (): Promise<string> => {
    const newToken: string = generateRegistrationToken();
    await connection.execute(`UPDATE application_settings SET text_value=? WHERE category='security' AND subcategory='general' AND setting='registration_token'`,[newToken]);
    return newToken;
})

export const getLatestLogs = query(v.string() ,async (directory: string): Promise<string> => {
    const file = await fs.readFile('/home/zeus/WebstormProjects/inventar/logs/inventar-16-02-2026-output.log');
    return file.toString('utf-8');
});