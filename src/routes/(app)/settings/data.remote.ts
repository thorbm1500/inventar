import {LOGGER, getApplicationSettings, loadApplicationLocale} from "../../../hooks.server";
import {command, query} from "$app/server";
import {generateRegistrationToken} from "$lib/server/internal/auth";
import {promises as fs} from "node:fs";
import * as v from "valibot";
import {formatLogs} from "$lib/util/utilities";
import {type ApplicationSettings, updateSettings} from "$lib/server/internal/settings";
import type {ApplicationLocale} from "$lib/locale/locales";

export const generateNewRegistrationToken = command(async (): Promise<string> => {
    const token: string = generateRegistrationToken();
    const settings: ApplicationSettings = await getApplicationSettings();
    settings.security.general.registration_token = token;
    await updateSettings(settings);
    return token;
})

export const saveSettings = command(v.unknown(), async (data: unknown): Promise<void> => {
    if (!!data && !!(data as ApplicationSettings)) {
        await updateSettings(data as ApplicationSettings);
    }
})

export const getSettings = query(async (): Promise<ApplicationSettings> => {
    return await getApplicationSettings(true);
});

export const getCurrentLocale = query(async (): Promise<ApplicationLocale> => {
   return await loadApplicationLocale();
});

export const getLatestLogs = query(v.string(), async (directory: string): Promise<string[]> => {
    const file = await fs.readFile(directory)
        .catch(err => {
            LOGGER.error(`Failed to load logs`, err);
            return err.toString();
        });

    return formatLogs(typeof file === 'string' ? ['Failed to load logs', file] : file.toString('utf-8').split('\n'));
});