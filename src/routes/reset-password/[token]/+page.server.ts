import type {Actions} from "../../../../.svelte-kit/types/src/routes/reset-password/[token]/$types";
import type {ResetRequest} from "$lib/server/db/schema";
import * as auth from "$lib/server/auth";
import * as db from "$lib/server/db/database";
import {encodeHexLowerCase} from "@oslojs/encoding";
import {sha256} from "@oslojs/crypto/sha2";
import {hash} from "@node-rs/argon2";
import {redirect} from "@sveltejs/kit";

export const actions: Actions = {
    reset: async (event) => {
        const formData: FormData = await event.request.formData();
        const token: string | null = formData.get('token') as string | null;
        const password: string | null = formData.get('password') as string | null;

        if (!token) {
            return {success: false, message: 'Failed to reset password. No reset token was found?'}
        }
        if (!password) {
            return {success: false, message: 'Failed to reset password. No new password was provided?'}
        }

        const resetToken: string = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
        const resetRequest: ResetRequest | undefined  = await db.Auth.getResetToken(resetToken);

        if (resetRequest && resetRequest.expires > new Date(Date.now()).getTime()) {
            if (!auth.validatePassword(password)) {
                return {success: false, message: 'Failed to reset password. New password does not fit requirements.'}
            }

            if (resetRequest.uuid) {
                const passwordHash: string = await hash(password, {
                    memoryCost: 19456,
                    timeCost: 5,
                    outputLen: 32,
                    parallelism: 1,
                });

                const passwordUpdate: boolean = await db.Users.setPasswordHash(resetRequest.uuid, passwordHash);
                await db.Auth.deleteResetToken(token);

                if (!passwordUpdate) {
                    console.error(`Failed to reset password for user '${resetRequest.uuid}'.`);
                    return {success: false, message: 'Failed to update password. If this problem persists, please reach out to the server administrator.'};
                } else {
                    return redirect(302, '/login')
                }
            }
        }

        return {success: false, message: 'This password reset link has expired.'}
    }
}