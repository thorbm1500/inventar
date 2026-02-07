import * as db from '$lib/server/db/database';

export interface InventoryInterface {
    inventory_uuid: string,
    name: string,
    description: string | null,
    image_path: string | null,
    item_amount: number,
    last_update: Date | string
}

/**
 * Wrapper class for all Inventory related actions.
 * Made to allow for cleaner database code.
 */
class Inventory {

}

export default { inventory };