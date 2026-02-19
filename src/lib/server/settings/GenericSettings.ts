import type {Setting} from "$lib/settings";

declare interface UnsavedSetting {
    initialValue: string | boolean | null,
    currentValue: string | boolean
}

export class GenericSettings {

    readonly uuid: string;
    settings: Setting[] = [];
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

    load(): void {
        throw new Error(`[GenericSettings] Loading has not been implemented by child class.`);
    }

    save(): void {
        throw new Error(`[GenericSettings] Saving has not been implemented by child class.`);
    }
}