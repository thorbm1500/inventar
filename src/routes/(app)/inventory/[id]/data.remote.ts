import {LOGGER} from "../../../../hooks.server";
import {redirect} from "@sveltejs/kit";
import {command, form, query} from "$app/server";
import * as db from "$lib/server/db/database"
import * as v from "valibot";
import util from "$lib/server/internal/utilities";
import type {Inventory} from "$lib/server/db/interfaces";
import {type Item, Items} from "$lib/server/db/components/item";
import {promises as fs} from "node:fs";

export const getInventory = query(v.pipe(v.string(), v.nonEmpty(`The inventory's UUID must be provided when attempting the browse its contents!`)), async (id: string): Promise<Inventory> => {
    let inventory: Inventory | undefined;

    if (!util.isOffline()) {
        inventory = await db.Inventories.fetchInventoryByUuid(id);
        if (!inventory) {
            LOGGER.error(`Failed to fetch inventory with ID: ${id}`);
        }
    }

    if (!inventory) throw new Error('Failed to load inventory!');

    return inventory;
});

const itemsObj = v.object({
    inventory: v.string(),
    amount: v.number(),
    order: v.string(),
    order_by: v.optional(v.string(), undefined),
    offset: v.number()
});

export const getItems = query(itemsObj, async (data): Promise<Item[]> => {
    return util.isOffline() ? [] : (data.order === 'ASC' ? await Items.fetch(data.inventory, data.amount, data.offset, data.order_by) : await Items.fetchDesc(data.inventory, data.amount, data.offset, data.order_by));
});

export const getTotalItemCount = query(v.string(), async (id: string): Promise<number> => {
    if (util.isOffline()) {
        return 0;
    }

    return await Items.fetchTotalItemCount(id);
});

export const deleteItem = query(v.object({id: v.string(), user: v.string()}), async ({id, user}): Promise<void> => {
    if (!util.isOffline()) await Items.deleteItem(id, user);
});

export const quickAdd = form(v.object({
    user: v.pipe(v.string(), v.nonEmpty('Error: No UUID found. The UUID of the user must be given, when new items are created!')),
    inventoryUuid: v.pipe(v.string(), v.nonEmpty('Error: No UUID found. The UUID of the inventory must be given, when new items are created!')),
    name: v.pipe(v.string(), v.nonEmpty('Error: No name found. A name must be provided when creating new items.')),
    amount: v.number()
}), async ({user, inventoryUuid, name, amount}) => {
    const item: Item | undefined = await Items.create(user, inventoryUuid, name, amount);

    if (!item) {
        LOGGER.error(`Failed to create item with name: ${name}, for Inventory: ${inventoryUuid}`);
        return {success: false, failed: true, error: 'Failed to create item!'}
    }

    return redirect(302, '/inventory/' + inventoryUuid);
})

export const createItem = form(
    v.object({
        user: v.pipe(v.string(), v.nonEmpty('Error: No UUID found. The UUID of the user must be given, when new items are created!')),
        inventoryUuid: v.pipe(v.string(), v.nonEmpty('Error: No UUID found. The UUID of the inventory must be given, when new items are created!')),
        name: v.pipe(v.string(), v.nonEmpty('Error: No name found. A name must be provided when creating new items.')),
        description: v.optional(v.string(), undefined),
        amount: v.optional(v.number(), 0),
        price: v.optional(v.number(), 0),
        currency: v.optional(v.string(), 'DKK'),
        external: v.optional(v.string(), undefined),
        image: v.optional(v.file(), undefined)
    }),
    async ({user, inventoryUuid, name, description, amount, price, currency, external, image}) => {
        const item: Item | undefined = await Items.create(user, inventoryUuid, name, amount, {description, image: (image as File)?.name ?? undefined, url: external, price, currency});

        if (!item) {
            LOGGER.error(`Failed to create item with name: ${name}, for Inventory: ${inventoryUuid}`);
            return {success: false, failed: true, error: 'Failed to create item!'}
        }

        if (image) {
            const UPLOAD_PATH = String('');

            if (!UPLOAD_PATH) {
                throw new Error('No/ or invalid upload path in environment!')
            }

            try {
                const bytes = await (image as File).bytes();
                await fs.writeFile(`${UPLOAD_PATH.toString().endsWith("/") ? UPLOAD_PATH.toString().concat('item-images/') : UPLOAD_PATH.toString().concat('/item-images/')}${image.name}`, bytes);
            } catch (error) {
                LOGGER.error(`Failed to write image: ${error}`);
                return {success: false, failed: true, error: `Item has been created, but image upload failed: ${error}`}
            }
        }

        return redirect(302, '/inventory/' + inventoryUuid);
    });

export const updatePrimaryInventory = command(
    v.object({
        user: v.pipe(v.string(), v.nonEmpty()),
        inventory_uuid: v.optional(v.string(), undefined)
    }),
    async ({user, inventory_uuid}) => {
        await db.Users.updatePrimaryInventory(user, inventory_uuid ?? null);
    });