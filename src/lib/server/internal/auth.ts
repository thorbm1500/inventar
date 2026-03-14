import {getRequestEvent} from '$app/server';
import type {Cookies, RequestEvent} from '@sveltejs/kit';
import {sha256} from '@oslojs/crypto/sha2';
import {encodeBase64url, encodeHexLowerCase} from '@oslojs/encoding';
import type {Session} from "$lib/server/db/interfaces";
import {DAY_IN_MS} from '$lib/util/utilities';
import {EMAIL_REGEX} from "valibot";
import utilities from "$lib/server/internal/utilities";
import {Auth} from "$lib/server/db/database";

export const sessionCookieName = 'auth-session';

/**
 * todo
 */
export function generateSessionToken(): string {
    const bytes: Uint8Array<ArrayBuffer> = crypto.getRandomValues(new Uint8Array(18));
    return encodeBase64url(bytes);
}

/**
 * todo
 */
export function generateResetToken(): string {
    const bytes: Uint8Array<ArrayBuffer> = crypto.getRandomValues(new Uint8Array(18));
    return encodeBase64url(bytes).toLowerCase();
}

/**
 * todo
 * @param token
 * @param uuid
 */
export async function createResetRequest(token: string, uuid: string): Promise<void> {
    const resetToken: string = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    await Auth.setResetToken(uuid, resetToken);
}

/**
 * Creates a temporary 7-day session, for the specified user.
 * @param token Token for the session id.
 * @param uuid The user's uuid.
 */
export async function createSession(token: string, uuid: string): Promise<Session> {
    const session_id: string = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

    const session: Session = {
        uuid,
        session_id,
        expires: 0
    };
    await Auth.newSession(session);

    return session;
}

/**
 * todo
 * @param session_id
 * @param event
 */
async function ensureSessionInformation(session_id: string, event: RequestEvent): Promise<void> {
    await utilities.handleSessionInformation(session_id, event);
}

/**
 * todo
 * @param token
 * @param event
 */
export async function validateSessionToken(token: string, event: RequestEvent): Promise<Session | null> {
    const session_id: string = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const session: Session | undefined = await Auth.getSession(session_id);

    if (!session) {
        deleteSessionTokenCookie();
        return null;
    }

    const isSessionExpired: boolean = Date.now() >= session.expires;
    if (isSessionExpired) {
        await Auth.invalidateSession(session_id);
        return null;
    }

    const renewSession: boolean = Date.now() >= (session.expires - DAY_IN_MS * 3);
    if (renewSession) {
        await Auth.renewSession(session);
    }

    await Auth.updateLastAccess(session_id);
    await ensureSessionInformation(session_id, event);

    return session;
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

/**
 * todo
 * @param token
 * @param expires
 * @param event
 */
export function setSessionTokenCookie(token: string, expires: number, event: RequestEvent | undefined = undefined): void {
    const cookies: Cookies = event ? event.cookies : getRequestEvent().cookies;
    const expiration = new Date();
    expiration.setTime(expires);
    cookies.set(sessionCookieName, token, {
        expires: expiration,
        path: '/',
        secure: false
    });
}

/**
 * todo
 * @param event
 */
export function deleteSessionTokenCookie(event: RequestEvent | undefined = undefined): void {
    const cookies: Cookies = event ? event.cookies : getRequestEvent().cookies;
    cookies.delete(sessionCookieName, {
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
        (username.length >= 3 && username.length <= 31) && // Ensure username length
        /^[a-zA-Z0-9_-]+$/.test(username) && // Ensure only allowed characters are present
        /^[a-zA-Z][0-9_-]*[a-zA-Z][0-9_-]*[a-zA-Z]/.test(username) // Ensure username contains at least 3 letters
    );
}

/**
 * todo
 * @param email
 */
export function validateEmail(email: unknown): email is string {
    return typeof email === 'string' && email.length <= 64 && EMAIL_REGEX.test(email);
}

/**
 * todo
 * @param password
 */
export function validatePassword(password: unknown): password is string {
    return typeof password === 'string' && password.length >= 32 && password.length <= 255;
}

/**
 * todo
 */
export function generateRegistrationToken(): string {
    return encodeHexLowerCase(sha256(new TextEncoder().encode(encodeBase64url(crypto.getRandomValues(new Uint8Array(128))))));
}