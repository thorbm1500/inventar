import {query} from '$app/server';
import * as db from '$lib/server/db/database'
import {error} from '@sveltejs/kit';
import * as v from 'valibot';

export const getInventory = query(v.string(), async (id: string) => {
    const result = await db.Inventories.fetch(id);
    if (!result) error(500, "Failed to fetch inventory.");

    return {
        'inventory_uuid': result[0]['inventory_uuid'] ?? 'UuidUndefined',
        'inventory_name': result[0]['name'] ?? 'NameUndefined',
        'inventory_description': result[0]['description'] ?? undefined,
        'inventory_image': result[0]['image'] ?? undefined,
        'inventory_primary': result[0]['primary'] ?? false
    };
});