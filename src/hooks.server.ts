import { building } from '$app/environment';
import {type Handle, redirect, type ServerInit} from '@sveltejs/kit';
import * as auth from '$lib/server/internal/auth';
import * as db from '$lib/server/db/database'
import initializeDatabase from '$lib/server/db/index';
import {env} from "$env/dynamic/private";
import type {Session, User} from "$lib/server/db/schema";
import Log from "$lib/server/internal/log";

/**
 * Initializes the database, and ensures all tables, and default values are present.
 */
export const init: ServerInit = async (): Promise<void> => {
    if (env.NODE_ENV === 'development' && env.INIT_DB !== 'true') {
        return;
    }

    // Skip database initialization if project is building.
    if (!building) {
        await initializeDatabase();
    }
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
    }

    const session: Session | null = await auth.validateSessionToken(sessionToken);

    if (!session) {
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
        return redirect(302, '/login');
    }

    event.locals.user = user;
    event.locals.session_id = session.session_id;

    return resolve(event);
};

export const handle: Handle = handleAuth;