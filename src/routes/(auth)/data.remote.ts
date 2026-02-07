import * as v from 'valibot';
import * as auth from "$lib/server/auth";
import * as db from "$lib/server/db/database";
import {form} from '$app/server';
import type {ResetRequest, Session, User} from "$lib/server/db/schema";
import {sendPasswordResetLink} from "$lib/server/mail";
import {sha256} from "@oslojs/crypto/sha2";
import {encodeHexLowerCase} from "@oslojs/encoding";
import {hash, verify} from "@node-rs/argon2";
import {redirect} from "@sveltejs/kit";

export const requestReset = form(
    v.object({email: v.pipe(v.string(), v.nonEmpty())}),
    async ({email}) => {

        if (!auth.validateEmail(email)) {
            return {success: false, message: 'Invalid email (min 3, max 31 characters, alphanumeric only)'}
        }

        const user: User | undefined = await db.Users.getFromEmail(email);

        if (user) {
            const existingToken: ResetRequest | undefined = await db.Auth.getResetTokenFromUuid(user.uuid);

            if (existingToken && existingToken.expires > new Date(Date.now()).getTime()) {
                return {success: true, message: 'A reset link has been sent, if an account with that email exists.'};
            }

            const resetToken: string = auth.generateResetToken();
            const requestResult: boolean = await auth.createResetRequest(resetToken, user.uuid);

            if (requestResult) {
                await sendPasswordResetLink(user.email, resetToken);
            } else {
                console.error(`Failed to send reset link to user ${user.email}.`)
            }
        }

        return {success: true, message: 'A reset link has been sent, if an account with that email exists.'}
    });

export const resetPassword = form(
    v.object({
        _token: v.pipe(v.string(), v.nonEmpty()),
        _password: v.pipe(v.string(), v.nonEmpty())
    }),
    async ({_token, _password}) => {
        const resetToken: string = encodeHexLowerCase(sha256(new TextEncoder().encode(_token)));
        const resetRequest: ResetRequest | undefined = await db.Auth.getResetToken(resetToken);

        if (resetRequest && resetRequest.expires > new Date(Date.now()).getTime()) {
            if (!auth.validatePassword(_password)) {
                return {success: false, message: 'Failed to reset password. New password does not fit requirements.'}
            }

            if (resetRequest.uuid) {
                const passwordHash: string = await hash(_password, {
                    memoryCost: 19456,
                    timeCost: 5,
                    outputLen: 32,
                    parallelism: 1,
                });

                const passwordUpdate: boolean = await db.Users.setPasswordHash(resetRequest.uuid, passwordHash);
                await db.Auth.deleteResetToken(_token);

                if (!passwordUpdate) {
                    console.error(`Failed to reset password for user '${resetRequest.uuid}'.`);
                    return {success: false, message: 'Failed to update password. If this problem persists, please reach out to the server administrator.'};
                } else {
                    return redirect(302, '/login')
                }
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
            console.error(`Login failed: No user exists with the email '${email}'.`);
            return {success: false, message: 'Incorrect username or password'};
        }

        const passwordHash: String | undefined = await db.Users.getPasswordHash(user.uuid);

        if (!passwordHash) {
            console.error(`Login failed: No password found in the database for user with email '${email}'.`);
            return {success: false, message: 'Incorrect username or password'};
        }

        const validPassword = await verify(passwordHash.valueOf(), _password, {
            memoryCost: 19456,
            timeCost: 5,
            outputLen: 32,
            parallelism: 1,
        });

        if (!validPassword) {
            console.error(`Login failed: Password invalid.`);
            return {success: false, message: 'Incorrect username or password'};
        }

        const sessionToken: string = auth.generateSessionToken();
        const session: Session = await auth.createSession(sessionToken, user.uuid);
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
            return {success: false, message: 'Passwords do not match!'};
        }

        if (!auth.validateUsername(username)) {
            return {success: false, message: 'Invalid username!'};
        }

        if (!auth.validateEmail(email)) {
            return {success: false, message: 'Invalid email!'};
        }

        if (!auth.validatePassword(_password)) {
            return {success: false, message: 'Invalid password!'};
        }

        const passwordHash: string = await hash(_password, {
            // recommended minimum parameters
            memoryCost: 19456,
            timeCost: 5,
            outputLen: 32,
            parallelism: 1,
        });

        try {
            const user: User | undefined = await db.Users.create(email, username, passwordHash);

            if (!user) {
                return {success: false, message: 'An error has occurred'};
            }

            const sessionToken: string = auth.generateSessionToken();
            const session: Session = await auth.createSession(sessionToken, user.uuid);
            auth.setSessionTokenCookie(sessionToken, session.expires);
        } catch {
            return {success: false, message: 'An error has occurred'};
        }
        return redirect(302, '/');
    });