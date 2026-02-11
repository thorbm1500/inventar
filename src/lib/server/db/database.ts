import {env} from "$env/dynamic/private";
import postgres, {type Row, type RowList} from 'postgres';
import type {Currency, Session, ResetRequest} from "$lib/server/db/schema";

export const sql = postgres({
    host: env.DB_HOST,
    port: Number.parseInt(env.DB_PORT ?? '0'),
    database: env.DB_DATABASE,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    onnotice: notice => {
    }
});

export interface DatabaseResult {
    success: boolean,
    result?: any,
    rawResult?: RowList<Row[]> | Row,
    message?: string
}

export async function getCurrencies(): Promise<DatabaseResult> {
    return await sql`SELECT *
                     FROM currencies`
        .then(result => {
            const currencyList: Currency[] = [];
            result.forEach(res => currencyList.push(res as Currency));
            return {success: true, result: currencyList, rawResult: result};
        })
        .catch(error => {
            console.error(`Failed to fetch currencies. Error: ${error}`);
            return {success: false, message: `Failed to fetch currencies. Error: ${error}`};
        })
}

export class Inventories {
    /**
     * Creates a new inventory.
     * @param owner UUID of the account that is creating the inventory.
     * @param name The inventory's name.
     * @param description The inventory's description, if any.
     * @return The UUID of the new inventory, or undefined if any errors occurred.
     */
    static async create(owner: string, name: string, description?: string): Promise<DatabaseResult> {
        return await sql`INSERT INTO inventories(owner,name,description)
                         VALUES (${owner},${name},${description ?? null })
                         RETURNING uuid`
            .then(result => {
                const [res] = result;
                return {success:true, result: res.uuid ?? 'NONE', rawResult: res};
            }).catch((error) => {
                console.error(`Failed to create inventory '${name}'. Error: ${error}`);
                return {success:false, message: `Failed to create inventory '${name}'. Error: ${error}`}
            });
    }

    static async fetch(amount: number = 6, order_by: string, order: string, offset: number = 0): Promise<DatabaseResult> {
        return await sql`SELECT *
                         FROM inventories ${order_by === '' ? `` : sql`ORDER BY
                         ${sql(order_by)}
                         ${order === 'ASC' ? sql`ASC` : sql`DESC`}`}
                         LIMIT ${amount} OFFSET ${offset}`
            .then(result => {
                return {success:true, result: result, rawResult: result};
            })
            .catch(error => {
                console.error(`Failed to fetch items. Error: ${error}`);
                return {success:false, message: `Failed to fetch items. Error: ${error}`};
            });
    }

    static async fetchTotalInventoryCount(): Promise<DatabaseResult> {
        return await sql`SELECT COUNT(uuid) AS amount
                         FROM inventories`
            .then(result => {
                const [res] = result;
                return {success:true,result: res.amount ?? 0,rawResult: result};
            })
            .catch(error => {
                console.error(`Failed to fetch total inventory count. Error: ${error}`);
                return {success:false,message:`Failed to fetch total inventory count. Error: ${error}`};
            })
    }

    static async fetchInventoryByUuid(uuid: string): Promise<DatabaseResult> {
        return await sql`SELECT *
                         FROM inventories
                         WHERE uuid = ${uuid}`
            .then(result => {
                const [res] = result;
                return {success:true,result:res,rawResult:result};
            })
            .catch(error => {
                console.error(`Failed to fetch inventory with UUID '${uuid}'. Error: ${error}`);
                return {success:false,message:`Failed to fetch inventory with UUID '${uuid}'. Error: ${error}`};
            })
    }
}

