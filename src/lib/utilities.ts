import moment from "moment";

export const DAY_IN_MS = 1000 * 60 * 60 * 24;

export function parseTimestamp(timestamp: number | string | undefined): string {
    return timestamp ? moment(new Date(timestamp).toISOString()).fromNow() : 'NaN';
}