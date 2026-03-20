import {getRequestEvent} from "$app/server";
import type {Cookies, RequestEvent} from "@sveltejs/kit";
import type {ResetRequest, Session} from "$lib/server/db/interfaces";
import {DAY_IN_MS} from "$lib/util/utilities";
import {EMAIL_REGEX} from "valibot";
import utilities from "$lib/server/internal/utilities";
import {Auth} from "$lib/server/db/database";
import inventar from "$lib/server/internal/inventar";
import {LOGGER} from "../../../hooks.server.ts";

declare interface CryptoOptions {
    encoding?: Bun.DigestEncoding,
    key?: string,
    seed?: Bun.BlobOrStringOrBuffer
}

/**
 * todo
 * @param options
 */
function getSha512(options?: CryptoOptions): string {
    const sha: Bun.SHA512 = options?.key ? new Bun.CryptoHasher('sha512', options.key) : new Bun.SHA512();

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
    if (session) session.session_id = session_id;

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