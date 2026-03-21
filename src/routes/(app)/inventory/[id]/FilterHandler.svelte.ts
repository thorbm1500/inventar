type rowAmountType = number;
export type OrderType = 'ASC' | 'DESC';
type FilterType = undefined | 'name' | 'last_updated' | 'price' | 'items';

export class Filters {

    readonly uuid: string;

    rowAmount: rowAmountType = $state(15);

    current: FilterType = $state();

    description: boolean = $state(true);
    last_updated: boolean = $state(true);
    price: boolean = $state(true);
    items: boolean = $state(true);

    initialDescription: boolean = $state(this.description);
    initialLast_updated: boolean = $state(this.last_updated);
    initialPrice: boolean = $state(this.price);
    initialItems: boolean = $state(this.items);

    order: OrderType = $state('DESC');

    unsavedChanges: boolean = $derived(this.description !== this.initialDescription
        && this.last_updated !== this.initialLast_updated
        && this.price !== this.initialPrice
        && this.items !== this.initialItems);

    constructor(uuid: string) {
        this.uuid = uuid;
    }

    update(value: FilterType): void {
        if (this.current === value) {
            if (this.order === 'DESC') {
                this.current = undefined;
                this.order = 'ASC'
            } else {
                this.order = 'DESC';
            }
        } else {
            this.current = value;
            this.order = 'ASC';
        }
    }

    reset(): void {
        this.current = undefined;
        this.order = 'ASC';
    }
}