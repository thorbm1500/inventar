const enum SettingType {
    INVENTORY,
    ACCOUNT
}

export interface GenericSettings {
    type: SettingType,
    settingCategories: SettingCategory[]
}

export interface SettingCategory {
    name: string,
    SettingSubCategories: SettingSubCategory[],
    superUserRequired: boolean
}

export interface SettingSubCategory {
    name: string,
    settings: Setting[]
}

export interface Setting {
    type: string,
    value: string | boolean | null,
    title: string,
    subtitle?: string,
    readonly: boolean
}

export const mockSettings: GenericSettings = {
    type: SettingType.INVENTORY,
    settingCategories: [
        {
            name: 'General',
            SettingSubCategories: [{
                name: 'General',
                settings: [
                    {
                        type: 'text',
                        value: '03885557-0a94-11f1-9199-1eb353fe8132',
                        title: 'UUID',
                        readonly: true
                    },
                    {
                        type: 'text',
                        value: 'Spare Parts',
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
                    },
                    {
                        type: 'text',
                        value: 'Mock',
                        title: 'Mock',
                        subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin hendrerit urna non enim gravida, id rhoncus nibh placerat. In varius ligula lacinia, laoreet eros in, tempor lacus.',
                        readonly: false
                    },
                    {
                        type: 'text',
                        value: 'Mock',
                        title: 'Mock',
                        readonly: false
                    },
                    {
                        type: 'text',
                        value: 'Mock',
                        title: 'Mock',
                        readonly: false
                    },
                    {
                        type: 'text',
                        value: 'Mock',
                        title: 'Mock',
                        readonly: false
                    },
                    {
                        type: 'text',
                        value: 'Mock',
                        title: 'Mock',
                        readonly: false
                    },
                    {
                        type: 'text',
                        value: 'Mock',
                        title: 'Mock',
                        readonly: false
                    }]
            }],
            superUserRequired: true,
        },
        {
            name: 'Customization',
            SettingSubCategories: [{
                name: 'General',
                settings: [
                    {
                        type: 'text',
                        value: 'Spare Parts',
                        title: 'Name',
                        readonly: false
                    },
                    {
                        type: 'textarea',
                        value: null,
                        title: 'Description',
                        readonly: false
                    }]
            }],
            superUserRequired: true,
        }]
};