import type {Actions} from "../../../../.svelte-kit/types/src/routes/login/$types";
import * as db from '$lib/server/db/database';

export const ssr = false;

export const actions = {
    createItem: async (event) => {
        const formData = await event.request.formData();
        const inventory_uuid = formData.get('inventory_uuid')?.toString() ?? '';
        const name = formData.get('name')?.toString() ?? '';
        const description = formData.get('description')?.toString();
        const amount = Number.parseInt(formData.get('amount')?.toString() ?? '0');
        const price = Number.parseInt(formData.get('price')?.toString() ?? '0');
        const currency = formData.get('currency')?.toString();
        const external = formData.get('external')?.toString();

        const result = await db.Items.create(inventory_uuid,name,description,amount,[],undefined,external,price,currency);
        if (result && result.failed) {
            return {success: false, failed: true, error: result.error.toString()}
        }

        return {success: true ,failed: false ,error: ''}
    }
} satisfies Actions;