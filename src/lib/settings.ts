/**
 * @property type Parent of the settings.
 * @property settings A list of Setting containing all settings.
 * @see Setting
 */
export interface Settings {
    /**
     * @example
     * type: 'inventory' | 'user'
     */
    type: string,
    settings: Setting[]
}

export interface Setting {
    category: string,
    subcategory: string,
    type: string,
    value: string | boolean | null,
    title: string,
    subtitle?: string,
    readonly: boolean
}