import type {Session, User} from '$lib/server/db/interfaces';
import * as auth from '$lib/server/internal/auth';
import {building} from '$app/environment';
import {type Handle, type HandleServerError, redirect, type ServerInit} from '@sveltejs/kit';
import utilities from '$lib/server/internal/utilities';
import cron from '$lib/server/internal/cron';
import {Logger, LogLevel} from '$lib/server/internal/logger';
import {type ApplicationSettings, getSettings} from '$lib/server/internal/settings';
import {Auth, Database, Users} from '$lib/server/db/database';
import inventar from '$lib/server/internal/inventar';
import {fetchItemPrice} from "$lib/util/ExternalUtility";

export const LOGGER: Logger = new Logger(LogLevel.DEBUG);
export const APPLICATION_SETTINGS: ApplicationSettings = await getSettings();

/**
 * Initializes the database, and ensures all tables, and default values are present.
 */
export const init: ServerInit = async (): Promise<void> => {
    //await fetchItemPrice('https://www.autozone.com/p/stp-extended-life-engine-oil-filter-element-s9972xl/663650?productPartGroupId=azpg1622&productBrandId=FBRB&productUniqueId=456454654');

    await LOGGER.timed('Initializing server...', 'Server initialized.', async (): Promise<void> => {
        // Skip database initialization if project is building.
        if (!building) {
            process.once('SIGINT', shutdown);
            LOGGER.debug('Shutdown hooks registered.');

            await Database.init();
            cron.initializeJobs();
        }
    })
        .then((): void => {
            LOGGER.done(`\nSystem Stats`, `\n Root: `, process.cwd(), `\n Available Memory: `, (process.availableMemory() / 1000 / 1000 / 1000).toFixed(2), 'GB');
        });
}

async function shutdown(reason?: any): Promise<void> {
    LOGGER.debug(`Shutdown request received. Reason: `, reason);
    LOGGER.info(`Shutting down...`);

    await LOGGER.timed(`Closing database connection.`, `Connection closed.`, Database.shutdown);
    LOGGER.destroy();
}

export const handleError: HandleServerError = async ({error}) => {
    if ((error as Error)?.message) {
        LOGGER.error((error as Error)?.message);
    } else {
        LOGGER.error('Internal Error. ', error);
    }

    return {
        message: 'Whoops.. Sorry!'
    };
};

const public_paths: string[] = [
    '/register',
    '/login',
    '/reset-password'
];

function isPublicPath(path: string): boolean {
    return public_paths.includes(path) || /^\/(reset-password)\/[a-zA-Z0-9-_]*\/?$/.test(path);
}

const handleAuth: Handle = async ({event, resolve}): Promise<Response> => {
    const token: string | undefined = event.cookies.get(inventar.Cookies.Session);

    if (!token) {
        /**
         * Crawling is disallowed in `robots.txt`, but seeing as it is only a preference, and not actually
         * enforced, along with the fact, that you can simply choose to not respect it, if you wish;
         * Crawling is disabled and attempted blocked.
         */
        if (utilities.isCrawler(event.request.headers.get('User-Agent'))) {
            return new Response('');
        }

        return isPublicPath(event.url.pathname) ? resolve(event) : redirect(302, '/login');
    }

    const session: Session | null = await auth.validateSessionToken(token, event);

    if (!session) {
        auth.deleteSessionTokenCookie(event);
        return redirect(302, '/login');
    }

    if (event.url.pathname === '/logout') {
        await Auth.invalidateSession(session.session_id);
        auth.deleteSessionTokenCookie(event);
        return redirect(302, '/login');
    }

    const user: User | undefined = await Users.getFromUuid(session.uuid);

    if (!user) {
        await Auth.invalidateSession(session.session_id);
        auth.deleteSessionTokenCookie(event);
        return redirect(302, '/login');
    }

    event.locals.user = user;
    event.locals.userSettings = await Users.getSettings(user.uuid);
    event.locals.uuid = user.uuid;
    event.locals.session_id = session.session_id;

    return isPublicPath(event.url.pathname) ? redirect(302, '/') : resolve(event);
};

export const handle: Handle = handleAuth;