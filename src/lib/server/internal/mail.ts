import nodemailer, {type SentMessageInfo} from "nodemailer";
import {env} from '$env/dynamic/private'

const transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: Number.parseInt(env.MAIL_PORT),
    secure: true,
    auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASSWORD,
    },
});

/**
 * todo
 * @param email
 * @param token
 */
export async function sendPasswordResetLink(email: string, token: string): Promise<void> {
    const url: string = String(env.PUBLIC_URL ? env.PUBLIC_URL : 'http://localhost:5731/reset-password/');
    const PUBLIC_URL: string = url.endsWith('/') ? url.concat('reset-password/') : url.concat('reset-password/');
    const info: SentMessageInfo = await transporter.sendMail({
        from: '"inventar" inventar@updates.prodzeus.dev',
        to: email,
        subject: "Reset Password",
        text: `Reset your password: ${PUBLIC_URL}${token}`,
        html: `<a href="${PUBLIC_URL}${token}" rel="external" target="_self"><b>Reset your password</b></a>`
    });

    console.log("Message sent:", info.messageId);
}