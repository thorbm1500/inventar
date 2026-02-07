import * as db from '$lib/server/db/database';

export interface ItemInterface {
    inventory_uuid: string,
    item_uuid: string,
    name: string,
    description: string | null,
    amount: number,
    thumbnail_path: string | null,
    url: string | null,
    price: number,
    currency_code: string,
    created_at: Date | string,
    last_modified: Date | string
}

/**
 * Wrapper class for all Item related actions.
 * Made to allow for cleaner database code.
 */
class Item {

}

export default { Item };