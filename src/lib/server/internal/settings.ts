import {promises as fs} from "node:fs";
import {generateRegistrationToken} from "$lib/server/internal/auth";
import {LOGGER} from "../../../hooks.server";
import {applicationVersion} from "./utilities";

const settingsFile = Bun.file('/etc/inventar/settings.json5');

/**
 * todo
 */
export async function getSettings(): Promise<ApplicationSettings> {
    await ensureDirectories();
    await ensureSettingsFile();

    return Bun.JSON5.parse(await settingsFile.text()) as ApplicationSettings;
}

/**
 * todo
 */
async function ensureDirectories(): Promise<void> {
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
    const existing: boolean = await fs.exists('/etc/inventar/settings.json5');
    if (!existing) await Bun.write('/etc/inventar/settings.json5', Bun.JSON5.stringify(defaultSettings,null,2) ?? 'Failed to write settings to file.');
}

export interface ApplicationSettings {
    version: string,
    general: {
        basics: {
            application_id: string,
            log_level: string
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
            log_level: 'info'
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