export interface Setting {
    category: string,
    subcategory: string,
    type: string,
    value: string | boolean | null,
    title: string,
    subtitle?: string,
    readonly: boolean,
    category_order: number,
    subcategory_order: number,
    setting_order: number
}

declare interface UnsavedSetting {
    initialValue: string | boolean | null,
    currentValue: string | boolean
}

export class GenericSettingsSvelte {

    readonly uuid: string;
    settings: Map<string, Map<string, Setting[]>> = new Map([['UNLOADED', new Map()]]);
    unsavedSettings: Map<Setting, UnsavedSetting> = new Map();

    constructor(uuid: string) {
        this.uuid = uuid;
    }

    updateSetting(setting: Setting, value: string | boolean): void {
        let unsaved: UnsavedSetting;
        if (this.unsavedSettings.has(setting)) {
            unsaved = this.unsavedSettings.get(setting) as UnsavedSetting;
        } else {
            unsaved = {
                initialValue: setting.value,
                currentValue: value
            };
        }

        unsaved.currentValue = value;

        if (unsaved.currentValue === unsaved.initialValue) {
            this.unsavedSettings.delete(setting);
            return;
        } else this.unsavedSettings.set(setting, unsaved);
    }

    hasUnsaved(): boolean {
        return this.unsavedSettings.size !== 0;
    }

    isLoaded(): boolean {
        return this.settings.has('UNLOADED');
    }

    load(categories: { category: string, category_order: string | number }[], all_categories: {
        category: string,
        category_order: string | number,
        subcategory: string,
        subcategory_order: string | number
    }[], settings: Setting[]): void {
        //todo: optimize
        this.settings.clear();

        for (const category of categories) {
            this.settings.set(category.category, new Map());
        }

        for (const category of all_categories) {
            this.settings.get(category.category)?.set(category.subcategory, settings.filter((st): boolean => st.category === category.category && st.subcategory === category.subcategory));
        }
    }

    save(): void {
        throw new Error(`[GenericSettings] Saving has not been implemented by child class.`);
    }
}