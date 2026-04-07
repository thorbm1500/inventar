import {promises as fs} from "node:fs";
import {generateRegistrationToken} from "$lib/server/internal/auth";
import {LOGGER} from "../../../hooks.server";
import {applicationVersion} from "./utilities";
import {building} from "$app/environment";
import type {LocaleType} from "$lib/locale/locales";
import {LogLevel} from "$lib/server/internal/logger";

function getSettingsFile(): Bun.BunFile {
    return Bun.file('/etc/inventar/settings.json5');
}

async function ensureDirectoriesAndFiles(): Promise<void> {
    await ensureDirectories();
    await ensureSettingsFile();
}

/**
 * todo
 */
export async function getSettings(): Promise<ApplicationSettings> {
    if (building) return defaultSettings;

    await ensureDirectoriesAndFiles();

    return Bun.JSON5.parse(await Bun.file('/etc/inventar/settings.json5').text()) as ApplicationSettings;
}

export async function updateSettings(settings: ApplicationSettings): Promise<void> {
    if (building) return;

    await ensureDirectoriesAndFiles();

    const text: string | undefined = Bun.JSON5.stringify(settings, null, 2);
    if (!text) return;

    await getSettingsFile().write(text);
}

/**
 * todo
 */
async function ensureDirectories(): Promise<void> {
    if (building) return;

    const first: string | undefined = await fs.mkdir('/etc/inventar', {recursive: true});
    if (first) LOGGER.debug(`Created directory /etc/inventar`);

    const second: string | undefined = await fs.mkdir('/etc/inventar/logs', {recursive: true});
    if (second) LOGGER.debug(`Created directory /etc/inventar/logs`);

    const third: string | undefined = await fs.mkdir('/etc/inventar/data', {recursive: true});
    if (third) LOGGER.debug(`Created directory /etc/inventar/data`);

    if (first || second || third) LOGGER.debug(`All missing directories, have been created.`);
}

/**
 * todo
 */
async function ensureSettingsFile(): Promise<void> {
    if (building) return;

    const existing: boolean = await fs.exists('/etc/inventar/settings.json5');
    if (!existing) await Bun.write('/etc/inventar/settings.json5', Bun.JSON5.stringify(defaultSettings,null,2) ?? 'Failed to write settings to file.');
}

export interface ApplicationSettings {
    version: string,
    general: {
        basics: {
            application_id: string,
            language: LocaleType,
            log_level: LogLevel
        },
        mail: {
            host: string,
            port: number,
            user: string,
            password: string,
            sender_mail: string,
            sender_name: string
        }
    },
    security: {
        general: {
            allow_registration: boolean,
            require_token: boolean,
            registration_token: string
        },
        accounts: undefined,
        privacy: {
            telemetry_enable: boolean,
            telemetry_country: boolean,
            telemetry_region: boolean,
            telemetry_inventories: boolean,
            telemetry_unique_items: boolean,
            telemetry_total_items: boolean
        },
        api: undefined
    },
    system: {
        tasks: undefined,
        audit: undefined,
        logs: undefined
    },
    other: {
        feedback: undefined,
        faq: undefined,
        about: undefined
    }
}

const defaultSettings: ApplicationSettings = {
    version: await applicationVersion(),
    general: {
        basics: {
            application_id: Bun.randomUUIDv7(),
            language: 'English',
            log_level: LogLevel.INFO
        },
        mail: {
            host: '',
            port: 587,
            user: '',
            password: '',
            sender_mail: 'no-reply@inventar.dev',
            sender_name: 'inventar'
        }
    },
    security: {
        general: {
            allow_registration: false,
            require_token: true,
            registration_token: generateRegistrationToken()
        },
        accounts: undefined,
        privacy: {
            telemetry_enable: true,
            telemetry_country: true,
            telemetry_region: true,
            telemetry_inventories: true,
            telemetry_unique_items: true,
            telemetry_total_items: true
        },
        api: undefined
    },
    system: {
        tasks: undefined,
        audit: undefined,
        logs: undefined
    },
    other: {
        feedback: undefined,
        faq: undefined,
        about: undefined
    }
}