import {verify} from '@node-rs/argon2';
import {fail, redirect} from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import * as db from "$lib/server/db/database";
import type {Actions, PageServerLoad} from '../../../../.svelte-kit/types/src/routes';
import type {Session, User} from "$lib/server/db/schema";

export const load: PageServerLoad = async (event) => {
    if (event.locals.session_id && event.locals.user) {
        return redirect(302, '/');
    }
    return {};
};

export const actions: Actions = {
    login: async (event) => {
        const formData = await event.request.formData();
        const email = formData.get('email');
        const password = formData.get('password');

        if (!auth.validateEmail(email)) {
            return fail(400, {message: 'Invalid email (min 3, max 31 characters, alphanumeric only)'});
        }
        if (!auth.validatePassword(password)) {
            return fail(400, {message: 'Invalid password (min 32, max 255 characters)'});
        }

        const existingUser: User | undefined = await db.Users.getFromEmail(email);

        if (!existingUser) {
            return fail(400, {message: 'Incorrect username or password'});
        }

        const passwordHash: String | undefined = await db.Users.getPasswordHash(existingUser.uuid);

        if (!passwordHash) {
            return fail(400, {message: 'Incorrect username or password'});
        }

        const validPassword = await verify(passwordHash.valueOf(), password, {
            memoryCost: 19456,
            timeCost: 5,
            outputLen: 32,
            parallelism: 1,
        });

        if (!validPassword) {
            return fail(400, {message: 'Incorrect username or password'});
        }

        const sessionToken: string = auth.generateSessionToken();
        const session: Session = await auth.createSession(sessionToken, existingUser.uuid);
        auth.setSessionTokenCookie(event, sessionToken, session.expires);

        return redirect(302, '/');
    }
}