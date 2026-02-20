import type {Setting} from "$lib/settings";

declare interface UnsavedSetting {
    initialValue: string | boolean | null,
    currentValue: string | boolean
}

export class GenericSettings {

    readonly uuid: string;
    settings: Setting[] = [];
    categories: Map<string,Map<string,string[]>> = new Map();
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

    isLoaded(): void {
        //todo - Implement
    }

    load(settings: Setting[]): void {
        //todo: optimize
        this.categories.clear();
        this.settings = settings;

        for(const setting of settings) {
            if (!this.categories.has(setting.category)) this.categories.set(setting.category,new Map());
            if (!this.categories.get(setting.category)?.has(setting.subcategory)) this.categories.get(setting.category)?.set(setting.subcategory, []);
        }
    }

    save(): void {
        throw new Error(`[GenericSettings] Saving has not been implemented by child class.`);
    }
}