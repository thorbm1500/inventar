import postgres, {type RowList} from 'postgres';
import {env} from "$env/dynamic/private";
import type {Currency, Session} from "$lib/server/db/schema";

export const sql = postgres({
    host: env.DB_HOST,
    port: Number.parseInt(env.DB_PORT ?? 'NONE'),
    database: env.DB_DATABASE,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    onnotice: notice => {
    }
});

export async function getCurrencies(): Promise<Currency[]> {
    return await sql`SELECT *
                     FROM currencies`
        .then(result => {
            const results: Currency[] = [];
            result.forEach(row => results.push({code: row.code, number: row.number, symbol: row.symbol ?? null}))
            return results;
        })
        .catch(error => {
            console.error(`Failed to fetch currencies. Error: ${error}`);
            return [];
        })
}

export class Inventories {

    /**
     * Creates a new inventory.
     * @param name The inventory's name.
     * @param description The inventory's description, if any.
     * @param image The path of the inventory's thumbnail, if any.
     * @return The UUID of the new inventory, or undefined if any errors occurred.
     */
    static async create(name: string, description?: string, image?: string): Promise<string | undefined> {
        return await sql`INSERT INTO inventories (name${description ? `,description` : ``}${image ? `,image` : ``})
                         VALUES (${name}${description ? `,${description}` : ``}${image ? `,${image}` : ``})
                         ON CONFLICT DO NOTHING
                         RETURNING inventory_uuid`
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
        return await sql`DELETE
                         FROM inventories
                         WHERE inventory_uuid = ${uuid}`
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
        return await sql`UPDATE inventories
                         SET name = ${name}
                         WHERE inventory_uuid = ${uuid}`
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
        return await sql`UPDATE inventories
                         SET description = ${description}
                         WHERE inventory_uuid = ${uuid}`
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
        return await sql`UPDATE inventories
                         SET image_path = ${path}
                         WHERE inventory_uuid = ${uuid}`
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
        return await sql`UPDATE inventories
                         SET description = NULL
                         WHERE inventory_uuid = ${uuid}`
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
        return await sql`UPDATE inventories
                         SET image_path = NULL
                         WHERE inventory_uuid = ${uuid}`
            .then((): boolean => {
                console.log(`Successfully removed image of inventory with UUID '${uuid}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to remove the image of inventory with UUID '${uuid}'. Error: ${error}`);
                return false;
            })
    }

