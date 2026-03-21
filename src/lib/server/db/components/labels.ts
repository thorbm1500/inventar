import {Redis, type RedisKey} from "$lib/server/db/redis";
import {Database} from "$lib/server/db/database";
import {LOGGER} from "../../../../hooks.server";
import {Audit} from "$lib/server/db/components/audit";

export interface Label {
    uuid: string,
    inventory: string,
    name: string,
    color: string
}

// noinspection DuplicatedCode
export class Labels {
    /**
     * todo
     * @param uuid Inventory to get Labels for
     */
    static async getLabelsForInventory(uuid: string): Promise<Label[]> {
        const redisKey: RedisKey = `labels:inventory:${uuid}`;

        if (await Redis.has(redisKey)) {
            return await Redis.getObjList(redisKey) as Label[];
        } else {
            const labels: Label[] = await Database.SQL`SELECT *
                                                       FROM labels
                                                       WHERE inventory = ${uuid}
                                                       ORDER BY name DESC`
                .catch((err: any): Label[] => {
                    LOGGER.error(`Inventories#getLabelsForInventory[0]: Database request failed. `, err)
                    return [];
                });

            if (labels.length === 0) return [];

            // noinspection ES6MissingAwait
            Redis.setObjList(redisKey, labels);

            return labels;
        }
    }

    /**
     * todo
     * @param uuid Item to get labels for
     */
    static async getLabelsForItem(uuid: string): Promise<Label[]> {
        const redisKey: RedisKey = `labels:item:${uuid}`;

        if (await Redis.has(redisKey)) {
            return await Redis.getObjList(redisKey) as Label[];
        } else {
            const labelUuids: any[] = await Database.SQL`SELECT label
                                                         FROM item_labels
                                                         WHERE item = ${uuid}`
                .catch((err: any): any[] => {
                    LOGGER.error(`Inventories#getLabelsForItem[1]: Database request failed. `, err)
                    return [];
                });

            const labels: Label[] = [];

            for (const label of labelUuids) {
                const result: Label | undefined = (await Database.SQL`SELECT *
                                                                     FROM labels
                                                                     WHERE uuid = ${label.label}
                                                                     LIMIT 1`)[0];

                if (result?.uuid) labels.push(result);
            }

            if (labels.length !== 0) {
                // noinspection ES6MissingAwait
                Redis.setObjList(redisKey, labels);
            }

            return labels;
        }
    }

    static async addLabelsToItem(uuid: string, labels: string[]): Promise<void> {
        for (const label of labels) {
            await Database.SQL`INSERT INTO item_labels
                               VALUES (${uuid}, ${label})`
                .then((): Promise<void> => Audit.system(uuid, 'Modification', `Label with UUID ${label} added`))
                .catch((err: any): void => LOGGER.error(`Failed to add Label '${label}' to Item '${uuid}'.`, err));
        }
    }
}