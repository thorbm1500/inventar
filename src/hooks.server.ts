import {type Handle, redirect, type ServerInit} from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import * as db from '$lib/server/db/database'
import initializeDatabase from '$lib/server/db/index';
import type {User} from "$lib/server/db/schema";
import {env} from "$env/dynamic/private";

/**
 * Initializes the database, and ensures all tables, and default values are present.
 */
export const init: ServerInit = async (): Promise<void> => {
    if (env.NODE_ENV === 'development' && env.INIT_DB !== 'true') return;
    await initializeDatabase()
}

const public_paths = [
    '/register',
    '/login',
    '/reset-password'
];

function isPublicPath(path: string): boolean {
    return public_paths.includes(path) || /^\/(reset-password)\/[a-zA-Z0-9-_]*\/?$/.test(path);
}

const handleAuth: Handle = async ({event, resolve}) => {
    const sessionToken: string | undefined = event.cookies.get(auth.sessionCookieName);

    if (!sessionToken) {
        event.locals.uuid = null;
        event.locals.session_id = null;

        if (isPublicPath(event.url.pathname)) {
            return resolve(event);
        } else {
            return redirect(302, '/login');
        }
    } else {
        if (isPublicPath(event.url.pathname)) {
            return redirect(302, '/');
        }
    }

    const {uuid, session_id, expires} = await auth.validateSessionToken(sessionToken);

    if (!session_id) {
        return redirect(302, '/login');
    }

    if (event.url.pathname === '/logout') {
        await auth.invalidateSession(session_id);
        auth.deleteSessionTokenCookie(event);
        return redirect(302, '/login');
    } else {
        auth.setSessionTokenCookie(sessionToken, expires);
    }

    const user: User | undefined = await db.Users.getFromUuid(uuid);

    if (!user) {
        return redirect(302, '/login')
    }

    event.locals.user = user;
    event.locals.session_id = session_id;

    return resolve(event);
};

export const handle: Handle = handleAuth;