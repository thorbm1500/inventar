import type {Actions} from "../../../.svelte-kit/types/src/routes/reset-password/$types";
import {sendPasswordResetLink} from "$lib/server/mail";
import type {ResetRequest, User} from "$lib/server/db/schema";
import * as db from "$lib/server/db/database";
import * as auth from "$lib/server/auth";

export const actions: Actions = {
    request: async (event) => {
        const formData: FormData = await event.request.formData();
        const email: string | null = formData.get('email') as string | null;

        if (!email) {
            return {success: false, message: 'Password reset request requires an email!'}
        }

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
    }
}