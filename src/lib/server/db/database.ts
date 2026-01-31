import postgres, {type RowList} from 'postgres';
import {env} from "$env/dynamic/private";
import type {Inventory} from "$lib/server/db/schema";

export const sql = postgres({
    host: env.DB_HOST,
    port: Number.parseInt(env.DB_PORT ?? 'NONE'),
    database: env.DB_DATABASE,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    onnotice: notice => {
    }
});

export enum OrderType {
    AMOUNT_ASC = "ORDER BY amount ASC",
    AMOUNT_DESC = "ORDER BY amount DESC",
    PRICE_ASC = "ORDER BY price ASC",
    PRICE_DESC = "ORDER BY price DESC",
    NAME_ASC = "ORDER BY name ASC",
    NAME_DESC = "ORDER BY name DESC",
    OLDEST = "ORDER BY creation_date ASC",
    NEWEST = "ORDER BY creation_date DESC",
    NONE = ""
}

/**
 * An internal utility class.
 */
class Utility {
    static async query(query: string, params: string[]): Promise<RowList<any>> {
        return await sql.unsafe(query, params)
            .then(result => {
                return result;
            })
            .catch(error => {
                throw error;
            });
    }
}

export class Inventories {

    /**
     * Creates a new inventory.
     * @param name The inventory's name.
     * @return The UUID of the new inventory, or undefined if any errors occurred.
     */
    static async create(name: string): Promise<string | undefined>;

    /**
     * Creates a new inventory.
     * @param name The inventory's name.
     * @param description The inventory's description, if any.
     * @return The UUID of the new inventory, or undefined if any errors occurred.
     */
    static async create(name: string, description: string): Promise<string | undefined>;

    /**
     * Creates a new inventory.
     * @param name The inventory's name.
     * @param image The path of the inventory's thumbnail, if any.
     * @return The UUID of the new inventory, or undefined if any errors occurred.
     */
    static async create(name: string, image: string): Promise<string | undefined>;

    /**
     * Creates a new inventory.
     * @param name The inventory's name.
     * @param description The inventory's description, if any.
     * @param image The path of the inventory's thumbnail, if any.
     * @return The UUID of the new inventory, or undefined if any errors occurred.
     */
    static async create(name: string, description?: string, image?: string): Promise<string | undefined> {
        let query: string = "INSERT INTO" + " inventories (name";
        let values: string = ") VALUES ($1";
        let params: string[] = [name]

        if (description) {
            query += ",description";
            params.push(description);
            values += ",$" + params.length;
        }
        if (image) {
            query += ",image";
            params.push(image);
            values += ",$" + params.length;
        }

        query += values + ") ON CONFLICT DO NOTHING RETURNING inventory_uuid";

        return await Utility.query(query, params)
            .then(result => {
                const id = result[0]['inventory_uuid'];
                console.log(`Inventory '${name}' has been created, and has received ID '${id}'`);
                return id;
            }).catch((error) => {
                console.error(`Failed to create inventory '${name}'. Error: ${error}`);
                return undefined;
            });
    }

    static async delete(uuid: string): Promise<boolean> {
        return await Utility.query(`DELETE
                                    FROM inventories
                                    WHERE inventory_uuid = $1`, [uuid])
            .then((): boolean => {
                console.log(`Successfully deleted inventory with UUID '${uuid}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to delete inventory with UUID '${uuid}'. Error: ${error}`);
                return false;
            })
    }

    static async rename(uuid: string, name: string): Promise<boolean> {
        return await Utility.query(`UPDATE inventories
                                    SET name = $1
                                    WHERE inventory_uuid = $2`, [name, uuid])
            .then((): boolean => {
                console.log(`Successfully renamed inventory with UUID '${uuid}' to '${name}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to rename inventory with UUID '${uuid}' to '${name}'. Error: ${error}`);
                return false;
            })
    }

