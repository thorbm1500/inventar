export const settings = {
    config_dir: '/etc/inventar',
    data_dir: '/var/inventar/'
}

/**
 * Returns the inventory's directory with a trailing slash.
 * @param uuid UUID of the inventory.
 * @param concat Strings to concat to the path before returning it.
 * @return string Path of inventory directory.
 */
export function getInventoryDirectory(uuid: string, concat?: string[]): string {
    return settings.data_dir.concat(uuid,'/',concat ? concat.join('/') : '');
}