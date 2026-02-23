import type {PageServerLoad} from './$types';
import {validate} from "uuid";
import {error, redirect} from "@sveltejs/kit";

export const load: PageServerLoad = async ({params,locals}): Promise<void> => {
    if (!params.id) {
        error(404, 'Account ID is required.');
    }
    if (!validate(params.id)) {
        error(400, 'The provided Account ID is invalid.');
    }
    if (params.id !== locals.uuid) {
        redirect(302,`/account/${locals.uuid}/settings`)
    }
};