    static async changeDescription(uuid: string, description: string): Promise<boolean> {
        return await Utility.query(`UPDATE inventories
                                    SET description = $1
                                    WHERE inventory_uuid = $2`, [description, uuid])
            .then((): boolean => {
                console.log(`Successfully updated the description of inventory with UUID '${uuid}' to '${description}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to update the description of inventory with UUID '${uuid}' to '${description}'. Error: ${error}`);
                return false;
            })
    }


    static async changeImage(uuid: string, path: string): Promise<boolean> {
        return await Utility.query(`UPDATE inventories
                                    SET image_path = $1
                                    WHERE inventory_uuid = $2`, [path, uuid])
            .then((): boolean => {
                console.log(`Successfully updated image of inventory with UUID '${uuid}' to '${path}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to updated image of inventory with UUID '${uuid}' to '${path}'. Error: ${error}`);
                return false;
            })
    }

    static async removeDescription(uuid: string): Promise<boolean> {
        return await Utility.query(`UPDATE inventories
                                    SET description = NULL
                                    WHERE inventory_uuid = $1`, [uuid])
            .then((): boolean => {
                console.log(`Successfully removed description of inventory with UUID '${uuid}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to remove the description of inventory with UUID '${uuid}'. Error: ${error}`);
                return false;
            })
    }

    static async removeImage(uuid: string): Promise<boolean> {
        return await Utility.query(`UPDATE inventories
                                    SET image_path = NULL
                                    WHERE inventory_uuid = $1`, [uuid])
            .then((): boolean => {
                console.log(`Successfully removed image of inventory with UUID '${uuid}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to remove the image of inventory with UUID '${uuid}'. Error: ${error}`);
                return false;
            })
    }

    static async fetchAll(): Promise<Inventory[]> {
        return await Utility.query(`SELECT *
                                    FROM inventories`, [])
            .then(result => {
                return result;
            })
            .catch(error => {
                console.error(`Failed to fetch all inventories. Error: ${error}`);
                return [];
            })
    }

    static async fetch(amount: number = 6, order_by: string, order: string, offset: number = 0): Promise<any[]> {
        return await sql`select *
                         from inventories
                         ${ order_by === '' ? `` : sql`order by ${sql(order_by)} ${order === 'ASC' ? sql`ASC` : sql`DESC`}` }
                         LIMIT ${amount} OFFSET ${offset}`
            .then(result => {
                return result;
            })
            .catch(() => {
                return [];
            });
    }

    static async fetchTotalInventoryCount(): Promise<number> {
        return await Utility.query(`SELECT COUNT(inventory_uuid) AS amount
                                    FROM inventories`, [])
            .then(result => {
                return result[0].amount;
            })
            .catch(error => {
                console.error(`Failed to fetch total inventory count. Error: ${error}`);
                return 1;
            })
    }

    static async fetchInventoryByUuid(uuid: string): Promise<Inventory[]> {
        return await Utility.query(`SELECT *
                                    FROM inventories
                                    WHERE inventory_uuid = $1`, [uuid])
            .then(result => {
                return result;
            })
            .catch(error => {
                console.error(`Failed to remove the image of inventory with UUID '${uuid}'. Error: ${error}`);
                return [];
            })
    }

    static async fetchItems(id: string, amount: number = 15, order: OrderType | string = "NONE", simple: boolean = false): Promise<RowList<any>> {
        let query = simple ?
            `SELECT item_uuid, name, description, amount, price, currency_code
             FROM items
             WHERE inventory_uuid = $1
             LIMIT $2` :
            `SELECT *
             FROM items
             WHERE inventory_uuid = $1
             LIMIT $2`;

        //todo: Sanitize query.
        if (order !== "NONE") query += order;

        if (amount < 15) amount = 15;
        else if (amount > 60) amount = 60;

        return await Utility.query(query, [id, amount.toString()])
            .then(result => {
                return result;
            })
            .catch(error => {
                console.error(`Failed to fetch inventory with ID '${id}'. Error: ${error}`);
                return undefined;
            })
    }
}

