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