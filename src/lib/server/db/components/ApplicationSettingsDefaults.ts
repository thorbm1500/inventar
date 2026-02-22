import {v7 as uuidv7} from 'uuid';
import {generateRegistrationToken} from "$lib/server/internal/auth";

export interface ApplicationSetting {
    category: string,
    subcategory: string,
    setting: string,
    text_value: string | null,
    textarea_value: string | null,
    toggle_value: boolean
}

export type ApplicationSettings = Map<string,Map<string,Map<string,ApplicationSetting>>>;

export const emptyApplicationSettingsObj: ApplicationSettings = new Map<string,Map<string,Map<string,ApplicationSetting>>>([
    ["general", new Map<string,Map<string,ApplicationSetting>>([
        ["basics", new Map<string,ApplicationSetting>],
        ["mail", new Map<string,ApplicationSetting>],
    ])],
    ["security", new Map<string,Map<string,ApplicationSetting>>([
        ["general", new Map<string,ApplicationSetting>],
        ["accounts", new Map<string,ApplicationSetting>],
        ["privacy", new Map<string,ApplicationSetting>],
        ["api", new Map<string,ApplicationSetting>],
    ])],
    ["system", new Map<string,Map<string,ApplicationSetting>>([
        ["tasks", new Map<string,ApplicationSetting>],
        ["audit", new Map<string,ApplicationSetting>],
        ["logs", new Map<string,ApplicationSetting>],
    ])],
    ["other", new Map<string,Map<string,ApplicationSetting>>([
        ["feedback", new Map<string,ApplicationSetting>],
        ["faq", new Map<string,ApplicationSetting>],
        ["about", new Map<string,ApplicationSetting>],
    ])]
]);

export const defaultSettings: ApplicationSetting[] = [
    {
        category: 'general',
        subcategory: 'basics',
        setting: 'application_id',
        text_value: uuidv7(),
        textarea_value: null,
        toggle_value: false
    },
    {
        category: 'general',
        subcategory: 'basics',
        setting: 'data_dir',
        text_value: '/var/inventar',
        textarea_value: null,
        toggle_value: false
    },
    {
        category: 'general',
        subcategory: 'basics',
        setting: 'logs_dir',
        text_value: '/var/logs/inventar',
        textarea_value: null,
        toggle_value: false
    },
    {
        category: 'general',
        subcategory: 'mail',
        setting: 'host',
        text_value: null,
        textarea_value: null,
        toggle_value: false
    },
    {
        category: 'general',
        subcategory: 'mail',
        setting: 'port',
        text_value: '587',
        textarea_value: null,
        toggle_value: false
    },
    {
        category: 'general',
        subcategory: 'mail',
        setting: 'user',
        text_value: null,
        textarea_value: null,
        toggle_value: false
    },
    {
        category: 'general',
        subcategory: 'mail',
        setting: 'password',
        text_value: null,
        textarea_value: null,
        toggle_value: false
    },
    {
        category: 'general',
        subcategory: 'mail',
        setting: 'sender_mail',
        text_value: null,
        textarea_value: null,
        toggle_value: false
    },
    {
        category: 'general',
        subcategory: 'mail',
        setting: 'sender_name',
        text_value: null,
        textarea_value: null,
        toggle_value: false
    },
    {
        category: 'security',
        subcategory: 'general',
        setting: 'allow_registration',
        text_value: null,
        textarea_value: null,
        toggle_value: true
    },
    {
        category: 'security',
        subcategory: 'general',
        setting: 'require_token',
        text_value: null,
        textarea_value: null,
        toggle_value: true
    },
    {
        category: 'security',
        subcategory: 'general',
        setting: 'registration_token',
        text_value: generateRegistrationToken(),
        textarea_value: null,
        toggle_value: false
    },
    {
        category: 'security',
        subcategory: 'privacy',
        setting: 'daily_usage_ping',
        text_value: null,
        textarea_value: null,
        toggle_value: true
    }
];