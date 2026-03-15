import {LOGGER} from '../../../hooks.server';
import {command, query} from '$app/server';
import {generateRegistrationToken} from '$lib/server/internal/auth';
import {getConnection} from '$lib/server/db/database';
import {promises as fs} from 'fs';
import * as v from 'valibot';
import {formatLogs} from '$lib/util/utilities';

export const generateNewRegistrationToken = command(async (): Promise<string> => {
    const newToken: string = generateRegistrationToken();
    await getConnection()`UPDATE application_settings
                          SET text_value=${newToken}
                          WHERE category = 'security'
                            AND subcategory = 'general'
                            AND setting = 'registration_token'`
    return newToken;
})

export const getLatestLogs = query(v.string(), async (directory: string): Promise<string[]> => {
    const file = await fs.readFile(directory)
        .catch(err => {
            LOGGER.error(`Failed to load logs`, err);
            return err.toString();
        });

    return formatLogs(typeof file === 'string' ? ['Failed to load logs', file] : file.toString('utf-8').split('\n'));
});