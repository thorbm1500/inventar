import {LOGGER} from "../../../hooks.server";
import {command, query} from "$app/server";
import {generateRegistrationToken} from "$lib/server/internal/auth";
import {promises as fs} from "node:fs";
import * as v from "valibot";
import {formatLogs} from "$lib/util/utilities";
import {Application} from "$lib/server/db/database";

export const generateNewRegistrationToken = command(async (): Promise<string> => {
    const token: string = generateRegistrationToken();
    await Application.updateRegistrationToken(token);
    return token;
})

export const getLatestLogs = query(v.string(), async (directory: string): Promise<string[]> => {
    const file = await fs.readFile(directory)
        .catch(err => {
            LOGGER.error(`Failed to load logs`, err);
            return err.toString();
        });

    return formatLogs(typeof file === 'string' ? ['Failed to load logs', file] : file.toString('utf-8').split('\n'));
});