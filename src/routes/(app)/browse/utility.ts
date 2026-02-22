import type {OrderType} from "../inventory/[id]/FilterHandler.svelte.ts";

function getFilterSymbol(filter: OrderType | string): string {
    if (filter === "DESC") {
        return "m19.5 8.25-7.5 7.5-7.5-7.5";
    } else if (filter === "ASC") {
        return "m4.5 15.75 7.5-7.5 7.5 7.5";
    } else return "M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5";
}

export default { getFilterSymbol };