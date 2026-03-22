import type {Item} from "$lib/server/db/components/item";
import {getItems, getTotalItemCount} from "../../data.remote";
import {Filters, type FilterType} from "../../FilterHandler.svelte";

export class ItemHandler {

    private readonly uuid: string;
    private readonly user: string;
    readonly filters: Filters = new Filters();

    page: number = $state(1);

    paginationItems: Map<number, Item[]> = $state.raw(new Map<number, Item[]>());
    currentItems: Item[] = $derived(this.paginationItems.get(this.page) ?? []);
    totalItemAmount: number = $state(0);

    maxPages: number = $derived(Math.max(1, Math.ceil(this.totalItemAmount / this.filters.rowAmount)));
    isFirstPage: boolean = $derived(this.page === 1);
    isLastPage: boolean = $derived(this.page === this.maxPages);

    currentItemOffset: number = $derived(this.filters.rowAmount * (this.page - 1));
    previousPageItemOffset: number = $derived(this.filters.rowAmount * (this.page - 2));
    nextPageItemOffset: number = $derived(this.filters.rowAmount * (this.page));

    isLoaded: boolean = $derived(this.totalItemAmount > 0 && this.paginationItems.size > 0);

    constructor(uuid: string, user: string) {
        this.uuid = uuid;
        this.user = user;
    }

    async init(): Promise<void> {
        await this.filters.init(this.user);
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
    }

    async updateFilterOrder(value: FilterType): Promise<void> {
        this.filters.update(value);
        await this.refreshPage(true);
    }
}