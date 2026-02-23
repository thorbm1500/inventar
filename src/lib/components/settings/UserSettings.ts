import {GenericSettingsSvelte} from "$lib/components/settings/GenericSettings.svelte";

export class UserSettings extends GenericSettingsSvelte {

    constructor(uuid: string) {
        super(uuid);
    }

    save(): void {

    }
}