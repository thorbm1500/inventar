import moment from "moment";

export const DAY_IN_MS = 1000 * 60 * 60 * 24;

export function parseTimestamp(timestamp: number | string | undefined): string {
    if (!timestamp || timestamp === undefined) return 'NaN';
    return moment(new Date(timestamp).toISOString()).fromNow();
}