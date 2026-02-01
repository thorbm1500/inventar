import type {RequestEvent} from '@sveltejs/kit';
import {sha256} from '@oslojs/crypto/sha2';
import {encodeBase64url, encodeHexLowerCase} from '@oslojs/encoding';
import * as db from "$lib/server/db/database";
import type {Session} from "$lib/server/db/schema";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    return encodeBase64url(bytes);
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
        expires: new Date(Date.now() + DAY_IN_MS * 7).getTime()
    };
    await db.Sessions.new(session);
    return session;
}

export async function validateSessionToken(token: string) {
    const session_id: string = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const result: any = await db.Sessions.get(session_id);

    if (!result) {
        return {uuid: null, session_id: null, expires: null};
    }

    const sessionExpired = Date.now() >= result.expires;
    if (sessionExpired) {
        await db.Sessions.invalidate(session_id);
        return {uuid: null, session_id: null, expires: null};
    }

    const renewSession = Date.now() >= result.expires - DAY_IN_MS * 3;
    if (renewSession) {
        result.expires = new Date(Date.now() + DAY_IN_MS * 7);
        await db.Sessions.renew(session_id, result.expires);
    }

    return {uuid: result.uuid, session_id: result.session_id, expires: result.expires};
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

/**
 * Invalidate the given session.
 * @param session_id Id of session to invalidate.
 */
export async function invalidateSession(session_id: string): Promise<void> {
    await db.Sessions.invalidate(session_id);
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expires: number): void {
    const expiration = new Date();
    expiration.setTime(expires);
    event.cookies.set(sessionCookieName, token, {
        expires: expiration,
        path: '/'
    });
}

export function deleteSessionTokenCookie(event: RequestEvent) {
    event.cookies.delete(sessionCookieName, {
        path: '/'
    });
}

export function validateUsername(username: unknown): username is string {
    return (
        typeof username === 'string' &&
        username.length >= 3 &&
        username.length <= 31 &&
        /^[a-z0-9_-]+$/.test(username)
    );
}

export function validateEmail(email: unknown): email is string {
    /* Regex Source: https://stackoverflow.com/a/201378 */
    return (
        typeof email === 'string' &&
        email.length <= 64 &&
        /(?:[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+(?:\.[a-z0-9!#$%&'*+\x2f=?^_`\x7b-\x7d~\x2d]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9\x2d]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9\x2d]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+))/.test(email)
    );
}

export function validatePassword(password: unknown): password is string {
    return (
        typeof password === 'string' &&
        password.length >= 32 &&
        password.length <= 255
    );
}