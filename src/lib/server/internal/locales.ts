import {APPLICATION_SETTINGS} from "../../../hooks.server";

export type LocaleType = 'English' | 'Danish';

export interface ApplicationLocale {
    locale: string,
    generics: {
        see: string,
        sort_by: string,
        view: string,
        optional: string,
        unsaved_changes: string,
        saving_changes: string,
        changes_saved: string,
        save: string,
        create: string,
        loading: string,
        coming_soon: string,
        no_description_set: string,
        browser_offline: string,
        name: string,
        part_number_short: string,
        updated: string,
        price: string,
        amount: string
    },
    errors: {
        generic: string
    }
    header: {
        home: string,
        browse: string,
        inventory: string,
        projects: string,
        settings: string
    }
    browse: {
        add_inventory: string,
        no_inventory: string,
        create_first_inventory: string,
        no_internet: string
    },
    inventory: {
        no_bookmark: string,
        no_bookmark_tip_a: string,
        no_bookmark_tip_b: string,
        new: {
            title: string,
            form_inventory_name: string,
            form_inventory_description: string,
            form_inventory_icon: string
        },
        id: {
            filters: string,
            add_item: string,
            no_internet: string,
            create_first_item: string,
            item_creator: {
                name_placeholder: string,
                open_creator: string,
                quick_add: string
            }
        }
    },
    settings: {
        general: {
            title: string,
            basics: {
                title: string,
                application_id: string,
                application_id_description: string,
                data_directory: string,
                logs_directory: string,
                log_level: string
            },
            mail: {
                title: string,
                subtitle: string,
                host: string,
                port: string,
                port_description: string,
                user: string,
                password: string,
                sender_mail: string,
                sender_name: string
            }
        },
        security: {
            title: string,
            general: {
                title: string,
                allow_registration: string,
                allow_registration_description: string,
                require_registration_token: string,
                require_registration_token_description: string,
                registration_token: string,
                registration_token_description: string,
                registration_token_regeneration: string
            },
            accounts: {
                title: string
            },
            privacy: {
                title: string,
                subtitle_a: string,
                subtitle_b: string,
                subtitle_c: string,
                enable_telemetry: string,
                enable_telemetry_description: string,
                instance_identifier: string,
                instance_identifier_description_a: string,
                instance_identifier_description_b: string,
                telemetry_options: string,
                telemetry_options_country: string,
                telemetry_options_region: string,
                telemetry_options_inventories: string,
                telemetry_options_unique_items: string,
                telemetry_options_total_items: string,
                request_removal: string,
                request_removal_description_a: string,
                request_removal_description_b: string,
                request_removal_limit: string,
                request_removal_submit: string
            },
            api: {
                title: string
            }
        }
        system: {
            title: string,
            audit_logs: {
                title: string
            },
            logs: {
                title: string
            },
            tasks: {
                title: string
            }
        },
        other: {
            title: string,
            feedback: {
                title: string
            },
            faq: {
                title: string
            },
            about: {
                title: string
            }
        }
    }
}

export async function getCurrentLocale(): Promise<ApplicationLocale> {
    return await Bun.file(`src/lib/locales/${APPLICATION_SETTINGS.general.basics.language}.json5`).text().then(res => Bun.JSON5.parse(res)) as ApplicationLocale
}