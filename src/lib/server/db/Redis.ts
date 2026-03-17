import { redis } from "bun";
import {LOGGER} from "../../../hooks.server.ts";

class Redis {
    static async initialize(): Promise<void> {
        await LOGGER.timed(`Initializing Redis client.`,`Redis Client initialized.`, async () => {
            redis.onconnect = ((): void => {
                LOGGER.debug(`Redis client connected.`);
            });
            redis.onclose = (error: Error): void => {
                LOGGER.error(`Redis client disconnected.`, error);
            }

            if (!redis.connected) await redis.connect();
        });
    }
}

export default Redis;