import * as v from 'valibot';
import * as auth from "$lib/server/internal/auth";
import * as db from "$lib/server/db/database";
import {form, getRequestEvent} from '$app/server';
import type {ResetRequest, Session, User} from "$lib/server/db/interfaces";
import {sendPasswordResetLink} from "$lib/server/internal/mail";
import {sha256} from "@oslojs/crypto/sha2";
import {encodeHexLowerCase} from "@oslojs/encoding";
import {hash, verify} from "@node-rs/argon2";
import {redirect, type RequestEvent} from "@sveltejs/kit";
import Log from "$lib/server/internal/log";

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

        const resetRequest: ResetRequest | undefined = await db.Auth.getResetRequestFromUuid(user.uuid);

        if (!resetRequest) {
            return {success: true, message: 'A reset link has been sent, if an account with that email exists.'};
        } else if (resetRequest.expires > new Date(Date.now()).getTime()) {
            return {success: true, message: 'A reset link has been sent, if an account with that email exists.'};
        }

        const resetToken: string = auth.generateResetToken();
        await auth.createResetRequest(resetToken, user.uuid);

        await sendPasswordResetLink(user.email, resetToken);

        return {success: true, message: 'A reset link has been sent, if an account with that email exists.'};
    });

export const resetPassword = form(
    v.object({
        _token: v.pipe(v.string(), v.nonEmpty()),
        _password: v.pipe(v.string(), v.nonEmpty())
    }),
    async ({_token, _password}) => {
        const resetToken: string = encodeHexLowerCase(sha256(new TextEncoder().encode(_token)));
        const resetRequest: ResetRequest | undefined = await db.Auth.getResetRequest(resetToken);

        if (!resetRequest) {
            return {success: false, message: 'Failed to reset password. If this problem persists, please contact the system administrator'};
        } else if (resetRequest.expires > new Date(Date.now()).getTime()) {
            if (!auth.validatePassword(_password)) {
                return {success: false, message: 'Failed to reset password. New password does not fit requirements.'}
            }

            if (resetRequest.uuid) {
                const passwordHash: string = await hash(_password, {
                    memoryCost: 19456,
                    timeCost: 3,
                    outputLen: 32,
                    parallelism: 1,
                });

                await db.Users.setPasswordHash(resetRequest.uuid, passwordHash);
                await db.Auth.deleteResetToken(resetToken);

                return redirect(302, '/login')
            }
        }

        return {success: false, message: 'This password reset link has expired.'}
    });

export const login = form(
    v.object({
        email: v.pipe(v.string(), v.nonEmpty()),
        _password: v.pipe(v.string(), v.nonEmpty())
    }),
    async ({email, _password}) => {
        if (!auth.validateEmail(email)) {
            console.error(`Login failed: Invalid email (min 3, max 31 characters, alphanumeric only)`);
            return {success: false, message: 'Invalid email (min 3, max 31 characters, alphanumeric only)'};
        }
        if (!auth.validatePassword(_password)) {
            console.error(`Login failed: Invalid password (min 32, max 255 characters)`);
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

        const validPassword: boolean = await verify(passwordHash.valueOf(), _password, {
            memoryCost: 19456,
            timeCost: 3,
            outputLen: 32,
            parallelism: 1,
        });

        if (!validPassword) {
            Log.warn(`Failed login attempt for '${email}'`);
            return {success: false, message: 'Incorrect username or password'};
        }

        await db.Users.updateLastLogin(user.uuid);

        const event: RequestEvent = getRequestEvent();

        const sessionToken: string = auth.generateSessionToken();
        const session: Session = await auth.createSession(sessionToken, user.uuid, event);
        auth.setSessionTokenCookie(sessionToken, session.expires);

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

        const passwordHash: string = await hash(_password, {
            memoryCost: 19456,
            timeCost: 3,
            outputLen: 32,
            parallelism: 1
        });

        try {
            // Give administrator rights if no users have been created yet.
            const userAmount: number = await db.Users.getUserAmount();
            if (userAmount === -1) {
                return {success:false, message: 'Unable to connect to the database!'};
            }
            const user: User | undefined = await db.Users.create(email, username, passwordHash, userAmount === 0);

            if (!user) {
                return {success: false, message: 'Failed to register new user. If this problem persists, please contact an administrator'};
            }
        } catch (error) {
            Log.error(`Failed to register new user.`,error as Error);
            return {success: false, message: 'Internal Error. If this problem persists, please contact an administrator'};
        }
        return {success:true, message: 'Successfully registered!'};
    });