export class Categories {
    static async create(name: string, description?: string): Promise<DatabaseResult> {
        return await sql`INSERT INTO categories (name${description ? description : ``})
                         VALUES (${name}${description ? `,${description}` : ``})
                         ON CONFLICT DO NOTHING
                         RETURNING uuid`
            .then(result => {
                const [res] = result;
                const id = res.uuid ?? 'NONE';
                console.log(`Inventory '${name}' has been created, and has received ID '${id}'`);
                return {success:true,result:id,rawResult:result};
            }).catch((error) => {
                console.error(`Failed to create inventory '${name}'. Error: ${error}`);
                return {success:false,message:`Failed to create inventory '${name}'. Error: ${error}`};
            });
    }
}

export class Items {
    /* todo Add categories to itemCategories table */
    static async create(inventory: string, name: string, description?: string, amount: number = 0, categories: [] = [], image?: string,
                        url?: string, price: number = 0, currency: string = 'DKK'): Promise<DatabaseResult> {
        const item = {
            inventory: inventory,
            name: name,
            description: description ?? null,
            amount: amount,
            image: image ?? null,
            url: url ?? null,
            price: price,
            currency: currency,
        }

        return await sql`INSERT INTO items ${sql(item)}
                         ON CONFLICT DO NOTHING
                         RETURNING uuid`
            .then(result => {
                const [res] = result;
                const id = res.uuid ?? 'NONE';
                console.log(`Item '${name}' has been created, and has received ID '${id}'`);
                return {success:true,result:id,rawResult:result};
            }).catch((error) => {
                console.error(`Failed to create item '${name}'. Error: ${error}`);
                return {success:false,message:`Failed to create item '${name}'. Error: ${error}`};
            });
    }

    static async fetch(inventory: string, amount: number = 15, order_by: string, order: string, offset: number = 0): Promise<DatabaseResult> {
        return await sql`select *
                         from items
                         where inventory = ${inventory}
                             ${order_by === '' ? `` : sql`order by ${sql(order_by)}
                             ${order === 'ASC' ? sql`ASC` : sql`DESC`}`}
                         LIMIT ${amount} OFFSET ${offset}`
            .then(result => {
                return {success:true,result:result,rawResult:result};
            })
            .catch(error => {
                console.error(`Failed to fetch items. Error: ${error}`);
                return {success:false,message:`Failed to fetch items. Error: ${error}`};
            });
    }

    static async fetchTotalItemCount(inventory: string): Promise<DatabaseResult> {
        return await sql`SELECT COUNT(uuid) AS amount
                         FROM items
                         WHERE inventory = ${inventory}`
            .then(result => {
                const [res] = result;
                return {success:true,result:res.amount??0,rawResult:result};
            })
            .catch(error => {
                console.error(`Failed to fetch total item count. Error: ${error}`);
                return {success:false,message:`Failed to fetch total item count. Error: ${error}`};
            })
    }

    static async deleteItem(uuid: string): Promise<DatabaseResult> {
        return await sql`DELETE FROM items
                         WHERE uuid = ${uuid}`
            .then(result => {
                const [res] = result;
                return {success:true,result:res,rawResult:result};
            })
            .catch(error => {
                console.error(`Failed to fetch total item count. Error: ${error}`);
                return {success:false,message:`Failed to fetch total item count. Error: ${error}`};
            })
    }
}

export class Users {
    /**
     * Creates a new user in the database, and returns the new user's uuid.
     * @param email The user's email.
     * @param username The user's username.
     * @param password_hash A hashed version of the user's password.
     * @param superuser If the user should have administrator rights.
     */
    static async create(email: string, username: string, password_hash: string, superuser: boolean = false): Promise<DatabaseResult> {
        return await sql`INSERT INTO users (email, username, password_hash, superuser)
                         VALUES (${email}, ${username}, ${password_hash}, ${superuser})
                         RETURNING uuid`
            .then(result => {
                const [res] = result;
                return {success:true,result:res.uuid??'NONE',rawResult:result};
            })
            .catch(error => {
                console.error(`Failed to create new user with username '${username}' and email '${email}'. Error: ${error}`);
                return {success:false,message:`Failed to create new user with username '${username}' and email '${email}'. Error: ${error}`};
            })
    }

