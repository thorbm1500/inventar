const mockSettingList: Setting[] = [
    {
        type: 'text',
        value: '?',
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
    }];

const mockSubCategoryGeneral: SettingSubCategory[] = [{
    name: 'General',
    settings: mockSettingList
}]

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
    value: string | null,
    title: string,
    subtitle?: string,
    readonly: boolean
}

export const mockSettings: GenericSettings = {
    type: SettingType.INVENTORY,
    settingCategories: [
        {
            name: 'General',
            SettingSubCategories: mockSubCategoryGeneral,
            superUserRequired: true,
        },
        {
            name: 'Customization',
            SettingSubCategories: mockSubCategoryGeneral,
            superUserRequired: true,
        }]
};