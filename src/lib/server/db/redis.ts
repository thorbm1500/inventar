import {LOGGER} from "../../../hooks.server";
import {env} from "$env/dynamic/private";
import {redis, RedisClient} from "bun";

export type RedisKey = RedisClient.KeyLike;

/**
 * A Helper class for dealing with Redis related tasks. This class mostly exists to lower the amount of
 * repeated code, and helps provide a more uniform end product.
 */
export class Redis {

    static async init(): Promise<void> {
        await LOGGER.timed(`Initializing Redis`,`Redis initialized`, async () => {
            redis.onconnect = async (): Promise<void> => {
                const pingStart: number = Bun.nanoseconds();
                await redis.ping().catch((err: Error): void => LOGGER.error(`Failed to connect to Redis server. `, err));
                LOGGER.info(`New Redis connection established. Ping Latency`, LOGGER.formatNanoseconds(pingStart, Bun.nanoseconds()));
            };

            const connected: boolean | void = await redis.connect()
                .then((): boolean => {
                    redis.onclose = (error: Error): void => {
                        // @ts-ignore
                        if (error.code === 'ERR_REDIS_CONNECTION_CLOSED') {
                            LOGGER.info(`Redis connection closed.`);
                        } else {
                            LOGGER.error(`Redis connection closed due to Error! `, error);
                        }
                    }
                    return redis.connected;
                })
                .catch((): void => LOGGER.warn(`No Redis connection was found. Is the URL set correctly?`));

            if (connected) {
                if (env.NODE_ENV !== 'production') {
                    await redis.send("FLUSHALL", ["SYNC"])
                        .then((): void => LOGGER.debug(`Redis database flushed.`))
                        .catch((err: any): void => LOGGER.error(`Failed to flush Redis. `, err))
                }
            }
        });
    }

    private static isConnected(): boolean {
        return redis.connected;
    }

    static shutdown(): void {
        redis.close();
    }

    /**
     * Checks if the provided key exists.
     * @param key The key to check for
     * @returns True, if the key exists, otherwise false
     */
    static async has(key: RedisKey): Promise<boolean> {
        if (!this.isConnected()) return false;
        return await redis.exists(key);
    }

    /**
     * Deletes the key for a specific key, and value pair.
     * @param key Key to delete
     */
    static async del(key: RedisKey): Promise<void> {
        if (!this.isConnected()) return;
        await redis.del(key);
    }

    /**
     * Sets the key, and value pair.
     * @param key The key to set
     * @param value The value to set
     * @param seconds `Default: 300` - The key's time to live, in seconds.
     */
    static async set(key: RedisKey, value: RedisKey, seconds: number = 300): Promise<void> {
        if (!this.isConnected()) return;
        await redis.set(key, value, 'EX', seconds);
    }

    /**
     * Sets the key, and value pair.
     * @remarks
     * The object is automatically cast to `Record<any,any>`, to allow for passing whole objects such
     * as fx. {@link User} or {@link Inventory}.
     * @param key The key to set
     * @param obj The Object to set
     * @param seconds `Default: 300` - The key's time to live, in seconds.
     */
    static async setObj(key: RedisKey, obj: Object, seconds: number = 300): Promise<void> {
        if (!this.isConnected()) return;

        const record = obj as Record<any, any>;
        if (record.length === 0) return;

        await redis.hset(key, record)
            .then(() => redis.expire(key, seconds))
            .catch((err: any): void => LOGGER.error(`Redis#setObj[0]: Failed to set object in Redis. `, err));
    }

    /**
     * Sets the key, and value pair.
     * @remarks
     * The object is automatically cast to `Record<any,any>`, to allow for passing whole objects such
     * as fx. {@link User} or {@link Inventory}.
     * @param key The key to set
     * @param objects The Object to set
     * @param seconds `Default: 300` - The key's time to live, in seconds.
     */
    static async setObjList(key: RedisKey, objects: Object[], seconds: number = 300): Promise<void> {
        if (!this.isConnected()) return;

        const redisKey: string = key + ':';
        let i: number = 0;

        for (const obj of objects) {
            await this.setObj(redisKey + i, obj);
            i++;
        }
    }

    /**
     * Gets the list of objects from a specific key.
     * @param key The key
     * @returns Objects as {@link Record}, if the key exists, otherwise an empty list
     */
    static async getObjList(key: RedisKey): Promise<Record<any, any>[]> {
        if (!this.isConnected()) return [];

        const objects: Record<any, any>[] = [];

        const redisKey: string = key + ':';
        let i: number = 0;

        while (await this.has(redisKey + i)) {
            objects.push(await this.getObj(redisKey + i));
            i++;
        }

        return objects;
    }

    /**
     * Gets the value for a specific key.
     * @param key The key
     * @returns String, if the key exists, otherwise null
     */
    static async get(key: RedisKey): Promise<string | null> {
        if (!this.isConnected()) return null;
        return await redis.get(key);
    }

    /**
     * Gets the value for a specific key.
     * @param key The key
     * @returns The value of the key as {@link number}
     */
    static async getAsNumber(key: RedisKey): Promise<number> {
        if (!this.isConnected()) return -1;
        return Number.parseInt(String(await Redis.get(key)));
    }

    /**
     * Gets the object for a specific key.
     * @param key The key
     * @returns Object as {@link Record}, if the key exists, otherwise null
     */
    static async getObj(key: RedisKey): Promise<Record<any, any>> {
        if (!this.isConnected()) return {};
        return await redis.hgetall(key) as Record<any, any>;
    }

    /**
     * Updates a field for a specific object.
     * @param key Key of object
     * @param field Field to update
     * @param value The field's new value
     */
    static async updateObjField(key: RedisKey, field: string | number, value: RedisKey | number): Promise<void> {
        if (!this.isConnected()) return;
        await redis.hset(key, [field, value] as Record<any, any>);
    }

    /**
     * Increments a key's value, by the given amount.
     * @param key Key of object
     * @param amount `Default: 1` - Amount to increment by
     */
    static async increment(key: RedisKey, amount: number = 1): Promise<void> {
        if (!this.isConnected()) return;
        await redis.incrby(key, amount);
    }

    /**
     * Decrements a key's value, by the given amount.
     * @param key Key of object
     * @param amount `Default: 1` - Amount to decrement by
     */
    static async decrement(key: RedisKey, amount: number = 1): Promise<void> {
        if (!this.isConnected()) return;
        await redis.decrby(key, amount);
    }
}