import {error} from '@sveltejs/kit';
import {form, query} from '$app/server';
import * as db from '$lib/server/db/database'
import * as v from 'valibot';
import util from "$lib/server/utilities";
import type {Currency, Inventory, Item} from "$lib/server/db/schema";
import {promises as fs} from "fs";
import Log from "$lib/server/internal/log";
import id = $props.id;

export const getInventory = query(v.string(), async (id: string): Promise<Inventory> => {
    const inventory: Inventory | undefined = await db.Inventories.fetchInventoryByUuid(id);
    if (!inventory) {
        Log.error(`Failed to fetch inventory with ID: ${id}`);
        error(500, "Failed to fetch inventory.");
    }

    return inventory;
});

const itemsObj = v.object({
    inventory: v.string(),
    amount: v.number(),
    order_by: v.string(),
    order: v.string(),
    offset: v.number()
});

export const getCurrencies = query(async (): Promise<Currency[]> => {
    const currencies: Currency[] = await db.getCurrencies();
    if (!currencies) {
        Log.error('Failed to fetch currencies.');
        error(500, `Failed to fetch currencies.`);
    }

    return currencies;
});

export const getItems = query(itemsObj, async (data): Promise<Item[]> => {
    if (!util.isOffline()) {
        const items: Item[] = await db.Items.fetch(data.amount,data.order_by,data.order == '' ? 'ASC' : data.order,data.offset);
        return items;
    }
    return [];
});

export const getTotalItemCount = query(v.string(), async (id: string): Promise<number> => {
    if (!util.isOffline()) {
        const itemCount: number = await db.Items.fetchTotalItemCount(id);
        return itemCount;
    }

    return 1;
});

export const deleteItem = query(v.string(), async (id: string): Promise<void> => {
    if (!util.isOffline()) await db.Items.deleteItem(id);
});

export const createItem = form(
    v.object({
        inventoryUuid: v.pipe(v.string(), v.nonEmpty()),
        name: v.pipe(v.string(), v.nonEmpty()),
        description: v.optional(v.string(), undefined),
        amount: v.number(),
        price: v.number(),
        currency: v.optional(v.string(), undefined),
        external: v.optional(v.string(), undefined),
        image: v.optional(v.file(), undefined)
    }),
    async ({inventoryUuid, name, description, amount, price, currency, external, image}) => {
        const item: Item | undefined = await db.Items.create(inventoryUuid, name, description, amount, [], (image as File)?.name ?? undefined, external, price, currency);

        if (!item) {
            Log.error(`Failed to create item with name: ${name}, for Inventory: ${inventoryUuid}`);
            return {success: false, failed: true, error: 'Failed to create item!'}
        }

        const UPLOAD_PATH = String('');

        if (!UPLOAD_PATH) {
            throw new Error('No/ or invalid upload path in environment!')
        }

        if (image) {
            try {
                const bytes = await (image as File).bytes();
                await fs.writeFile(`${UPLOAD_PATH.toString().endsWith("/") ? UPLOAD_PATH.toString().concat('item-images/') : UPLOAD_PATH.toString().concat('/item-images/')}${image.name}`, bytes);
            } catch (error) {
                Log.error(`Failed to write image: ${error}`);
                return {success: false, failed: true, error: `Item has been created, but image upload failed: ${error}`}
            }
        }

        return {success: true, failed: false, error: ''}
    });

export const updateInventoryGeneral = form(
    v.object({
        name: v.optional(v.string(), undefined),
        description: v.optional(v.string(), undefined)
    }),
    ({name, description}) => {

        return {success:true};
    }
);