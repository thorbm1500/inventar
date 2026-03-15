import * as db from '$lib/server/db/database';
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

export const LOGGER: Logger = new Logger(LogLevel.DEBUG);
export const APPLICATION_SETTINGS: ApplicationSettings = await getSettings();

/**
 * Initializes the database, and ensures all tables, and default values are present.
 */
export const init: ServerInit = async (): Promise<void> => {
    await LOGGER.timed('Initializing server...','Server initialized.', async () => {

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

    await db.getConnection()?.end();
    LOGGER.debug(`Database connection closed.`);
    LOGGER.destroy();

    process.exit();
}

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
    const errorMessage: string = (error as Error)?.message ?? 'Internal Error';

    LOGGER.error(errorMessage);

    return {
        message: 'Whoops.. Sorry!'
    };
};

const public_paths = [
    '/register',
    '/login',
    '/reset-password'
];

function isPublicPath(path: string): boolean {
    return public_paths.includes(path) || /^\/(reset-password)\/[a-zA-Z0-9-_]*\/?$/.test(path);
}

const handleAuth: Handle = async ({event, resolve}): Promise<Response> => {
    const sessionToken: string | undefined = event.cookies.get(auth.sessionCookieName);

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

    const session: Session | null = await auth.validateSessionToken(sessionToken,event);

    if (!session) {
        auth.deleteSessionTokenCookie(event);
        return redirect(302, '/login');
    }

    if (event.url.pathname === '/logout') {
        await db.Auth.invalidateSession(session.session_id);
        auth.deleteSessionTokenCookie(event);
        return redirect(302, '/login');
    } else {
        auth.setSessionTokenCookie(sessionToken, session.expires);
    }

    if (isPublicPath(event.url.pathname)) {
        return redirect(302, '/');
    }

    const user: User | undefined = await db.Users.getFromUuid(session.uuid);

    if (!user) {
        await db.Auth.invalidateSession(session.session_id);
        auth.deleteSessionTokenCookie(event);
        return redirect(302, '/login');
    }

    if (!event.locals.user) event.locals.user = user;
    if (!event.locals.uuid) event.locals.uuid = user.uuid;
    event.locals.session_id = session.session_id;

    return resolve(event);
};

export const handle: Handle = handleAuth;