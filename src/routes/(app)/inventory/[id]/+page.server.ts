import * as db from '$lib/server/db/database';
import { promises as fs } from "fs";
import type {DatabaseResult} from "$lib/server/db/database";


export const ssr = false;

export const actions = {
    createItem: async (event): Promise<{success:boolean,failed:boolean,error:string|Error}> => {
        const formData: FormData = await event.request.formData();
        const inventory_uuid = formData.get('inventory_uuid')?.toString() ?? '';
        const name = formData.get('name')?.toString() ?? '';
        const description = formData.get('description')?.toString();
        const amount = Number.parseInt(formData.get('amount')?.toString() ?? '0');
        const price = Number.parseInt(formData.get('price')?.toString() ?? '0');
        const currency = formData.get('currency')?.toString();
        const external = formData.get('external')?.toString();
        const image: File = formData.get('image')?.valueOf() as File ?? undefined;

        const result: DatabaseResult = await db.Items.create(inventory_uuid,name,description,amount,[],image.name ?? undefined,external,price,currency);

        if (!result.success) {
            return {success: false, failed: true, error: result.message ?? 'NONE'}
        }

        const UPLOAD_PATH = String('');

        if (!UPLOAD_PATH) {
            throw new Error('No/ or invalid upload path in environment!')
        }

        if (image) {
            try {
                const bytes = await image.bytes();
                await fs.writeFile(`${UPLOAD_PATH.toString().endsWith("/") ? UPLOAD_PATH.toString().concat('item-images/') : UPLOAD_PATH.toString().concat('/item-images/')}${image.name}`, bytes);
            } catch (error) {
                console.error(`Failed to write image: ${error}`);
                return {success: false, failed: true, error: `Item has been created, but image upload failed: ${error}`}
            }
        }

        return {success: true ,failed: false ,error: ''}
    }
} satisfies Actions;