    static async fetchAll() {
        return await sql`SELECT *
                         FROM inventories`
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
                         from inventories ${order_by === '' ? `` : sql`order by
                         ${sql(order_by)}
                         ${order === 'ASC' ? sql`ASC` : sql`DESC`}`}
                         LIMIT ${amount} OFFSET ${offset}`
            .then(result => {
                return result;
            })
            .catch(error => {
                console.error(`Failed to fetch items. Error: ${error}`);
                return [];
            });
    }

    static async fetchTotalInventoryCount(): Promise<number> {
        return await sql`SELECT COUNT(inventory_uuid) AS amount
                         FROM inventories`
            .then(result => {
                return result[0].amount;
            })
            .catch(error => {
                console.error(`Failed to fetch total inventory count. Error: ${error}`);
                return 1;
            })
    }

    static async fetchInventoryByUuid(uuid: string) {
        return await sql`SELECT *
                         FROM inventories
                         WHERE inventory_uuid = ${uuid}`
            .then(result => {
                return result;
            })
            .catch(error => {
                console.error(`Failed to fetch inventory with UUID '${uuid}'. Error: ${error}`);
                return [];
            })
    }

    static async fetchItems(amount: number = 15, order_by: string, order: string, offset: number = 0) {
        if (amount < 15) amount = 15;
        else if (amount > 60) amount = 60;

        return await sql`select *
                         from items ${order_by === '' ? `` : sql`order by
                         ${sql(order_by)}
                         ${order === 'ASC' ? sql`ASC` : sql`DESC`}`}
                         LIMIT ${amount} OFFSET ${offset}`
            .then(result => {
                return result;
            })
            .catch(error => {
                console.error(`Failed to fetch items. Error: ${error}`);
                return undefined;
            })
    }
}

export class Categories {
    static async create(name: string, description?: string) {
        return await sql`INSERT INTO categories (name${description ? description : ``})
                         VALUES (${name}${description ? `,${description}` : ``})
                         ON CONFLICT DO NOTHING
                         RETURNING category_uuid`
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
        return await sql`DELETE
                         FROM categories
                         WHERE category_uuid = ${uuid}`
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
        return await sql`UPDATE categories
                         SET name = ${name}
                         WHERE category_uuid = ${uuid}`
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
        return await sql`UPDATE categories
                         SET description = ${description}
                         WHERE category_uuid = ${uuid}`
            .then((): boolean => {
                console.log(`Successfully updated the description of category with UUID '${uuid}' to '${description}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to update the description of category with UUID '${uuid}' to '${description}'. Error: ${error}`);
                return false;
            })
    }

    static async fetchAll() {
        return await sql`SELECT *
                         FROM categories`
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
    /* todo Add categories to itemCategories table */
    static async create(inventory: string, name: string, description?: string, amount: number = 0, categories: [] = [], image?: string,
                        url?: string, price: number = 0, currency: string = 'DKK'): Promise<{ failed: boolean, error: string, id: any }> {
        const item = {
            inventory_uuid: inventory,
            name: name,
            description: description ?? null,
            amount: amount,
            thumbnail_path: image ?? null,
            url: url ?? null,
            price: price,
            currency: currency,
        }

        return await sql`INSERT INTO items ${sql(item)}
                         ON CONFLICT
        DO NOTHING RETURNING item_uuid`
            .then(result => {
                const id = result[0]['item_uuid'];
                console.log(`Item '${name}' has been created, and has received ID '${id}'`);
                return {failed: false, error: '', id: id};
            }).catch((error) => {
                console.error(`Failed to create item '${name}'. Error: ${error}`);
                return {failed: true, error: error, id: undefined};
            });
    }

    static async fetch(inventory: string, amount: number = 15, order_by: string, order: string, offset: number = 0): Promise<any[]> {
        return await sql`select *
                         from items
                         where inventory_uuid = ${inventory}
                             ${order_by === '' ? `` : sql`order by
                             ${sql(order_by)}
                             ${order === 'ASC' ? sql`ASC` : sql`DESC`}`}
                         LIMIT ${amount} OFFSET ${offset}`
            .then(result => {
                return result;
            })
            .catch(error => {
                console.error(`Failed to fetch items. Error: ${error}`);
                return [];
            });
    }

    static async fetchTotalItemCount(inventory_uuid: string): Promise<number> {
        return await sql`SELECT COUNT(item_uuid) AS amount
                         FROM items
                         WHERE inventory_uuid = ${inventory_uuid}`
            .then(result => {
                return result[0].amount;
            })
            .catch(error => {
                console.error(`Failed to fetch total item count. Error: ${error}`);
                return 1;
            })
    }

    static async addCategory(inventory: string, item: string, categories: string[]): Promise<void> {
        for (const category of categories) {
            await sql`INSERT INTO item_categories (inventory_uuid, item_uuid, category_uuid)
                      VALUES (${inventory}, ${item}, ${category})
                      ON CONFLICT DO NOTHING`
                .then(() => {
                    console.log(`Category '${category}' has been added to item '${item}'`);
                }).catch((error) => {
                    console.error(`Failed to add category '${category}' to item '${item}'. Error: ${error}`);
                });
        }
    }

    static async removeCategory(inventory: string, item: string, categories: string[]): Promise<void> {
        for (const category of categories) {
            await sql`DELETE
                      FROM item_categories
                      WHERE inventory_uuid = ${inventory}
                        AND item_uuid = ${item}
                        AND category_uuid = ${category}`
                .then(() => {
                    console.log(`Category '${category}' has been removed from item '${item}'`);
                }).catch((error) => {
                    console.error(`Failed to remove category '${category}' from item '${item}'. Error: ${error}`);
                });
        }
    }

    static async delete(uuid: string): Promise<boolean> {
        return await sql`DELETE
                         FROM items
                         WHERE item_uuid = ${uuid}`
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
        return await sql`UPDATE items
                         SET name = ${name}
                         WHERE item_uuid = ${uuid}`
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
        return await sql`UPDATE items
                         SET description = ${description}
                         WHERE item_uuid = ${uuid}`
            .then((): boolean => {
                console.log(`Successfully updated the description of item with UUID '${uuid}' to '${description}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to update the description of item with UUID '${uuid}' to '${description}'. Error: ${error}`);
                return false;
            })
    }

    static async updateAmount(uuid: string, amount: number): Promise<boolean> {
        return await sql`UPDATE categories
                         SET amount = ${amount}
                         WHERE item_uuid = ${uuid}`
            .then((): boolean => {
                console.log(`Successfully updated the amount of item with UUID '${uuid}' to '${amount}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to update the amount of item with UUID '${uuid}' to '${amount}'. Error: ${error}`);
                return false;
            })
    }

    static async updatePrice(uuid: string, amount: number): Promise<boolean> {
        return await sql`UPDATE categories
                         SET price = ${amount}
                         WHERE item_uuid = ${uuid}`
            .then((): boolean => {
                console.log(`Successfully updated the price of item with UUID '${uuid}' to '${amount}'`)
                return true;
            })
            .catch(error => {
                console.error(`Failed to update the price of item with UUID '${uuid}' to '${amount}'. Error: ${error}`);
                return false;
            })
    }

    //todo: Update thumbnail
    //todo: Change url
    //todo: Change currency
    //todo: Change reserved amount
    //todo: Update pending amount
}

