import postgres, {type RowList} from 'postgres';
import {env} from "$env/dynamic/private";

export const sql = postgres({
    host: env.DB_HOST,
    port: Number.parseInt(env.DB_PORT ?? 'NONE'),
    database: env.DB_DATABASE,
    username: env.DB_USER,
    password: env.DB_PASSWORD
});

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
                console.log(`Failed to delete inventory with UUID '${uuid}'. Error: ${error}`);
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
                console.log(`Failed to rename inventory with UUID '${uuid}' to '${name}'. Error: ${error}`);
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
                console.log(`Failed to update the description of inventory with UUID '${uuid}' to '${description}'. Error: ${error}`);
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
                console.log(`Failed to updated image of inventory with UUID '${uuid}' to '${path}'. Error: ${error}`);
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
                console.log(`Failed to remove the description of inventory with UUID '${uuid}'. Error: ${error}`);
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
                console.log(`Failed to remove the image of inventory with UUID '${uuid}'. Error: ${error}`);
                return false;
            })
    }

    static async fetchAll(): Promise<RowList<any>> {
        return await Utility.query(`SELECT *
                                    FROM inventories`, [])
            .then(result => {
                return result;
            })
            .catch(error => {
                console.log(`Failed to fetch all inventories. Error: ${error}`);
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
                console.log(`Failed to delete category with UUID '${uuid}'. Error: ${error}`);
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
                console.log(`Failed to rename category with UUID '${uuid}' to '${name}'. Error: ${error}`);
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
                console.log(`Failed to update the description of category with UUID '${uuid}' to '${description}'. Error: ${error}`);
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
                console.log(`Failed to fetch all categories. Error: ${error}`);
                return undefined;
            })
    }
}

export class Items {
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
                console.log(`Failed to delete item with UUID '${uuid}'. Error: ${error}`);
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
                console.log(`Failed to rename item with UUID '${uuid}' to '${name}'. Error: ${error}`);
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
                console.log(`Failed to update the description of item with UUID '${uuid}' to '${description}'. Error: ${error}`);
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
                console.log(`Failed to update the amount of item with UUID '${uuid}' to '${amount.toString()}'. Error: ${error}`);
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
                console.log(`Failed to update the price of item with UUID '${uuid}' to '${amount.toString()}'. Error: ${error}`);
                return false;
            })
    }

    //todo: Update thumbnail
    //todo: Change url
    //todo: Change currency
    //todo: Change reserved amount
    //todo: Update pending amount
}