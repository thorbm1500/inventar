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

export const defaultInventorySettings: Settings = {
    type: 'inventory',
    settings: [
        {
            type: 'text',
            value: null,
            title: 'UUID',
            readonly: true
        },
        {
            type: 'text',
            value: null,
            title: 'Name',
            readonly: false
        },
        {
            type: 'textarea',
            value: null,
            title: 'Description',
            readonly: false
        },
        {
            type: 'toggle',
            value: false,
            title: 'Hide Empty Descriptions',
            subtitle: 'Hides all empty descriptions, when browsing the contents of the inventory, instead of displaying <i>"No description has been set."</i>',
            readonly: false
        }]
}