export class Users {
    static async create(email: string, username: string, password_hash: string) {
        return await sql`INSERT INTO users (email, username, password_hash)
                         VALUES (${email}, ${username}, ${password_hash})`
            .then(async () => {
                return await this.getFromUsername(username) ?? undefined;
            })
            .catch(error => {
                console.error(`Failed to create new user with username '${username}' and email '${email}'. Error: ${error}`);
                return undefined;
            })
    }

    static async getFromUuid(uuid: string) {
        return await sql`SELECT *
                         FROM users
                         WHERE uuid = ${uuid}`
            .then(result => {
                return result[0] ?? undefined;
            })
            .catch(error => {
                console.error(`Failed to get user with uuid '${uuid}'. Error: ${error}`);
                return undefined;
            })
    }

    static async getFromUsername(username: string) {
        return await sql`SELECT *
                         FROM users
                         WHERE username = ${username}`
            .then(result => {
                return result[0] ?? undefined;
            })
            .catch(error => {
                console.error(`Failed to get user with username '${username}'. Error: ${error}`);
                return undefined;
            })
    }

    static async getFromEmail(email: string) {
        return await sql`SELECT *
                         FROM users
                         WHERE email = ${email}`
            .then(result => {
                return result[0] ?? undefined;
            })
            .catch(error => {
                console.error(`Failed to get user with email '${email}'. Error: ${error}`);
                return undefined;
            });
    }

    static async getPasswordHash(uuid: string): Promise<String | undefined> {
        return await sql`SELECT password_hash
                         FROM users
                         WHERE uuid = ${uuid}`
            .then(result => {
                return result[0].password_hash ?? undefined;
            })
            .catch(error => {
                console.error(`Failed to get password hash for user with uuid '${uuid}'. Error: ${error}`);
                return undefined;
            });
    }

    static async delete(email: string): Promise<boolean> {
        return await sql`DELETE
                         FROM users
                         WHERE email = ${email}`
            .then(() => {
                return true;
            })
            .catch(error => {
                console.error(`Failed to delete user with email '${email}'. Error: ${error}`);
                return false;
            })
    }
}

export class Sessions {
    /**
     * Creates a new session in the database.
     * @param session Session to cache.
     */
    static async new(session: Session): Promise<RowList<any>> {
        return await sql`INSERT INTO sessions (uuid, session_id, expires)
                         VALUES (${session.uuid}, ${session.session_id}, ${session.expires})
                         ON CONFLICT (uuid) DO UPDATE
                             SET session_id = $2,
                                 expires    = $3`
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
        return await sql`SELECT *
                         FROM sessions
                         WHERE session_id = ${session_id}`
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
        await sql`UPDATE sessions
                  SET expires = ${expires}
                  WHERE session_id = ${session_id}`
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
        await sql`DELETE
                  FROM sessions
                  WHERE session_id = ${session_id}`
            .catch(error => {
                console.error(`Failed to invalidate session with id '${session_id}'. Error: ${error}`);
                return false;
            });
    }
}

export default {Inventories, Categories, Items, Users, Sessions};