export class Categories {
    static async create(inventory: string, name: string, description?: string): Promise<string | undefined> {
        let query: string = "INSERT INTO" + " categories (inventory_uuid, name";
        let values: string = ") VALUES ($1,$2";
        let params: string[] = [inventory, name]

        if (description) {
            query += ",description";
            params.push(description);
            values += ",$" + params.length;
        }

        query += values + ") ON CONFLICT DO NOTHING RETURNING category_uuid";

        return await Utility.query(query, params)
            .then(result => {
                const id = result[0]['category_uuid'];
                console.log(`Inventory '${name}' has been created, and has received ID '${id}'`);
                return id;
            }).catch((error) => {
                console.error(`Failed to create inventory '${name}'. Error: ${error}`);
                return undefined;
            });
    }

    static async delete(uuid: string): Promise<boolean> {
        return await Utility.query(`DELETE
                                    FROM categories
                                    WHERE category_uuid = $1`, [uuid])
            .then((): boolean => {
                console.log(`Successfully deleted category with UUID '${uuid}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to delete category with UUID '${uuid}'. Error: ${error}`);
                return false;
            })
    }

    static async rename(uuid: string, name: string): Promise<boolean> {
        return await Utility.query(`UPDATE categories
                                    SET name = $1
                                    WHERE category_uuid = $2`, [name, uuid])
            .then((): boolean => {
                console.log(`Successfully renamed category with UUID '${uuid}' to '${name}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to rename category with UUID '${uuid}' to '${name}'. Error: ${error}`);
                return false;
            })
    }

    static async changeDescription(uuid: string, description: string): Promise<boolean> {
        return await Utility.query(`UPDATE categories
                                    SET description = $1
                                    WHERE category_uuid = $2`, [description, uuid])
            .then((): boolean => {
                console.log(`Successfully updated the description of category with UUID '${uuid}' to '${description}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to update the description of category with UUID '${uuid}' to '${description}'. Error: ${error}`);
                return false;
            })
    }

    static async fetchAll(): Promise<RowList<any>> {
        return await Utility.query(`SELECT *
                                    FROM categories`, [])
            .then(result => {
                return result;
            })
            .catch(error => {
                console.error(`Failed to fetch all categories. Error: ${error}`);
                return undefined;
            })
    }
}

export class Items {
    /* Add categories to itemCategories table */
    static async create(inventory: string, name: string, description?: string,
                        amount: bigint = 0n, categories: [] = [], image?: string,
                        url?: string, price: number = 0, currency?: string): Promise<void> {
        let query: string = "INSERT INTO" + " items (inventory_uuid,name";
        let values: string = ") VALUES ($1";
        let params: string[] = [inventory, name]

        if (description) {
            query += ",description";
            params.push(description);
            values += ",$" + params.length;
        }
        if (amount != 0n) {
            query += ",amount";
            params.push(amount.toString());
            values += ",$" + params.length;
        }
        if (image) {
            query += ",image";
            params.push(image);
            values += ",$" + params.length;
        }
        if (url) {
            query += ",url";
            params.push(url);
            values += ",$" + params.length;
        }
        if (price != 0) {
            query += ",price";
            params.push(price.toString());
            values += ",$" + params.length;
        }
        if (currency) {
            query += ",currency";
            params.push(currency);
            values += ",$" + params.length;
        }

        query += values + ") ON CONFLICT DO NOTHING RETURNING item_uuid";

        return await Utility.query(query, params)
            .then(result => {
                const id = result[0]['item_uuid'];
                console.log(`Item '${name}' has been created, and has received ID '${id}'`);
                return id;
            }).catch((error) => {
                console.error(`Failed to create item '${name}'. Error: ${error}`);
                return undefined;
            });
    }

