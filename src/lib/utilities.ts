export function parseTimestamp(timestamp: string): string {
    const diff = (Date.now() - Date.parse(timestamp)) / 1000;

    let response: string = "None";

    if (diff < 86400) {
        if (diff < 60) {
            response = `${Math.round(diff)} seconds ago`;
        } else if (diff < 3600) {
            response = `${Math.round(diff / 60)} minutes ago`;
        } else if (diff < 7200) {
            response = `1 hour ago`;
        } else response = `${Math.round((diff / 60) / 60)} hours ago`
    } else {
        if (diff < 172800) {
            response = `1 day ago`;
        } else {
            response = `${Math.round(((diff / 60) / 60) / 24)} days ago`;
        }
    }

    return response;
}