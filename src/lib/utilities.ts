import moment from "moment";

export const DAY_IN_MS = 1000 * 60 * 60 * 24;

export function parseTimestamp(timestamp: string): string {
    return moment(new Date(timestamp).toISOString()).fromNow();
}