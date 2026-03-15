import initializeDatabase from '$lib/server/db/index';
import type {Session, User} from "$lib/server/db/interfaces";
import * as auth from '$lib/server/internal/auth';
import {building} from '$app/environment';
import {env} from "$env/dynamic/private";
import {type Handle, type HandleServerError, redirect, type ServerInit} from '@sveltejs/kit';
import utilities from "$lib/server/internal/utilities";
import cron from "$lib/server/internal/cron";
import {Logger, LogLevel} from "$lib/server/internal/logger";
import {type ApplicationSettings, getSettings} from "$lib/server/internal/settings";
import cookies from "$lib/server/internal/components/Cookies";
import {Auth, Users} from "$lib/server/db/database";

export const LOGGER: Logger = new Logger(LogLevel.DEBUG);
export const APPLICATION_SETTINGS: ApplicationSettings = await getSettings();

/**
 * This database uses the native Bun SQL bindings. <br>
 * Read more about it here: https://bun.com/docs/runtime/sql
 */
export const SQL: Bun.SQL = new Bun.SQL({
    adapter: 'mysql',
    max: 10,
    idleTimeout: 0,
    maxLifetime: 0,
    connectionTimeout: 60,
    bigint: true,
    onconnect: (err): void => {
        if (err) {
            LOGGER.error(`Failed to connect to database. `, err);
        } else {
            LOGGER.debug('New database connection established.');
        }
    }
});

/**
 * Initializes the database, and ensures all tables, and default values are present.
 */
export const init: ServerInit = async (): Promise<void> => {
    await LOGGER.timed('Initializing server...', 'Server initialized.', async (): Promise<void> => {

        // Skip database initialization if project is building.
        if (!building) {
            process.once('SIGINT', shutdown);
            process.once('sveltekit:shutdown', shutdown);

            LOGGER.debug('Shutdown hooks registered.');

            if (env.INIT_DB !== 'false') await initializeDatabase();
            cron.initializeJobs();
        }
    });
}

async function shutdown(reason?: any): Promise<void> {
    LOGGER.debug(`Shutdown request received. Reason: `, reason);
    LOGGER.info(`Shutting down...`);

    await LOGGER.timed(`Closing database connection.`,`Connection closed.`,SQL.close);
    LOGGER.destroy();

    process.exit();
}

export const handleError: HandleServerError = async ({error}) => {
    const errorMessage: string = (error as Error)?.message ?? 'Internal Error';

    LOGGER.error(errorMessage);

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
    const sessionToken: string | undefined = event.cookies.get(cookies.Session);

    if (!sessionToken) {
        if (utilities.isCrawler(event.request.headers.get('User-Agent'))) {
            return new Response('');
        }

        event.locals.uuid = null;
        event.locals.session_id = null;

        if (isPublicPath(event.url.pathname)) {
            return resolve(event);
        } else {
            return redirect(302, '/login');
        }
    }

    const session: Session | null = await auth.validateSessionToken(sessionToken, event);

    if (!session) {
        auth.deleteSessionTokenCookie(event);
        return redirect(302, '/login');
    }

    if (event.url.pathname === '/logout') {
        await Auth.invalidateSession(session.session_id);
        auth.deleteSessionTokenCookie(event);
        return redirect(302, '/login');
    }

    if (isPublicPath(event.url.pathname)) {
        return redirect(302, '/');
    }

    const user: User | undefined = await Users.getFromUuid(session.uuid);

    if (!user) {
        await Auth.invalidateSession(session.session_id);
        auth.deleteSessionTokenCookie(event);
        return redirect(302, '/login');
    }

    event.locals.user = user;
    event.locals.uuid = user.uuid;
    event.locals.session_id = session.session_id;

    return resolve(event);
};

export const handle: Handle = handleAuth;