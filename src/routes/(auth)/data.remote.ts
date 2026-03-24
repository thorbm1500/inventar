import {LOGGER} from '../../hooks.server';
import * as v from 'valibot';
import * as auth from '$lib/server/internal/auth';
import {form} from '$app/server';
import type {Session, User} from '$lib/server/db/interfaces';
import {sendPasswordResetLink} from '$lib/server/internal/mail';
import {error, redirect} from '@sveltejs/kit';
import {getOTPToken, validateResetRequestToken} from "$lib/server/internal/auth";
import {Auth, Users} from "$lib/server/db/database";

export const requestReset = form(v.object({email: v.pipe(v.string(), v.nonEmpty())}),
    async ({email}) => {

        if (!auth.validateEmail(email)) {
            return {success: false, message: 'Invalid email (min 3, max 31 characters, alphanumeric only)'}
        }

        const user: User | undefined = await Users.getFromEmail(email);

        if (!user) {
            return {success: true, message: 'A reset link has been sent, if an account with that email exists.'};
        }

        const resetRequest: number = await Auth.getResetRequestExpiration(user.uuid);

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
        const uuid: string | null = await Users.getUuidFromUsername(_username);
        if (uuid === null) return {success: false, message: 'Invalid request'};

        const resetRequest: number = await Auth.getResetRequestExpiration(uuid);
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
        await Users.setPasswordHash(uuid, passwordHash);

        return redirect(302, '/login')
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
            const userAmount: number = await Users.getUserAmount();
            if (userAmount === -1) {
                return {success: false, message: 'Unable to connect to the database!'};
            }
            const user: User | undefined = await Users.create(email, username, passwordHash, userAmount === 0);

            if (!user) {
                return {success: false, message: 'Failed to register new user. If this problem persists, please contact an administrator'};
            }
        } catch (error) {
            LOGGER.error(`Failed to register new user.`, error as Error);
            return {success: false, message: 'Internal Error. If this problem persists, please contact an administrator'};
        }
        return {success: true, message: 'Successfully registered!'};
    });

export const login = form(
    v.object({
        email: v.pipe(v.string(), v.nonEmpty()),
        _password: v.pipe(v.string(), v.nonEmpty())
    }),
    async ({email, _password}) => {
        if (!auth.validateEmail(email)) {
            LOGGER.error(`Login failed: Invalid email (min 3, max 31 characters, alphanumeric only)`);
            return {otp: false, message: 'Invalid email (min 3, max 31 characters, alphanumeric only)'};
        }
        if (!auth.validatePassword(_password)) {
            LOGGER.error(`Login failed: Invalid password (min 32, max 255 characters)`);
            return {otp: false, message: 'Invalid password (min 32, max 255 characters)'};
        }

        const uuid: string | null = await Users.getUuidFromEmail(email);
        if (uuid === null) {
            return {otp: false, message: 'Incorrect username or password'};
        }

        const passwordHash: string = await Users.getPasswordHash(uuid);
        if (passwordHash === '') {
            return {otp: false, message: 'Incorrect username or password'};
        }

        const validPassword: boolean = await Bun.password.verify(_password, passwordHash);
        if (!validPassword) {
            LOGGER.warn(`Failed login attempt for '${email}'`);
            return {otp: false, message: 'Incorrect username or password'};
        }

        //const {secret} = generateOTPToken();
        //LOGGER.info(`New token: `, secret)
        //await updateOTPToken(uuid,{raw: secret}, _password);

        const otpToken: string | undefined = await Users.getOTPToken(uuid);
        if (otpToken) return {otp: true, uuid};

        const session: Session | undefined = await auth.createSession(uuid);
        if (!session) return error(500, `Failed to create new session for user '${uuid}'`);

        return redirect(302, '/');
    });

export const validateOTP = form(
    v.object({
        uuid: v.pipe(v.string(), v.nonEmpty()),
        totp: v.pipe(v.string(), v.nonEmpty()),
        _password: v.pipe(v.string(), v.nonEmpty())
    }),
    async ({uuid, totp, _password}) => {
        const secret: string | null = await getOTPToken(uuid, _password);
        if (secret === null) return {success: false, message: 'Internal Error'};

        if (auth.validateOTP(totp, secret)) {
            const session: Session | undefined = await auth.createSession(uuid);
            if (!session) {
                return {success: false, message: 'Internal Error'};
            } else return redirect(302, '/');
        } else {
            return {success: false, message: 'Incorrect 2FA Code. Try Again'};
        }
    });