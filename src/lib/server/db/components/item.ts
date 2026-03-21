import {Database} from "$lib/server/db/database";
import {LOGGER} from "../../../../hooks.server";
import {Audit} from "$lib/server/db/components/audit";
import {Redis, type RedisKey} from "$lib/server/db/redis";
import {type Label, Labels} from "$lib/server/db/components/labels";
import type {UnitType} from "$lib/server/db/components/units";
import currencies from "$lib/server/db/components/currencies";

export interface Item {
    inventory: string,
    uuid: string,
    name: string,
    description?: string,
    amount: number,
    reserved_amount: number,
    reserved_expiration: string | number | Date,
    pending_amount: number,
    pending_expiration: string | number | Date,
    part_number?: string,
    unit_type: UnitType,
    unit: string,
    image?: string,
    url?: string,
    price: number,
    currency: string,
    currency_format: string,
    labels: Label[],
    last_update: string | number | Date,
    created_at: string | number | Date,
    created_by: string
}

/**
 * A Helper class for dealing with Items in the database.
 */
export class Items {
    /**
     * todo
     * @param created_by
     * @param inventory
     * @param name
     * @param amount
     * @param options
     */
    static async create(created_by: string, inventory: string, name: string, amount: number = 0, options?: {
        description?: string,
        image?: string,
        unit_type?: string,
        unit?: string,
        url?: string,
        price?: number,
        currency?: string,
        labels?: string[]
    }): Promise<Item | undefined> {
        LOGGER.debug(`Creating new Item with name '${name}', for Inventory with UUID '${inventory}'`);
        const uuid: string = Bun.randomUUIDv7();

        await Database.SQL`INSERT INTO items (uuid, created_by, inventory, name, amount, unit_type, unit, description, image, url, price, currency, currency_format)
                           VALUES (${uuid}, ${created_by}, ${inventory}, ${name}, ${amount}, ${options?.unit_type ?? 'count'}, ${options?.unit ?? 'piece'}, ${options?.description ?? null},
                                   ${options?.image ?? null}, ${options?.url ?? null}, ${options?.price ?? 0.00},
                                   ${options?.currency ?? 'N/A'}, ${currencies.get(options?.currency ?? '') ?? '%value%'})`
            .then((): void => {
                Audit.user(created_by, uuid, 'Creation', `Item created`);
                Redis.increment(`inventory:${inventory}:total_item_count`);
            })
            .catch((err: any): void => LOGGER.error(`Items#create[0]: Database request failed. ${err.name}`, err));

        if (options && options.labels) await Labels.addLabelsToItem(uuid, options.labels);

        const item: Item | undefined = (await Database.SQL`SELECT *
                                                           FROM items
                                                           WHERE uuid = ${uuid}
                                                           LIMIT 1`
            .catch((err: any): Item[] => {
                LOGGER.error(`Items#create[1]: Database request failed. `, err)
                return [];
            }))[0] as Item ?? undefined;

        if (!item) {
            LOGGER.error(`Failed to retrieve newly created Item with UUID '${uuid}' from database.`);
            return undefined;
        }

        // noinspection ES6MissingAwait
        Redis.setObj(`item:${uuid}`, item);

        return item;
    }

    /**
     * todo
     * @param inventory
     * @param amount
     * @param order_by
     * @param offset
     */
    static async fetch(inventory: string, amount: number = 15, offset: number = 0, order_by: string = 'last_update'): Promise<Item[]> {
        const redisKey: RedisKey = inventory + ':' + amount + ':' + offset + ':' + (order_by);

        let items: Item[] = [];

        if (await Redis.has(redisKey)) {
            items = await Redis.getObjList(redisKey) as Item[];
        } else {
            items = await Database.SQL`SELECT uuid,
                                              inventory,
                                              name,
                                              description,
                                              amount,
                                              reserved_amount,
                                              reserved_expiration,
                                              pending_amount,
                                              pending_expiration,
                                              part_number,
                                              unit_type,
                                              unit,
                                              image,
                                              url,
                                              price,
                                              currency,
                                              currency_format,
                                              last_update
                                       FROM items
                                       WHERE inventory = ${inventory}
                                       ORDER BY ${Database.SQL(order_by)}
                                       LIMIT ${amount} OFFSET ${offset}`
                .catch((err: any): Item[] => {
                    LOGGER.error(`Items#fetch[0]: Database request failed. `, err)
                    return [];
                });

            await Redis.setObjList(redisKey, items);
        }

        for (const item of items) {
            item.labels = await Labels.getLabelsForItem(item.uuid);
        }

        return items ?? [];
    }

    /**
     * todo
     * @param inventory
     */
    static async fetchTotalItemCount(inventory: string): Promise<number> {
        const redisKey: RedisKey = `inventory:${inventory}:total_item_count`;

        if (await Redis.has(redisKey)) {
            return await Redis.getAsNumber(redisKey);
        } else {
            const result: any = await Database.SQL`SELECT COUNT(uuid) AS amount
                                                   FROM items
                                                   WHERE inventory = ${inventory}`
                .catch((err: any): [] => {
                    LOGGER.error(`Items#fetchTotalItemCount[0]: Database request failed. `, err)
                    return [];
                });

            const count: any = result[0].amount ?? 0;
            await Redis.set(redisKey, count, 60);

            return count;
        }
    }

    static async getItem(uuid: string): Promise<Item | undefined> {
        const redisKey: RedisKey = `item:${uuid}`;

        if (await Redis.has(redisKey)) {

        } else {
            const item: Item | undefined = (await Database.SQL`SELECT *
                                                               FROM items
                                                               WHERE uuid = ${uuid}`
                .catch((err: any): Item[] => {
                    LOGGER.error(`Items#fetchTotalItemCount[0]: Database request failed. `, err)
                    return [];
                }))[0] as Item ?? undefined;

            if (!item) return undefined;

            // noinspection ES6MissingAwait
            Redis.setObj(`item:${uuid}`, item);

            return item;
        }
    }

    /**
     * todo
     * @param uuid
     * @param user
     */
    static async deleteItem(uuid: string, user?: string): Promise<void> {
        await Database.SQL`DELETE
                           FROM items
                           WHERE uuid = ${uuid}`
            .then((): void => {
                if (user) Audit.user(user, uuid, 'Removal', `Item deleted`);
                else Audit.system(uuid, 'Removal', `Item deleted`);
                Redis.del(`item:${uuid}`);
            })
            .catch((err: any): void => LOGGER.error(`Items#deleteItem[0]: Database request failed. `, err));
    }
}