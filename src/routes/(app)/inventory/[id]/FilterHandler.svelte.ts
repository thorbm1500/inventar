type rowAmountType = number;
export type OrderType = 'ASC' | 'DESC';
export type FilterType = undefined | 'name' | 'last_update' | 'price' | 'amount' | 'part_number';

export class Filters {

    uuid: string = 'none';

    rowAmount: rowAmountType = $state(15);

    current: FilterType = $state();

    description: boolean = $state(true);
    last_updated: boolean = $state(true);
    price: boolean = $state(true);
    amount: boolean = $state(true);
    part_number: boolean = $state(true);

    initialDescription: boolean = $state(this.description);
    initialLast_updated: boolean = $state(this.last_updated);
    initialPrice: boolean = $state(this.price);
    initialAmount: boolean = $state(this.amount);

    order: OrderType = $state('DESC');

    unsavedChanges: boolean = $derived(this.description !== this.initialDescription
        && this.last_updated !== this.initialLast_updated
        && this.price !== this.initialPrice
        && this.amount !== this.initialAmount);

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

    async init(uuid: string): Promise<void> {
        this.uuid = uuid;
        // Load saved filters
    }
}