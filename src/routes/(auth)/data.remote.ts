import {LOGGER} from '../../hooks.server';
import * as v from 'valibot';
import * as auth from '$lib/server/internal/auth';
import * as db from '$lib/server/db/database';
import {form} from '$app/server';
import type {Session, User} from '$lib/server/db/interfaces';
import {sendPasswordResetLink} from '$lib/server/internal/mail';
import {error, redirect} from '@sveltejs/kit';
import {validateResetRequestToken} from "$lib/server/internal/auth";
import {Auth} from "$lib/server/db/database";

export const requestReset = form(
    v.object({email: v.pipe(v.string(), v.nonEmpty())}),
    async ({email}) => {

        if (!auth.validateEmail(email)) {
            return {success: false, message: 'Invalid email (min 3, max 31 characters, alphanumeric only)'}
        }

        const user: User | undefined = await db.Users.getFromEmail(email);

        if (!user) {
            return {success: true, message: 'A reset link has been sent, if an account with that email exists.'};
        }

        const resetRequest: number = await db.Auth.getResetRequestExpiration(user.uuid);

        if (resetRequest === -1) {
            return {success: true, message: 'A reset link has been sent, if an account with that email exists.'};
        } else if (resetRequest > new Date(Date.now()).getTime()) {
            return {success: true, message: 'A reset link has been sent, if an account with that email exists.'};
        }

        const token: string = await auth.createResetRequest(user.uuid);

        await sendPasswordResetLink(user.email, token);

        return {success: true, message: 'A reset link has been sent, if an account with that email exists.'};
    });

export const resetPassword = form(
    v.object({
        _username: v.pipe(v.string(), v.nonEmpty()),
        _token: v.pipe(v.string(), v.nonEmpty()),
        _password: v.pipe(v.string(), v.nonEmpty())
    }),
    async ({_username, _token, _password}) => {
        const uuid: string | null = await db.Users.getUuidFromUsername(_username);
        if (uuid === null) return {success: false, message: 'Invalid request'};

        const resetRequest: number = await db.Auth.getResetRequestExpiration(uuid);
        if (resetRequest === -1) {
            return {success: false, message: 'Invalid request'};
        } else if (resetRequest < new Date(Date.now()).getTime()) {
            await Auth.deleteResetToken(uuid);
            return {success: false, message: 'Invalid request: Expired.'};
        }

        const resetToken: string | null = await validateResetRequestToken(uuid, _token);
        if (resetToken === null) {
            LOGGER.warn(`Password reset attempt denied, for user '${uuid}': Token mismatch.`);
            return {success: false, message: 'Invalid request'};
        }

        if (!auth.validatePassword(_password)) {
            return {success: false, message: 'Failed to reset password. New password does not fit requirements.'}
        }

        const passwordHash: string = await Bun.password.hash(_password);
        await db.Users.setPasswordHash(uuid, passwordHash);

        return redirect(302, '/login')
    });

export const login = form(
    v.object({
        email: v.pipe(v.string(), v.nonEmpty()),
        _password: v.pipe(v.string(), v.nonEmpty())
    }),
    async ({email, _password}) => {
        if (!auth.validateEmail(email)) {
            LOGGER.error(`Login failed: Invalid email (min 3, max 31 characters, alphanumeric only)`);
            return {success: false, message: 'Invalid email (min 3, max 31 characters, alphanumeric only)'};
        }
        if (!auth.validatePassword(_password)) {
            LOGGER.error(`Login failed: Invalid password (min 32, max 255 characters)`);
            return {success: false, message: 'Invalid password (min 32, max 255 characters)'};
        }

        const user: User | undefined = await db.Users.getFromEmail(email);

        if (!user) {
            return {success: false, message: 'Incorrect username or password'};
        }

        const passwordHash: string = await db.Users.getPasswordHash(user.uuid);

        if (passwordHash === '') {
            return {success: false, message: 'Incorrect username or password'};
        }

        const validPassword: boolean = await Bun.password.verify(_password, passwordHash);

        if (!validPassword) {
            LOGGER.warn(`Failed login attempt for '${email}'`);
            return {success: false, message: 'Incorrect username or password'};
        }

        const session: Session | undefined = await auth.createSession(user.uuid);
        if (!session) return error(500, `Failed to create new session for user '${user.uuid}'`);

        auth.setSessionCookie(session);

        return redirect(302, '/');
    });

export const register = form(
    v.object({
        username: v.pipe(v.string(), v.nonEmpty()),
        email: v.pipe(v.string(), v.nonEmpty()),
        _password: v.pipe(v.string(), v.nonEmpty()),
        _repeat_password: v.pipe(v.string(), v.nonEmpty())
    }),
    async ({username, email, _password, _repeat_password}) => {
        if (_password !== _repeat_password) {
            return {success: false, message: `Passwords do not match!`};
        }

        if (!auth.validateUsername(username)) {
            return {success: false, message: `Invalid username!`};
        }

        if (!auth.validateEmail(email)) {
            return {success: false, message: `Invalid email!`};
        }

        if (!auth.validatePassword(_password)) {
            return {success: false, message: `Invalid password!`};
        }

        const passwordHash: string = await Bun.password.hash(_password);

        try {
            // Give administrator rights if no users have been created yet.
            const userAmount: number = await db.Users.getUserAmount();
            if (userAmount === -1) {
                return {success: false, message: 'Unable to connect to the database!'};
            }
            const user: User | undefined = await db.Users.create(email, username, passwordHash, userAmount === 0);

            if (!user) {
                return {success: false, message: 'Failed to register new user. If this problem persists, please contact an administrator'};
            }
        } catch (error) {
            LOGGER.error(`Failed to register new user.`, error as Error);
            return {success: false, message: 'Internal Error. If this problem persists, please contact an administrator'};
        }
        return {success: true, message: 'Successfully registered!'};
    });