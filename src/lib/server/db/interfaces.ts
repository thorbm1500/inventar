import type {Label} from "$lib/server/db/components/labels";

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

export type PageTheme = 'light' | 'dark';

/**
 * User interface, to easily handle user data. The User interface should never contain or be able to contain any sensitive data.
 */
export interface User {
    uuid: string,
    email: string,
    username: string,
    profile_picture?: string,
    primary_inventory?: string,
    preferred_theme: PageTheme,
    created_at: number,
    superuser: boolean
}

export interface UserSettings {
    uuid: string,
    preferred_theme: PageTheme,
    primary_inventory: string | undefined,
    preferred_order_by: string,
    preferred_ordering: string
}

export interface Session {
    uuid: string,
    session_id: string,
    expires: string | number,
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