    static async getFromUuid(uuid: string): Promise<DatabaseResult> {
        return await sql`SELECT *
                         FROM users
                         WHERE uuid = ${uuid}`
            .then(result => {
                const [res] = result;
                return {success:true,result:res,rawResult:result};
            })
            .catch(error => {
                console.error(`Failed to get user with uuid '${uuid}'. Error: ${error}`);
                return {success:false,message:`Failed to get user with uuid '${uuid}'. Error: ${error}`};
            })
    }

    static async getFromEmail(email: string): Promise<DatabaseResult> {
        return await sql`SELECT *
                         FROM users
                         WHERE email = ${email}`
            .then(result => {
                const [res] = result;
                return {success:true,result:res,rawResult:result};
            })
            .catch(error => {
                console.error(`Failed to get user with email '${email}'. Error: ${error}`);
                return {success:false,message:`Failed to get user with email '${email}'. Error: ${error}`};
            });
    }

    static async getPasswordHash(uuid: string): Promise<DatabaseResult> {
        return await sql`SELECT password_hash
                         FROM users
                         WHERE uuid = ${uuid}`
            .then(result => {
                const [res] = result;
                return {success:true,result:res.password_hash??'NONE',rawResult:result};
            })
            .catch(error => {
                console.error(`Failed to get password hash for user with uuid '${uuid}'. Error: ${error}`);
                return {success:false,message:`Failed to get password hash for user with uuid '${uuid}'. Error: ${error}`};
            });
    }

    static async setPasswordHash(uuid: string, passwordHash: string): Promise<DatabaseResult> {
        return await sql`UPDATE users
                         SET password_hash = ${passwordHash}
                         WHERE uuid = ${uuid}`
            .then(() => {
                return {success:true}
            })
            .catch(error => {
                console.error(`Failed to get password hash for user with uuid '${uuid}'. Error: ${error}`);
                return {success:false,message:`Failed to get password hash for user with uuid '${uuid}'. Error: ${error}`};
            });
    }

    static async updateLastLogin(uuid: string): Promise<DatabaseResult> {
        return await sql`UPDATE users
                         SET last_login = ${(Date.now() * 1000)}
                         WHERE uuid = ${uuid}`
            .then(() => {
                return {success:true}
            })
            .catch(error => {
                console.error(`Failed to update last login for user with uuid '${uuid}'. Error: ${error}`);
                return {success:false,message:`Failed to update last login for user with uuid '${uuid}'. Error: ${error}`};
            });
    }

    static async getUserAmount(): Promise<DatabaseResult> {
        return await sql`SELECT count(uuid) as amount
                         FROM users`
            .then(result => {
                const [res] = result;
                return {success:true,result:res.amount,rawResult:result};
            })
            .catch(error => {
                console.error(`Failed to get amount of users registered. Error: ${error}`);
                return {success:false,message:`Failed to get amount of users registered. Error: ${error}`};
            });
    }
}

export class Auth {
    /**
     * Creates a new session in the database.
     * @param session Session to cache.
     */
    static async newSession(session: Session): Promise<DatabaseResult> {
        return await sql`INSERT INTO sessions (uuid, session_id, expires)
                         VALUES (${session.uuid}, ${session.session_id}, ${session.expires})
                         ON CONFLICT (uuid) DO UPDATE
                             SET session_id = $2,
                                 expires    = $3`
            .then(() => {
                return {success:true};
            })
            .catch(error => {
                console.error(`Failed to create a new session for user with uuid '${session.uuid}' with id '${session.session_id}'. Error: ${error}`);
                return {success:false,message:`Failed to create a new session for user with uuid '${session.uuid}' with id '${session.session_id}'. Error: ${error}`};
            });
    }

