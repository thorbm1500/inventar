import {getRequestEvent} from "$app/server";
import type {Cookies, RequestEvent} from "@sveltejs/kit";
import type {ResetRequest, Session} from "$lib/server/db/interfaces";
import {DAY_IN_MS} from "$lib/util/utilities";
import {EMAIL_REGEX} from "valibot";
import utilities from "$lib/server/internal/utilities";
import {Auth, Users} from "$lib/server/db/database";
import inventar from "$lib/server/internal/inventar";
import {LOGGER} from "../../../hooks.server";
import {Secret, TOTP} from "otpauth";
import {type Cipheriv, createCipheriv, createDecipheriv, type Decipheriv, randomBytes} from "node:crypto";

declare interface CryptoOptions {
    encoding?: Bun.DigestEncoding,
    key?: string,
    seed?: Bun.BlobOrStringOrBuffer
}

/**
 * todo
 * @param options
 */
export function getSha512(options?: CryptoOptions): string {
    const sha: Bun.SHA512 = options !== undefined && options.key ? new Bun.CryptoHasher('sha512', options.key) : new Bun.SHA512();

    if (options?.seed) {
        sha.update(options.seed);
    }

    return sha.digest(options?.encoding ?? 'hex');
}

/**
 * todo
 * @param uuid
 */
export async function createResetRequest(uuid: string): Promise<string> {
    const token: string = getSha512();
    await Auth.setResetToken(uuid, getSha512({key: token, seed: uuid}));
    return token;
}

/**
 * todo
 * @param uuid
 * @param session_id
 */
export async function validateResetRequestToken(uuid: string, session_id: string): Promise<string | null> {
    const resetRequest: ResetRequest | undefined = await Auth.getResetRequest(uuid);
    if (!resetRequest) return null;

    const token: string = getSha512({key: session_id, seed: uuid});
    await Auth.deleteResetToken(uuid);

    return token === resetRequest.token ? token : null;
}

/**
 * Creates a temporary 7-day session, for the specified user.
 * @param uuid The user's uuid.
 */
export async function createSession(uuid: string): Promise<Session | undefined> {
    const session_id: string = getSha512();
    const token: string = getSha512({encoding: 'base64url', key: session_id, seed: inventar.Cookies.Session});

    await Auth.newSession(uuid, token);
    const session: Session | undefined = await Auth.getSession(token);
    if (session) {
        session.session_id = session_id;
        setSessionCookie(session);
    }

    return session;
}

/**
 * todo
 * @param session_id
 * @param event
 */
