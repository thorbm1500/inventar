import type {Handle, ServerInit} from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import initializeDatabase from '$lib/server/db/index';

/**
 * Initializes the database, and ensures all tables, and default values are present.
 */
export const init: ServerInit = async (): Promise<void> => {
	await initializeDatabase()
}

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;

		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} else {
		auth.deleteSessionTokenCookie(event);
	}

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};

export const handle: Handle = handleAuth;