    /**
     * Gets an existing session.
     * @param session_id Id of session to retrieve.
     */
    static async getSession(session_id: string): Promise<DatabaseResult> {
        return await sql`SELECT *
                         FROM sessions
                         WHERE session_id = ${session_id}`
            .then(result => {
                const [res] = result;
                return {success:true,result:{uuid: res?.uuid ?? null, session_id: res?.session_id ?? null, expires: res?.expires ?? null},rawResult:result};
            })
            .catch(error => {
                console.error(`Failed to retrieve session with id '${session_id}'. Error: ${error}`);
                return {success:false,message:`Failed to retrieve session with id '${session_id}'. Error: ${error}`};
            });
    }

    /**
     * Renews an existing session, preventing the user from having to log in again too fast.
     * @param session_id Id of session to renew.
     * @param expires New expiration date.
     */
    static async renewSession(session_id: string, expires: number): Promise<DatabaseResult> {
        return await sql`UPDATE sessions
                  SET expires = ${expires}
                  WHERE session_id = ${session_id}`
            .then(() => {
                return {success:true};
            })
            .catch(error => {
                console.error(`Failed to invalidate session with id '${session_id}'. Error: ${error}`);
                return {success:false,message:`Failed to invalidate session with id '${session_id}'. Error: ${error}`};
            });
    }

    /**
     * Invalidates the session, forcing the user to login again.
     * @param session_id Id of session to invalidate.
     */
    static async invalidateSession(session_id: string): Promise<DatabaseResult> {
        return await sql`DELETE
                  FROM sessions
                  WHERE session_id = ${session_id}`
            .then(() => {
                return {success:true};
            })
            .catch(error => {
                console.error(`Failed to invalidate session with id '${session_id}'. Error: ${error}`);
                return {success:false,message:`Failed to invalidate session with id '${session_id}'. Error: ${error}`};
            });
    }

    static async getResetToken(token: string): Promise<DatabaseResult> {
        return await sql`SELECT *
                         FROM reset_tokens
                         WHERE token = ${token}`
            .then(result => {
                const [res] = result;
                return {success:true,result:res as ResetRequest || undefined,rawResult: result};
            })
            .catch(error => {
                console.error(`Failed to get reset token '${token}'. Error: ${error}`);
                return {success:false,message:`Failed to get reset token '${token}'. Error: ${error}`};
            });
    }

    static async getResetTokenFromUuid(uuid: string): Promise<DatabaseResult> {
        return await sql`SELECT *
                         FROM reset_tokens
                         WHERE uuid = ${uuid}`
            .then(result => {
                const [res] = result;
                return {success:true,result:res as ResetRequest || undefined,rawResult:result};
            })
            .catch(error => {
                console.error(`Failed to get reset token of user '${uuid}'. Error: ${error}`);
                return {success:false,message:`Failed to get reset token of user '${uuid}'. Error: ${error}`};
            });
    }

    static async setResetToken(uuid: string, token: string, expires: number): Promise<DatabaseResult> {
        return await sql`INSERT INTO reset_tokens(uuid, token, expires)
                         VALUES (${uuid}, ${token}, ${expires})
                         ON CONFLICT (uuid) DO UPDATE
                             SET token   = $2,
                                 expires = $3`
            .then(() => {
                return {success:true}
            })
            .catch(error => {
                console.error(`Failed to set/update reset token for user with uuid '${uuid}'. Error: ${error}`);
                return {success:false,message:`Failed to set/update reset token for user with uuid '${uuid}'. Error: ${error}`};
            });
    }

    static async deleteResetToken(token: string): Promise<DatabaseResult> {
        return await sql`DELETE
                         FROM reset_tokens
                         WHERE token = ${token}`
            .then(() => {
                return {success:true};
            })
            .catch(error => {
                console.error(`Failed to delete reset token '${token}'. Error: ${error}`);
                return {success:false,message:`Failed to delete reset token '${token}'. Error: ${error}`};
            });
    }
}

export default {Inventories, Categories, Items, Users, Auth};