export async function validateSessionToken(session_id: string, event: RequestEvent): Promise<Session | null> {
    const token: string = getSha512({encoding: 'base64url', key: session_id, seed: inventar.Cookies.Session});
    const session: Session | undefined = await Auth.getSession(token);

    if (!session) {
        LOGGER.debug(`Deleting invalid session.`)
        deleteSessionTokenCookie();
        return null;
    }

    const isSessionExpired: boolean = Date.now() >= Date.parse(String(session.expires));
    if (isSessionExpired) {
        await Auth.invalidateSession(token);
        return null;
    }

    const renewSession: boolean = Date.now() >= (Date.parse(String(session.expires)) - DAY_IN_MS * 3);
    if (renewSession) {
        await Auth.renewSession(token);
    }

    await Auth.updateLastAccess(token);
    await utilities.handleSessionInformation(token, event);

    return session;
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

/**
 * todo
 * @param session
 * @param event
 */
export function setSessionCookie(session: Session, event?: RequestEvent): void {
    const eventCookies: Cookies = event?.cookies ?? getRequestEvent().cookies;
    eventCookies.set(inventar.Cookies.Session, session.session_id, {
        expires: new Date(session.expires),
        path: '/',
        secure: false
    });
}

/**
 * todo
 * @param event
 */
export function deleteSessionTokenCookie(event: RequestEvent | undefined = undefined): void {
    const eventCookies: Cookies = event ? event.cookies : getRequestEvent().cookies;
    eventCookies.delete(inventar.Cookies.Session, {
        path: '/',
        secure: false
    });
}

export function generateOTPToken(): { uri: string, secret: string } {
    const secret: string = new Secret().base32;
    return {
        uri: new TOTP({
            issuer: 'inventar',
            label: '2fa',
            secret
        }).toString(),
        secret
    };
}

export async function updateOTPToken(uuid: string, token: { raw?: string, encrypted?: string }, secret?: string): Promise<void> {
    if (!token.raw && !token.encrypted) {
        LOGGER.error(`Failed to update OTP token for user '${uuid}'. Both the raw and encrypted version of the token is null.`);
        return;
    }

    let newToken: string = token.encrypted ? token.encrypted : '';

    if (newToken === '' && token.raw) {
        if (!secret) {
            LOGGER.error(`Failed to update OTP token for user '${uuid}'. A raw token has been provided, but without a secret to encrypt it with.`);
            return;
        }
        newToken = encrypt(secret, token.raw);
    }

    await Users.setOTPToken(uuid, newToken);
}

export async function getOTPToken(uuid: string, secret: string): Promise<string | null> {
    const encryptedToken: string | undefined = await Users.getOTPToken(uuid);
    if (!encryptedToken) {
        LOGGER.error(`No OTP token found.`);
        return null;
    }

    return decrypt(secret, encryptedToken);
}

export function validateOTP(token: string, secret: string): boolean {
    const result: number | null = new TOTP({
        issuer: 'inventar',
        label: '2fa',
        secret
    }).validate({token});

    return result !== null && result > -1;
}

/**
 * todo
 * @param secret
 * @param data
 */
export function encrypt(secret: string, data: string): string {
    const iv = randomBytes(16);
    const key: Buffer = new Bun.CryptoHasher('sha512-256', secret).digest();

    const cipher: Cipheriv = createCipheriv('aes256', key, iv);

    let encrypted: string = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + encrypted;
}

/**
 * todo
 * @param secret
 * @param data
 */
export function decrypt(secret: string, data: string): string {
    const iv: string = data.slice(0, 32);
    const key: Buffer = new Bun.CryptoHasher('sha512-256', secret).digest();

    const encrypted: string = data.slice(32);
    const decipher: Decipheriv = createDecipheriv('aes256', key, Buffer.from(iv, 'hex'));

    let decrypted: string = decipher.update(encrypted, 'hex', 'utf8');
    return decrypted + decipher.final('utf8');
}

/**
 * todo
 * @param username
 */
export function validateUsername(username: unknown): username is string {
    return (
        typeof username === 'string' && // Ensure username is of type string
        (username.length >= 3 && username.length <= 32) && // Ensure username length
        /^[a-zA-Z0-9_-]{3,32}$/.test(username) && // Ensure only allowed characters are present
        /[0-9_-]*[a-zA-Z][0-9_-]*[a-zA-Z][0-9_-]*[a-zA-Z]/.test(username) // Ensure username contains at least 3 letters
    );
}

/**
 * todo
 * @param email
 */
export function validateEmail(email: unknown): email is string {
    return typeof email === 'string' && email.length <= 254 && EMAIL_REGEX.test(email);
}

/**
 * todo
 * @param password
 */
export function validatePassword(password: unknown): password is string {
    return typeof password === 'string' && // Ensure password is of type string
        (password.length >= 32 && password.length <= 255) && // Ensure password length
        /(?=[A-Z][^A-Z]*[A-Z][^A-Z]*[A-Z][^A-Z]*[A-Z][^A-Z]*)/.test(password) && // Ensure at least 4 uppercase letters are present
        /(?=[a-z][^a-z]*[a-z][^a-z]*[a-z][^a-z]*[a-z][^a-z]*)/.test(password) && // Ensure at least 4 lowercase letters are present
        /(?=\W\w*\W\w*\W\w*\W)/.test(password) && // Ensure at least 4 symbols are present
        /(?=\d\D*\d\D*\d\D*\d\D*)/.test(password); // Ensure at least 4 numbers are present
}

/**
 * todo
 */
export function generateRegistrationToken(): string {
    return getSha512();
}