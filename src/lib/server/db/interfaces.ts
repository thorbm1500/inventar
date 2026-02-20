export interface Currency {
    id: string,
    code: string,
    symbol?: string | null
}

export interface Inventory {
    uuid: string,
    owner: string,
    name: string,
    description?: string,
    item_amount: number,
    labels: Label[],
    last_update: number,
    created_at: number
}

export interface userInventoryPermissions {
    inventory: string,
    user_uuid: string,
    edit_inventory: boolean,
    delete_inventory: boolean,
    view_items: boolean,
    create_items: boolean,
    edit_items: boolean,
    delete_items: boolean,
    view_users: boolean,
    add_users: boolean,
    edit_users: boolean,
    remove_users: boolean,
    view_audit: boolean
}

export interface Label {
    inventory: string,
    uuid: string,
    name: string,
    color_id: 1,
    colors: LabelColors | undefined
}

export interface LabelColors {
    id: number,
    border: string,
    background: string,
    dark_border: string,
    dark_background: string
}

export interface Item {
    inventory: string,
    uuid: string,
    name: string,
    description?: string,
    amount: number,
    image?: string,
    url?: string,
    price: number,
    currency: string | null,
    currency_format: string,
    labels: Label[],
    last_update: number,
    created_at: number,
    created_by: string
}

/**
 * User interface, to easily handle user data. The User interface should never contain or be able to contain any sensitive data.
 */
export interface User {
    uuid: string,
    email: string,
    username: string,
    profile_picture?: string,
    primary_inventory?: string,
    last_login: number,
    created_at: number,
    superuser: boolean
}

export interface Session {
    uuid: string,
    session_id: string,
    expires: number,
    ip?: string,
    continent?: string,
    country?: string,
    region?: string,
    city?: string,
    device?: string,
    platform?: string
    last_accessed?: number
    created_at?: number
}

export interface ResetRequest {
    uuid: string,
    token: string,
    expires: number
}