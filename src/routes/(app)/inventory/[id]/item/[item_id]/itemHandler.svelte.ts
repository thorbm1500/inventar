import type {Item} from "$lib/server/db/components/item";
import {getItems, getTotalItemCount} from "../../data.remote";
import {Filters, type FilterType} from "../../FilterHandler.svelte";

export class ItemHandler {

    private readonly uuid: string;
    private readonly settings: Function;
    readonly filters: Filters | undefined = undefined;

    page: number = $state(1);

    paginationItems: Map<number, Item[]> = $state.raw(new Map<number, Item[]>());
    currentItems: Item[] = $derived(this.paginationItems.get(this.page) ?? []);
    totalItemAmount: number = $state(-1);

    maxPages: number = $derived(this.filters ? Math.max(1, Math.ceil(this.totalItemAmount / this.filters.rowAmount)) : 1);
    isFirstPage: boolean = $derived(this.page === 1);
    isLastPage: boolean = $derived(this.page === this.maxPages);

    currentItemOffset: number = $derived(this.filters ? this.filters.rowAmount * (this.page - 1) : 0);
    previousPageItemOffset: number = $derived(this.filters ? this.filters.rowAmount * (this.page - 2) : -15);
    nextPageItemOffset: number = $derived(this.filters ? this.filters.rowAmount * (this.page) : 15);

    initialLoad: boolean = $state(false);
    isLoaded: boolean = $derived(this.initialLoad && this.totalItemAmount > -1);
    isEmpty: boolean = $derived(this.isLoaded && this.totalItemAmount === 0);
    partialFill: boolean = $derived(this.isLoaded && this.filters !== undefined && this.currentItems.length % this.filters?.rowAmount !== 0);

    constructor(uuid: string, settings: Function) {
        this.uuid = uuid;
        this.settings = settings;
        this.filters = new Filters(this.settings);
    }

    async init(): Promise<void> {
        this.totalItemAmount = await getTotalItemCount(this.uuid);
    }

    previousPage(): void {
        if (this.isFirstPage) return;
        this.page -= 1;

        // noinspection JSIgnoredPromiseFromCall
        this.refreshPage();
    }

    nextPage(): void {
        if (this.isLastPage) return;
        this.page += 1;

        // noinspection JSIgnoredPromiseFromCall
        this.refreshPage();
    }

    firstPage(): void {
        if (this.isFirstPage) return;
        this.page = 1;

        // noinspection JSIgnoredPromiseFromCall
        this.refreshPage();
    }

    lastPage(): void {
        if (this.isLastPage) return;
        this.page = this.maxPages;

        // noinspection JSIgnoredPromiseFromCall
        this.refreshPage();
    }

    async refreshPage(purge: boolean = false): Promise<void> {
        if (!this.filters) return;

        if (purge) this.paginationItems.clear();

        if (!this.paginationItems.has(this.page)) {
            let items = await getItems({inventory: this.uuid, amount: this.filters.rowAmount, order: this.filters.order, order_by: this.filters.current, offset: this.currentItemOffset})
            if (items.length !== 0) {
                this.paginationItems.set(this.page, items);
            }
        }

        if (!this.isLastPage && !this.paginationItems.has(this.page + 1)) {
            let items = await getItems({inventory: this.uuid, amount: this.filters.rowAmount, order: this.filters.order, order_by: this.filters.current, offset: this.nextPageItemOffset})
            if (items.length !== 0) {
                this.paginationItems.set(this.page + 1, items);
            }
        }

        if (!this.isFirstPage && !this.paginationItems.has(this.page - 1)) {
            let items = await getItems({inventory: this.uuid, amount: this.filters.rowAmount, order: this.filters.order, order_by: this.filters.current, offset: this.previousPageItemOffset})
            if (items.length !== 0) {
                this.paginationItems.set(this.page - 1, items);
            }
        }

        this.paginationItems = structuredClone(this.paginationItems);
        this.initialLoad = true;
    }

    async updateFilterOrder(value: FilterType): Promise<void> {
        this.filters?.update(value);
        await this.refreshPage(true);
    }
}