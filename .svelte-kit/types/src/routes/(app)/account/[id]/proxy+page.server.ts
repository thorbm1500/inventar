// @ts-nocheck
import type {PageServerLoad} from './$types';
import type {User} from "$lib/server/db/interfaces";
import {validate} from "uuid";
import {error} from "@sveltejs/kit";
import * as db from "$lib/server/db/database";

export const load = async ({params}: Parameters<PageServerLoad>[0]): Promise<{ user: User }> => {
    if (!params.id || !validate(params.id)) {
        error(404, 'Account ID is required!');
    }

    const user: User | undefined = await db.Users.getFromUuid(params.id);

    if (!user) {
        error(404, 'User not found!');
    }

    return {
        user
    };
};