    static async addCategory(inventory: string, item: string, categories: string[]): Promise<void> {
        const query: string = "INSERT INTO item_categories (inventory_uuid,item_uuid,category_uuid) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING";

        for (const category of categories) {
            await Utility.query(query, [inventory, item, category])
                .then(() => {
                    console.log(`Category '${category}' has been added to item '${item}'`);
                }).catch((error) => {
                    console.error(`Failed to add category '${category}' to item '${item}'. Error: ${error}`);
                });
        }
    }

    static async removeCategory(inventory: string, item: string, categories: string[]): Promise<void> {
        const query: string = "DELETE FROM item_categories WHERE inventory_uuid=$1 AND item_uuid=$2 AND category_uuid=$3";

        for (const category of categories) {
            await Utility.query(query, [inventory, item, category])
                .then(() => {
                    console.log(`Category '${category}' has been removed from item '${item}'`);
                }).catch((error) => {
                    console.error(`Failed to remove category '${category}' from item '${item}'. Error: ${error}`);
                });
        }
    }

    static async delete(uuid: string): Promise<boolean> {
        return await Utility.query(`DELETE
                                    FROM items
                                    WHERE item_uuid = $1`, [uuid])
            .then((): boolean => {
                console.log(`Successfully deleted item with UUID '${uuid}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to delete item with UUID '${uuid}'. Error: ${error}`);
                return false;
            })
    }

    static async rename(uuid: string, name: string): Promise<boolean> {
        return await Utility.query(`UPDATE items
                                    SET name = $1
                                    WHERE item_uuid = $2`, [name, uuid])
            .then((): boolean => {
                console.log(`Successfully renamed item with UUID '${uuid}' to '${name}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to rename item with UUID '${uuid}' to '${name}'. Error: ${error}`);
                return false;
            })
    }

    static async changeDescription(uuid: string, description: string): Promise<boolean> {
        return await Utility.query(`UPDATE items
                                    SET description = $1
                                    WHERE item_uuid = $2`, [description, uuid])
            .then((): boolean => {
                console.log(`Successfully updated the description of item with UUID '${uuid}' to '${description}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to update the description of item with UUID '${uuid}' to '${description}'. Error: ${error}`);
                return false;
            })
    }

    static async updateAmount(uuid: string, amount: bigint): Promise<boolean> {
        return await Utility.query(`UPDATE categories
                                    SET amount = $1
                                    WHERE item_uuid = $2`, [amount.toString(), uuid])
            .then((): boolean => {
                console.log(`Successfully updated the amount of item with UUID '${uuid}' to '${amount.toString()}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to update the amount of item with UUID '${uuid}' to '${amount.toString()}'. Error: ${error}`);
                return false;
            })
    }

    static async updatePrice(uuid: string, amount: number): Promise<boolean> {
        return await Utility.query(`UPDATE categories
                                    SET price = $1
                                    WHERE item_uuid = $2`, [amount.toString(), uuid])
            .then((): boolean => {
                console.log(`Successfully updated the price of item with UUID '${uuid}' to '${amount.toString()}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to update the price of item with UUID '${uuid}' to '${amount.toString()}'. Error: ${error}`);
                return false;
            })
    }

    //todo: Update thumbnail
    //todo: Change url
    //todo: Change currency
    //todo: Change reserved amount
    //todo: Update pending amount
}

export interface User {
    uuid: string,
    email: string,
    username: string,
    profile_picture: string,
    created_at: string,
    last_login: string,
    superuser: boolean
}

export class Users {
    static async create(email: string, username: string, password_hash: string): Promise<User | undefined> {
        return await Utility.query(`INSERT INTO users (email, username, password_hash)
                                    VALUES ($1, $2, $3)`, [email, username, password_hash])
            .then(async () => {
                return await this.getFromUsername(username) ?? undefined;
            })
            .catch(error => {
                console.error(`Failed to create new user with username '${username}' and email '${email}'. Error: ${error}`);
                return undefined;
            })
    }

