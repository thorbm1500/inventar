import {Database} from "$lib/server/db/database";
import {LOGGER} from "../../../../hooks.server";
import {Audit} from "$lib/server/db/components/audit";
import {Redis, type RedisKey} from "$lib/server/db/redis";
import {type Label, Labels} from "$lib/server/db/components/labels";
import type {UnitType} from "$lib/server/db/components/units";

export interface Item {
    readonly inventory: string,
    readonly uuid: string,
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
    external_fetch: boolean,
    last_external_fetch: string | number | Date,
    current_price: number,
    previous_price: number,
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
     * @param user
     * @param inventory
     * @param name
     * @param amount
     * @param options
     */
    static async create(user: string, inventory: string, name: string, amount: number = 0, options?: {
        description?: string,
        image?: string,
        unit_type?: string,
        unit?: string,
        url?: string,
        external_fetch?: boolean,
        price?: number,
        currency?: string,
        labels?: string[]
    }): Promise<Item | undefined> {
        LOGGER.debug(`Creating new Item with name '${name}', for Inventory with UUID '${inventory}'`);
        const uuid: string = Bun.randomUUIDv7();

        await Database.SQL`INSERT INTO items (uuid, created_by, inventory, name, amount)
                           VALUES (${uuid}, ${user}, ${inventory}, ${name}, ${amount})`
            .then((): void => {
                Audit.user(user, uuid, 'Creation', `Item created`);
                Redis.increment(`inventory:${inventory}:total_item_count`);
            })
            .catch((err: any): void => LOGGER.error(`Items#create[0]: Database request failed. ${err.name}`, err));

        if (options?.labels) await Labels.addLabelsToItem(uuid, options.labels);
        if (options?.price) await this.updatePrice(uuid, options.price, options?.currency);
        if (options?.description) await this.updateDescription(uuid, options.description);
        if (options?.image) await this.updateImage(uuid, options.image);
        if (options?.unit_type && options?.unit) await this.updateUnits(uuid, options.unit_type, options.unit);
        if (options?.url) await this.updateExternal(uuid, options.url, options?.external_fetch);

        const item: Item | undefined = await this.getItem(uuid);

        if (!item) {
            LOGGER.error(`Failed to retrieve newly created Item with UUID '${uuid}' from database.`);
            return undefined;
        }

        return item;
    }

    static async updatePrice(uuid: string, price: number, currency?: string): Promise<void> {
        // noinspection ES6MissingAwait
        Redis.del(`item:${uuid}`);

        await Database.SQL`UPDATE items
                           SET price=${price}
                           WHERE uuid = ${uuid}`
            .catch((err: any): [] => {
                LOGGER.error(`Items#updatePrice[0]: Database request failed. `, err)
                return [];
            });

        if (currency) {
            await Database.SQL`UPDATE items
                               SET currency=${currency}
                               WHERE inventory = ${uuid}`
                .catch((err: any): [] => {
                    LOGGER.error(`Items#updatePrice[1]: Database request failed. `, err)
                    return [];
                });
        }
    }

    static async updateDescription(uuid: string, description: string): Promise<void> {
        // noinspection ES6MissingAwait
        Redis.del(`item:${uuid}`);

        await Database.SQL`UPDATE items
                           SET description=${description}
                           WHERE uuid = ${uuid}`
            .catch((err: any): [] => {
                LOGGER.error(`Items#updateDescription[0]: Database request failed. `, err)
                return [];
            });
    }

    static async updateImage(uuid: string, image: string): Promise<void> {
        // noinspection ES6MissingAwait
        Redis.del(`item:${uuid}`);

        await Database.SQL`UPDATE items
                           SET image=${image}
                           WHERE uuid = ${uuid}`
            .catch((err: any): [] => {
                LOGGER.error(`Items#updateImage[0]: Database request failed. `, err)
                return [];
            });
    }

    static async updateUnits(uuid: string, unit_type: string, unit: string): Promise<void> {
        // noinspection ES6MissingAwait
        Redis.del(`item:${uuid}`);

        await Database.SQL`UPDATE items
                           SET unit_type=${unit_type},
                               unit=${unit}
                           WHERE uuid = ${uuid}`
            .catch((err: any): [] => {
                LOGGER.error(`Items#updateUnits[0]: Database request failed. `, err)
                return [];
            });
    }

    static async updateExternal(uuid: string, url: string, external_fetch?: boolean): Promise<void> {
        // noinspection ES6MissingAwait
        Redis.del(`item:${uuid}`);

        await Database.SQL`UPDATE items
                           SET url=${url}
                           WHERE uuid = ${uuid}`
            .catch((err: any): [] => {
                LOGGER.error(`Items#updateExternal[0]: Database request failed. `, err)
                return [];
            });

        if (external_fetch) {
            await Database.SQL`UPDATE items
                               SET url=${external_fetch}
                               WHERE uuid = ${uuid}`
                .catch((err: any): [] => {
                    LOGGER.error(`Items#updateExternal[1]: Database request failed. `, err)
                    return [];
                });
        }
    }


    /**
     * todo
     * @param inventory
     * @param amount
     * @param order_by
     * @param offset
     */
    static async fetch(inventory: string, amount: number = 15, offset: number = 0, order_by: string = 'last_update'): Promise<Item[]> {
        offset = offset > -1 ? offset : 0;
        const redisKey: RedisKey = inventory + ':' + amount + ':' + offset + ':' + order_by;

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
                                              current_price,
                                              currency,
                                              currency_format,
                                              last_update
                                       FROM items
                                       WHERE inventory = ${inventory}
                                       ORDER BY ${Database.SQL(order_by)} ASC
                                       LIMIT ${amount} OFFSET ${offset}`
                .catch((err: any): Item[] => {
                    LOGGER.error(`Items#fetch[0]: Database request failed. `, err)
                    return [];
                });

            // noinspection ES6MissingAwait
            Redis.setObjList(redisKey, items);
        }

        for (const item of items) {
            item.labels = await Labels.getLabelsForItem(item.uuid);
        }

        return items ?? [];
    }

    /**
     * todo
     * @param inventory
     * @param amount
     * @param order_by
     * @param offset
     */
    static async fetchDesc(inventory: string, amount: number = 15, offset: number = 0, order_by: string = 'last_update'): Promise<Item[]> {
        offset = offset > -1 ? offset : 0;
        const redisKey: RedisKey = inventory + ':' + amount + ':' + offset + ':' + order_by + ':DESC';

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
                                              current_price,
                                              currency,
                                              currency_format,
                                              last_update
                                       FROM items
                                       WHERE inventory = ${inventory}
                                       ORDER BY ${Database.SQL(order_by)} DESC
                                       LIMIT ${amount} OFFSET ${offset}`
                .catch((err: any): Item[] => {
                    LOGGER.error(`Items#fetchDesc[0]: Database request failed. `, err)
                    return [];
                });

            // noinspection ES6MissingAwait
            Redis.setObjList(redisKey, items);
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

            // noinspection ES6MissingAwait
            Redis.set(redisKey, count, 60);

            return count;
        }
    }

    static async getItem(uuid: string): Promise<Item | undefined> {
        const redisKey: RedisKey = `item:${uuid}`;

        if (await Redis.has(redisKey)) {
            return await Redis.getObj(redisKey) as Item;
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