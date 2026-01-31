import type {Actions} from "../../../.svelte-kit/types/src/routes/demo/lucia/login/$types";
import {fail, redirect} from "@sveltejs/kit";
import {hash} from "@node-rs/argon2";
import * as db from "$lib/server/db/database";
import * as auth from "$lib/server/auth";
import type {PageServerLoad} from "../../../.svelte-kit/types/src/routes/login/$types";
import {validateUsername,validateEmail,validatePassword} from "$lib/server/auth";
import type {Session,User} from "$lib/server/db/database";

export const load: PageServerLoad = async (event) => {
    if (event.locals.user) {
        return redirect(302, '/');
    }
    return {};
};

export const actions: Actions = {
    register: async (event) => {
        const formData = await event.request.formData();
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');

        if (!validateUsername(username)) {
            return fail(400, { message: 'Invalid username' });
        }

        if (!validateEmail(email)) {
            return fail(400, { message: 'Invalid email' });
        }

        if (!validatePassword(password)) {
            return fail(400, { message: 'Invalid password' });
        }

        const passwordHash: string = await hash(password, {
            // recommended minimum parameters
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
        });

        try {
            const user: User | undefined = await db.Users.create(email,username,passwordHash);

            if (!user) {
                return fail(500, { message: 'An error has occurred' });
            }

            const sessionToken: string = auth.generateSessionToken();
            const session: Session = await auth.createSession(sessionToken, user.uuid);
            auth.setSessionTokenCookie(event, sessionToken, session.expires);
        } catch {
            return fail(500, { message: 'An error has occurred' });
        }
        return redirect(302, '/');
    }
}