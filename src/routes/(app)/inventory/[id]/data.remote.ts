import {error, redirect} from '@sveltejs/kit';
import {form, query} from '$app/server';
import * as db from '$lib/server/db/database'
import * as v from 'valibot';
import util from "$lib/server/utilities";
import type {Currency, Inventory, Item} from "$lib/server/db/schema";
import type {DatabaseResult} from "$lib/server/db/database";
import {promises as fs} from "fs";
import {getInventoryDirectory} from "$lib/server/internal/settings";

export const getInventory = query(v.string(), async (id: string): Promise<Inventory> => {
    const result: DatabaseResult = await db.Inventories.fetchInventoryByUuid(id);
    if (!result.success) error(500, "Failed to fetch inventory.");

    return result.result as Inventory;
});

const itemsObj = v.object({
    inventory: v.string(),
    amount: v.number(),
    order_by: v.string(),
    order: v.string(),
    offset: v.number()
});

export const getCurrencies = query(async (): Promise<Currency[]> => {
    const result: DatabaseResult = await db.getCurrencies();
    if (!result.success) error(500, `Failed to fetch currencies: ${result.message}`);

    const currencies = result.result as Currency[];
    return currencies;
});

export const getItems = query(itemsObj, async (data): Promise<Item[]> => {
    let items: Item[] = [];
    if (!util.isOffline()) {
        const result: DatabaseResult = await db.Items.fetch(data.inventory,data.amount,data.order_by,data.order == '' ? 'ASC' : data.order,data.offset);
        if (result.success) items = result.result as Item[];
    }
    return items;
});

export const getTotalItemCount = query(v.string(), async (id: string): Promise<number> => {
    if (!util.isOffline()) {
        const result: DatabaseResult = await db.Items.fetchTotalItemCount(id);

        if (result.success) {
            return result.result;
        }
    }

    return 1;
});

export const deleteItem = query(v.string(), async (id: string): Promise<boolean> => {
    if (!util.isOffline()) {
        const result: DatabaseResult = await db.Items.deleteItem(id);
        return result.result;
    }

    return false;
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
        const result: DatabaseResult = await db.Items.create(inventoryUuid, name, description, amount, [], (image as File)?.name ?? undefined, external, price, currency);

        if (!result.success) {
            return {success: false, failed: true, error: result.message ?? 'NONE'}
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
                console.error(`Failed to write image: ${error}`);
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