    static async getFromUuid(uuid: string): Promise<User | undefined> {
        return await Utility.query(`SELECT *
                                    FROM users
                                    WHERE uuid = $1`, [uuid])
            .then(result => {
                return result[0] ?? undefined;
            })
            .catch(error => {
                console.error(`Failed to get user with uuid '${uuid}'. Error: ${error}`);
                return undefined;
            })
    }

    static async getFromUsername(username: string): Promise<User | undefined> {
        return await Utility.query(`SELECT *
                                    FROM users
                                    WHERE username = $1`, [username])
            .then(result => {
                return result[0] ?? undefined;
            })
            .catch(error => {
                console.error(`Failed to get user with username '${username}'. Error: ${error}`);
                return undefined;
            })
    }

    static async getFromEmail(email: string): Promise<User | undefined> {
        return await Utility.query(`SELECT *
                                    FROM users
                                    WHERE email = $1`, [email])
            .then(result => {
                return result[0] ?? undefined;
            })
            .catch(error => {
                console.error(`Failed to get user with email '${email}'. Error: ${error}`);
                return undefined;
            });
    }

    static async getPasswordHash(uuid: string): Promise<String | undefined> {
        return await Utility.query(`SELECT password_hash
                                    FROM users
                                    WHERE uuid = $1`, [uuid])
            .then(result => {
                return result[0].password_hash ?? undefined;
            })
            .catch(error => {
                console.error(`Failed to get password hash for user with uuid '${uuid}'. Error: ${error}`);
                return undefined;
            });
    }

    static async delete(email: string): Promise<boolean> {
        return await Utility.query(`DELETE
                                    FROM users
                                    WHERE email = $1`, [email])
            .then(() => {
                return true;
            })
            .catch(error => {
                console.error(`Failed to delete user with email '${email}'. Error: ${error}`);
                return false;
            })
    }
}

export interface Session {
    uuid: string,
    session_id: string,
    expires: number
}

export class Sessions {
    /**
     * Creates a new session in the database.
     * @param session Session to cache.
     */
    static async new(session: Session): Promise<RowList<any>> {
        return await Utility.query(`INSERT INTO sessions (uuid, session_id, expires)
                                    VALUES ($1, $2, $3)
                                    ON CONFLICT (uuid) DO UPDATE
                                        SET session_id = $2,
                                            expires    = $3`, [session.uuid, session.session_id, String(session.expires)])
            .catch(error => {
                console.error(`Failed to create a new session for user with uuid '${session.uuid}' with id '${session.session_id}'. Error: ${error}`);
                return false;
            });
    }

    /**
     * Gets an existing session.
     * @param session_id Id of session to retrieve.
     */
    static async get(session_id: string): Promise<any> {
        return await Utility.query(`SELECT *
                                    FROM sessions
                                    WHERE session_id = $1`, [session_id])
            .then(result => {
                return {uuid: result[0].uuid, session_id: result[0].session_id, expires: result[0].expires};
            })
            .catch(error => {
                console.error(`Failed to retrieve session with id '${session_id}'. Error: ${error}`);
                return undefined;
            });
    }

    /**
     * Renews an existing session, preventing the user from having to log in again too fast.
     * @param session_id Id of session to renew.
     * @param expires New expiration date.
     */
    static async renew(session_id: string, expires: number): Promise<void> {
        await Utility.query(`UPDATE sessions
                             SET expires = $1
                             WHERE session_id = $2`, [String(expires), session_id])
            .catch(error => {
                console.error(`Failed to invalidate session with id '${session_id}'. Error: ${error}`);
                return false;
            });
    }

    /**
     * Invalidates the session, forcing the user to login again.
     * @param session_id Id of session to invalidate.
     */
    static async invalidate(session_id: string): Promise<void> {
        await Utility.query(`DELETE
                             FROM sessions
                             WHERE session_id = $1`, [session_id])
            .catch(error => {
                console.error(`Failed to invalidate session with id '${session_id}'. Error: ${error}`);
                return false;
            });
    }
}

export default {Inventories, Categories, Items, Users, Sessions};