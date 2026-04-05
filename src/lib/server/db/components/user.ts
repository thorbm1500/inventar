/**
 * User interface, to easily handle user data. The User interface should never contain or be able to contain any sensitive data.
 */
export interface User {
    uuid: string,
    email: string,
    username: string,
    profile_picture?: string,
    created_at: number,
    superuser: boolean
}

export interface UserSettings {
    uuid: string,
    primary_inventory?: string | null,
    theme: 'dark' | 'light',
    default_order_by: string,
    default_ordering: 'asc' | 'desc'
}