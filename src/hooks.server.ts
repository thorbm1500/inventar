import {type Handle, redirect, type ServerInit} from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import * as db from '$lib/server/db/database'
import initializeDatabase from '$lib/server/db/index';
import type {User} from "$lib/server/db/database";
import {sessionCookieName} from "$lib/server/auth";

/**
 * Initializes the database, and ensures all tables, and default values are present.
 */
export const init: ServerInit = async (): Promise<void> => {
	await initializeDatabase()
}

const public_paths = [
	'/register',
	'/login',
	'/reset-password'
];

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken: string | undefined = event.cookies.get(sessionCookieName);

	if (!sessionToken) {
		event.locals.uuid = null;
		event.locals.session_id = null;

		if (!public_paths.includes(event.url.pathname)){
			return redirect(302, '/login')
		} else {
			return resolve(event);
		}
	}

	const { uuid,session_id,expires } = await auth.validateSessionToken(sessionToken);

	if (session_id) {
		auth.setSessionTokenCookie(event, sessionToken, expires);
	} else {
		auth.deleteSessionTokenCookie(event);
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