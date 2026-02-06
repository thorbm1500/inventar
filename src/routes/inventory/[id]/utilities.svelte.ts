class FilterSettings {

    COLUMN_SIZE_DEFAULT = 15;
    PRICE_DEFAULT = true;
    LAST_UPDATED_DEFAULT = true;
    DESCRIPTION_DEFAULT = true;
    ROW_HEIGHT_DEFAULT = 70;

    columnSize: number = $state(this.COLUMN_SIZE_DEFAULT);
    price: boolean = $state(this.PRICE_DEFAULT);
    lastUpdated: boolean = $state(this.LAST_UPDATED_DEFAULT);
    description: boolean = $state(this.DESCRIPTION_DEFAULT);
    rowHeight: number = $state(this.ROW_HEIGHT_DEFAULT);

    savedSettings = $state.raw(this._refreshSavedSettings());

    unsavedChanges = $derived(this.columnSize !== this.savedSettings.columnSize
        || this.price !== this.savedSettings.price
        || this.lastUpdated !== this.savedSettings.lastUpdated
        || this.description !== this.savedSettings.description
        || this.rowHeight !== this.savedSettings.rowHeight);

    load(other: FilterSettings): void {
        this.columnSize = other.columnSize;
        this.price = other.price;
        this.lastUpdated = other.lastUpdated;
        this.description = other.description;
        this.rowHeight = other.rowHeight;

        this.savedSettings = this._refreshSavedSettings();
    }

    save(): void {
        //todo: Implement
        //save settings to database.
        this.savedSettings = this._refreshSavedSettings();
    }

    clear(): void {
        this.columnSize = this.COLUMN_SIZE_DEFAULT;
        this.price = this.PRICE_DEFAULT;
        this.lastUpdated = this.LAST_UPDATED_DEFAULT;
        this.description = this.DESCRIPTION_DEFAULT;
        this.rowHeight = this.ROW_HEIGHT_DEFAULT;
    }

    _refreshSavedSettings() {
        return {
            columnSize: this.columnSize,
            price: this.price,
            lastUpdated: this.lastUpdated,
            description: this.description,
            rowHeight: this.rowHeight
        };
    }
}

export default FilterSettings;