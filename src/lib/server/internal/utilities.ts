import {getApplicationSettings, LOGGER} from "../../../hooks.server";
import {get, type IncomingMessage} from "node:http";
import type {RequestEvent} from "@sveltejs/kit";
import {Auth} from "$lib/server/db/database";
import type {ApplicationLocale} from "$lib/locale/locales";

const BROWSER_OFFLINE_RESPONSE = "Error! The browser is offline.";
/** @author https://stackoverflow.com/a/201378 */
const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+(?:\.[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9\x2d]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+))/;

const CRAWLER_REGEX = new RegExp(/(Bot|OAI|openai|ChatGPT-User|Yahoo! Slurp|amazon|okhttp|GLS|Axios|Google-Read-Aloud|HeadlessChrome|facebook|BingPreview)/, 'i');

const MOBILE_REGEX = new RegExp(/(Mobile|Phone|iPhone|iPad|Dalvik|Linux; U;)/, 'i');
const COMPUTER_REGEX = new RegExp(/(Windows|Win64|Mac OS)/, 'i');

const ANDROID_REGEX = new RegExp(/(Android)/, 'i');
const LINUX_REGEX = new RegExp(/(Linux|Ubuntu)/, 'i');
const CHROMEBOOK_REGEX = new RegExp(/(CrOS)/, 'i');
const WINDOWS_PHONE_REGEX = new RegExp(/(Windows Phone)/, 'i');
const WINDOWS_REGEX = new RegExp(/(Windows|Win64)/, 'i');
const IPHONE_REGEX = new RegExp(/(iPhone)/, 'i');
const IPAD_REGEX = new RegExp(/(iPad)/, 'i');
const MAC_REGEX = new RegExp(/(Macintosh|Mac OS)/, 'i');

/**
 * todo
 */
export async function applicationVersion(): Promise<string> {
    return await Bun.file('./package.json').json().then(pkg => pkg.version);
}

/**
 * todo
 * @param path
 */
export async function loadLocale(path: string | URL): Promise<ApplicationLocale> {
    return await Bun.JSON5.parse(await Bun.file(path).text()) as ApplicationLocale;
}

/**
 * todo
 * @param logOnFailure
 */
function isOffline(logOnFailure: boolean = false): boolean {
    const browserConnectionState = navigator.onLine;

    if (logOnFailure && !browserConnectionState) {
        console.error(BROWSER_OFFLINE_RESPONSE);
    }

    return browserConnectionState;
}

/**
 * todo
 * @param userAgentHeader
 */
function isCrawler(userAgentHeader: string | null): boolean {
    return userAgentHeader ? CRAWLER_REGEX.test(userAgentHeader) : true;
}

declare interface HeaderExtractionOptions {
    device?: boolean,
    platform?: boolean,
}

declare interface HeaderExtractionResponse {
    device?: string,
    platform?: string,
}

/**
 * todo
 * @param header
 * @param options
 */
function extractHeaderData(header: string | null, options?: HeaderExtractionOptions): HeaderExtractionResponse {
    let device;
    let platform;

    if (header) {
        if (!options || options.device) {
            if (MOBILE_REGEX.test(header)) device = 'Mobile';
            else if (COMPUTER_REGEX.test(header)) device = 'Computer';
        }

        if (!options || options.platform) {
            if (ANDROID_REGEX.test(header)) platform = 'Android';
            else if (LINUX_REGEX.test(header)) platform = 'Linux';
            else if (CHROMEBOOK_REGEX.test(header)) platform = 'Chromebook';
            else if (WINDOWS_PHONE_REGEX.test(header)) platform = 'Windows Phone';
            else if (WINDOWS_REGEX.test(header)) platform = 'Windows';
            else if (IPHONE_REGEX.test(header)) platform = 'iPhone';
            else if (IPAD_REGEX.test(header)) platform = 'iPad';
            else if (MAC_REGEX.test(header)) platform = 'MacOS';
        }
    }
    return {device, platform};
}

/**
 * todo
 * @param session_id
 * @param event
 */
async function handleSessionInformation(session_id: string, event: RequestEvent): Promise<void> {
    if (!(await Auth.isSessionInformationMissing(session_id))) return;

    // noinspection HttpUrlsUsage
    get(`http://ip-api.com/json/${event.getClientAddress() === '::1' ? '' : event.getClientAddress()}?fields=1056793`,(res: IncomingMessage): void => {
        res.setEncoding('utf8');
        let rawData: string = '';
        res.on('data', (chunk: any): void => { rawData += chunk; });
        res.on('end', (): void => {
            try {
                const parsedData: any = JSON.parse(rawData);
                const {device, platform} = extractHeaderData(event.request.headers.get('User-Agent'));
                if (!parsedData.ip) parsedData.ip = event.getClientAddress();
                parsedData.device = device;
                parsedData.platform = platform;

                Auth.updateSessionInformation(session_id, parsedData);
            } catch (e) {
                LOGGER.error(`Failed to parse JSON data from Response.`,e as Error);
            }
        });
    });
}

export async function getCurrentLocale(): Promise<ApplicationLocale> {
    return await Bun.file(`src/lib/locale/${(await getApplicationSettings()).general.basics.language}.json5`).text().then(res => Bun.JSON5.parse(res)) as ApplicationLocale
}

export default {isOffline, isCrawler, handleSessionInformation, BROWSER_OFFLINE_RESPONSE, EMAIL_REGEX};