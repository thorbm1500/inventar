import {getRequestEvent} from '$app/server';
import type {Cookies, RequestEvent} from '@sveltejs/kit';
import {sha256} from '@oslojs/crypto/sha2';
import {encodeBase64url, encodeHexLowerCase} from '@oslojs/encoding';
import * as db from "$lib/server/db/database";
import type {Session} from "$lib/server/db/schema";
import {DAY_IN_MS} from '$lib/utilities';
import {EMAIL_REGEX} from "valibot";

export const sessionCookieName = 'auth-session';

export function generateSessionToken(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    return encodeBase64url(bytes);
}

export function generateResetToken(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    return encodeBase64url(bytes).toLowerCase();
}

export async function createResetRequest(token: string, uuid: string): Promise<void> {
    const resetToken: string = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    await db.Auth.setResetToken(uuid, resetToken, Date.now() + 1800000);
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
    await db.Auth.newSession(session);

    return session;
}

export async function validateSessionToken(token: string): Promise<Session | null> {
    const session_id: string = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const session: Session | undefined = await db.Auth.getSession(session_id);

    if (!session) {
        deleteSessionTokenCookie();
        return null;
    }

    const isSessionExpired: boolean = Date.now() >= session.expires;
    if (isSessionExpired) {
        await db.Auth.invalidateSession(session_id);
        return null;
    }

    const renewSession: boolean = Date.now() >= (session.expires - DAY_IN_MS * 3);
    if (renewSession) {
        session.expires = new Date(Date.now() + DAY_IN_MS * 7).getTime();
        await db.Auth.renewSession(session_id, session.expires);
    }

    return session;
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export function setSessionTokenCookie(token: string, expires: number, event: RequestEvent | undefined = undefined): void {
    const cookies: Cookies = event ? event.cookies : getRequestEvent().cookies;
    const expiration = new Date();
    expiration.setTime(expires);
    cookies.set(sessionCookieName, token, {
        expires: expiration,
        path: '/'
    });
}

export function deleteSessionTokenCookie(event: RequestEvent | undefined = undefined): void {
    const cookies: Cookies = event ? event.cookies : getRequestEvent().cookies;
    cookies.delete(sessionCookieName, {
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
    return typeof email === 'string' && email.length <= 64 && EMAIL_REGEX.test(email);
}

export function validatePassword(password: unknown): password is string {
    return typeof password === 'string' && password.length >= 32 && password.length <= 255;
}